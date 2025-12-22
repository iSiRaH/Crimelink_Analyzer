import { useState, useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import { FaUpload, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    size: number;
    color: string;
    call_count?: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    call_count: number;
    label: string;
    color: string;
    width: number;
  }>;
}

interface Analysis {
  pdf_filename: string;
  main_number: string;
  total_calls: number;
  total_incoming: number;
  total_outgoing: number;
  incoming_graph: GraphData;
  outgoing_graph: GraphData;
  risk_score: number;
  criminal_matches: Array<{
    phone: string;
    name: string;
    nic: string;
    crime_history: string[];
  }>;
}

function CallAnalysisNew() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [callCountFilter, setCallCountFilter] = useState(1);

  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingCyRef = useRef<cytoscape.Core | null>(null);
  const outgoingCyRef = useRef<cytoscape.Core | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch("http://localhost:5001/analyze/batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setAnalyses(data.analyses);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!analyses || !analyses[selectedIndex]) {
      return;
    }

    const analysis = analyses[selectedIndex];

    if (incomingRef.current) {
      renderGraph(
        incomingRef.current,
        analysis.incoming_graph,
        callCountFilter,
        incomingCyRef
      );
    }

    if (outgoingRef.current) {
      renderGraph(
        outgoingRef.current,
        analysis.outgoing_graph,
        callCountFilter,
        outgoingCyRef
      );
    }
  }, [analyses, selectedIndex, callCountFilter]);

  const renderGraph = (
    container: HTMLElement,
    graphData: GraphData,
    minCallCount: number,
    cyRef: React.MutableRefObject<cytoscape.Core | null>
  ) => {
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const filteredEdges = graphData.edges.filter(
      (edge) => edge.call_count >= minCallCount
    );

    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const filteredNodes = graphData.nodes.filter((node) =>
      connectedNodeIds.has(node.id)
    );

    const cy = cytoscape({
      container: container,
      elements: {
        nodes: filteredNodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
          },
          style: {
            "background-color": node.color,
            width: node.size,
            height: node.size,
            label: node.label,
            "font-size": node.type === "main" ? "14px" : "11px",
            "text-valign": "center",
            "text-halign": "center",
            "border-width": node.type === "main" ? 3 : 1,
            "border-color": "#000",
            "text-wrap": "wrap",
            "text-max-width": "100px",
          },
        })),
        edges: filteredEdges.map((edge) => ({
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.label,
          },
          style: {
            "line-color": edge.color,
            "target-arrow-color": edge.color,
            "target-arrow-shape": "triangle",
            width: edge.width,
            label: edge.label,
            "font-size": "11px",
            "text-background-color": "#fff",
            "text-background-opacity": 0.9,
            "text-background-padding": "4px",
            "curve-style": "bezier",
          },
        })),
      },
      layout: {
        name: "concentric",
        concentric: (node: any) => {
          return node.data("id") === graphData.nodes[0]?.id ? 100 : 1;
        },
        levelWidth: () => 2,
        minNodeSpacing: 100,
        animate: false,
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;
  };

  const current = analyses[selectedIndex];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaNetworkWired className="text-blue-600" />
        Call Record Analysis
      </h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Call Records</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF Files
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload one or more PDF files (Max 50 PDFs)
            </p>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading || !files}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
            <FaExclamationTriangle />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {current && (
        <>
          {/* PDF Selector */}
          {analyses.length > 1 && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF:
              </label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              >
                {analyses.map((a, i) => (
                  <option key={i} value={i}>
                    {a.pdf_filename} - {a.main_number} ({a.total_calls} calls)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Main Number</h3>
              <p className="text-xl font-bold text-blue-600">{current.main_number}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Calls</h3>
              <p className="text-xl font-bold">{current.total_calls}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Incoming</h3>
              <p className="text-xl font-bold text-green-600">{current.total_incoming}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Outgoing</h3>
              <p className="text-xl font-bold text-red-600">{current.total_outgoing}</p>
            </div>
          </div>

          {/* Risk Assessment */}
          {current.risk_score > 0 && (
            <div
              className={`rounded-lg shadow p-4 mb-6 ${
                current.risk_score >= 70
                  ? "bg-red-50 border border-red-200"
                  : current.risk_score >= 40
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        current.risk_score >= 70
                          ? "bg-red-600"
                          : current.risk_score >= 40
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${current.risk_score}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold">{current.risk_score}/100</span>
              </div>
              {current.criminal_matches.length > 0 && (
                <p className="text-sm font-medium text-red-700 mt-3">
                  ⚠️ {current.criminal_matches.length} criminal match(es) found
                </p>
              )}
            </div>
          )}

          {/* Call Count Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Call Count: {callCountFilter}+ calls
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={callCountFilter}
              onChange={(e) => setCallCountFilter(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Drag to hide contacts with fewer calls
            </p>
          </div>

          {/* Dual Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-green-700">
                  📞 Incoming Calls
                </h2>
                <p className="text-sm text-gray-600">
                  {current.total_incoming} calls from{" "}
                  {current.incoming_graph.nodes.length - 1} contacts
                </p>
              </div>
              <div ref={incomingRef} style={{ height: "500px" }}></div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-red-700">
                  📤 Outgoing Calls
                </h2>
                <p className="text-sm text-gray-600">
                  {current.total_outgoing} calls to{" "}
                  {current.outgoing_graph.nodes.length - 1} contacts
                </p>
              </div>
              <div ref={outgoingRef} style={{ height: "500px" }}></div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black"></div>
                <span>Main Number</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Incoming Contact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Outgoing Contact</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">123</span>
                <span>Call Count</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 Tip: Use mouse wheel to zoom, drag to pan, drag nodes to rearrange
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default CallAnalysisNew;
