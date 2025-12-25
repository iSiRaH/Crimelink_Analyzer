import React, { useState, useEffect, useRef, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { FaUpload, FaFileAlt, FaNetworkWired, FaExclamationTriangle, FaSpinner, FaTrash } from 'react-icons/fa';
import { CallAnalysisPDFButton } from './CallAnalysisPDF';

interface GraphData {
  nodes: Array<{ 
    id: string; 
    label: string; 
    type: string; 
    size?: number;
    color?: string;
    call_count?: number;
  }>;
  edges: Array<{ 
    source: string; 
    target: string; 
    call_count: number;
    label?: string;
    color?: string;
    width?: number;
  }>;
  total_nodes: number;
  total_edges: number;
}
interface AnalysisResult {
  pdf_filename: string;
  main_number: string;
  total_calls: number
  total_incoming: number;
  total_outgoing: number;
  unique_numbers: string[];
  common_contacts: Array<{ phone: string; count: number }>;
  call_frequency: Record<string, number>;
  incoming_graph: GraphData;
  outgoing_graph: GraphData;
  criminal_matches: Array<{
    phone: string;
    criminal_id: string;
    name: string;
    nic: string;
    crime_history: Array<{ crime_type: string; date: string; status: string }>;
  }>;
  risk_score: number;
  location_analysis?: {
    gap_minutes?: number;
    locations?: Array<{
      location: string;
      start: string;
      end: string;
      count: number;
    }>;
  };

}
interface CombinedGraphData {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
}

function CallAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('files', selectedFile);

      const response = await fetch('http://localhost:5001/analyze/batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze PDF');
      }

      const data = await response.json();
      
      console.log('Analysis response:', data);
      
      if (data.analyses && data.analyses.length > 0) {
        const newResult = data.analyses[0];
        console.log('Adding result with main number:', newResult.main_number);
        setResults(prev => [...prev, newResult]);
        setSelectedFile(null);
      } else {
        throw new Error('No analysis results returned');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = () => {
    setResults([]);
    setSelectedFile(null);
    setError(null);
  };

  // Memoized combined graph data - merges all PDFs into single incoming/outgoing graphs
  const combinedGraphs = useMemo(() => {
    if (results.length === 0) return null;

    // Track all contacts across PDFs to identify shared contacts
    const incomingContactCounts = new Map<string, Set<string>>(); // contact -> Set of main_numbers
    const outgoingContactCounts = new Map<string, Set<string>>();

    // First pass: Count how many different main numbers each contact appears with
    results.forEach(result => {
      result.incoming_graph.edges.forEach(edge => {
        const contact = edge.source; // Who called the main number
        if (contact !== result.main_number) {
          if (!incomingContactCounts.has(contact)) {
            incomingContactCounts.set(contact, new Set());
          }
          incomingContactCounts.get(contact)!.add(result.main_number);
        }
      });

      result.outgoing_graph.edges.forEach(edge => {
        const contact = edge.target; // Who was called by main number
        if (contact !== result.main_number) {
          if (!outgoingContactCounts.has(contact)) {
            outgoingContactCounts.set(contact, new Set());
          }
          outgoingContactCounts.get(contact)!.add(result.main_number);
        }
      });
    });

    // Build combined incoming graph
    const incomingNodes = new Map<string, cytoscape.NodeDefinition>();
    const incomingEdges: cytoscape.EdgeDefinition[] = [];

    results.forEach((result, pdfIndex) => {
      // Add main number node with unique color per PDF
      const mainNodeId = `main_${result.main_number}`;
      if (!incomingNodes.has(mainNodeId)) {
        incomingNodes.set(mainNodeId, {
          data: {
            id: mainNodeId,
            label: result.main_number.slice(-4), // Last 4 digits
            fullNumber: result.main_number,
            type: 'main',
            pdfIndex,
            pdfName: result.pdf_filename
          }
        });
      }

      // Add contact nodes and edges
      result.incoming_graph.nodes.forEach(node => {
        if (node.type !== 'main') {
          const contactId = `contact_${node.id}`;
          const isShared = incomingContactCounts.get(node.id)!.size > 1;
          
          if (!incomingNodes.has(contactId)) {
            incomingNodes.set(contactId, {
              data: {
                id: contactId,
                label: node.label.slice(-4),
                fullNumber: node.id,
                type: isShared ? 'shared_contact' : 'contact',
                callCount: node.call_count || 0,
                sharedWith: Array.from(incomingContactCounts.get(node.id)!)
              }
            });
          }
        }
      });

      result.incoming_graph.edges.forEach(edge => {
        const isShared = incomingContactCounts.get(edge.source)!.size > 1;
        incomingEdges.push({
          data: {
            id: `edge_in_${edge.source}_${result.main_number}_${pdfIndex}`,
            source: `contact_${edge.source}`,
            target: mainNodeId,
            label: `${edge.call_count}`,
            callCount: edge.call_count,
            edgeType: isShared ? 'shared' : 'normal',
            pdfIndex
          }
        });
      });
    });

    // Build combined outgoing graph
    const outgoingNodes = new Map<string, cytoscape.NodeDefinition>();
    const outgoingEdges: cytoscape.EdgeDefinition[] = [];

    results.forEach((result, pdfIndex) => {
      const mainNodeId = `main_${result.main_number}`;
      if (!outgoingNodes.has(mainNodeId)) {
        outgoingNodes.set(mainNodeId, {
          data: {
            id: mainNodeId,
            label: result.main_number.slice(-4),
            fullNumber: result.main_number,
            type: 'main',
            pdfIndex,
            pdfName: result.pdf_filename
          }
        });
      }

      result.outgoing_graph.nodes.forEach(node => {
        if (node.type !== 'main') {
          const contactId = `contact_${node.id}`;
          const isShared = outgoingContactCounts.get(node.id)!.size > 1;
          
          if (!outgoingNodes.has(contactId)) {
            outgoingNodes.set(contactId, {
              data: {
                id: contactId,
                label: node.label.slice(-4),
                fullNumber: node.id,
                type: isShared ? 'shared_contact' : 'contact',
                callCount: node.call_count || 0,
                sharedWith: Array.from(outgoingContactCounts.get(node.id)!)
              }
            });
          }
        }
      });

      result.outgoing_graph.edges.forEach(edge => {
        const isShared = outgoingContactCounts.get(edge.target)!.size > 1;
        outgoingEdges.push({
          data: {
            id: `edge_out_${result.main_number}_${edge.target}_${pdfIndex}`,
            source: mainNodeId,
            target: `contact_${edge.target}`,
            label: `${edge.call_count}`,
            callCount: edge.call_count,
            edgeType: isShared ? 'shared' : 'normal',
            pdfIndex
          }
        });
      });
    });

    return {
      incoming: {
        nodes: Array.from(incomingNodes.values()),
        edges: incomingEdges
      },
      outgoing: {
        nodes: Array.from(outgoingNodes.values()),
        edges: outgoingEdges
      }
    };
  }, [results]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaNetworkWired className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Call Record Analysis</h1>
              <p className="text-gray-600">Upload PDF call records to analyze patterns</p>
            </div>
          </div>
          {results.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <FaTrash />
              Clear All
            </button>
          )}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
          />
          
          {!selectedFile ? (
            <div className="space-y-4">
              <FaUpload className="text-5xl text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 mb-2">Upload call record PDF file</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Select File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FaFileAlt className="text-5xl text-blue-600 mx-auto" />
              <div>
                <p className="text-gray-800 font-medium">{selectedFile.name}</p>
                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Change File
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
            <FaSpinner className="animate-spin" />
            <span>Analyzing call records... This may take a few moments.</span>
          </div>
        )}
      </div>
      

      {results.length > 0 && combinedGraphs && (
        
        <div className="space-y-6">
          
          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-gray-600">PDFs Analyzed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {results.reduce((sum, r) => sum + r.total_calls, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Calls</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.reduce((sum, r) => sum + r.total_incoming, 0)}
                </div>
                <div className="text-sm text-gray-600">Incoming Calls</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results.reduce((sum, r) => sum + r.total_outgoing, 0)}
                </div>
                <div className="text-sm text-gray-600">Outgoing Calls</div>
              </div>
            </div>
            {/* PDF List */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Analyzed Files:</h3>
              <div className="flex flex-wrap gap-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getPdfColor(index) }}
                    />
                    <span className="font-medium">{result.main_number}</span>
                    <span className="text-gray-500">({result.pdf_filename})</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-8 mt-6">
                <div className="flex items-center gap-3">
                  <FaNetworkWired className="text-3xl text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Call Record Analysis</h1>
                    <p className="text-gray-600">Download PDF call records to analyze patterns</p>
                  </div>
                </div>
              </div>

            {/* Add PDF Download Button */}
              <div className="mb-4">
                <CallAnalysisPDFButton results={results} />
              </div>
          </div>
        </div>

          {/* Combined Network Graphs */}
          <CombinedNetworkGraphs 
            incomingData={combinedGraphs.incoming}
            outgoingData={combinedGraphs.outgoing}
          /> 
          {/* Location Time Periods as LAST SECTION */}
          <LocationTimePeriods results={results} />
          
        </div>
      )}
      
    </div>
    
  );
}

// Color palette for different PDFs (industry standard: ColorBrewer qualitative palette)
const getPdfColor = (index: number): string => {
  const colors = [
    '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', 
    '#ffff33', '#a65628', '#f781bf', '#999999','#2563eb', // blue
    '#16a34a', // green
    '#dc2626', // red
    '#7c3aed', // purple
    '#ea580c', // orange
    '#0891b2', // cyan
    '#0f172a', // slate
    '#be185d',
  ];
  return colors[index % colors.length];
};

// Combined Network Graphs Component - Shows merged incoming/outgoing from all PDFs
interface CombinedNetworkGraphsProps {
  incomingData: CombinedGraphData;
  outgoingData: CombinedGraphData;
}

function CombinedNetworkGraphs({ incomingData, outgoingData }: CombinedNetworkGraphsProps) {
  const incomingGraphRef = useRef<HTMLDivElement>(null);
  const outgoingGraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!incomingGraphRef.current || !outgoingGraphRef.current) return;

    let cyIncoming: cytoscape.Core | null = null;
    let cyOutgoing: cytoscape.Core | null = null;

    setTimeout(() => {
      if (!incomingGraphRef.current || !outgoingGraphRef.current) return;

      // Incoming Combined Graph
      cyIncoming = cytoscape({
        container: incomingGraphRef.current,
        elements: [...incomingData.nodes, ...incomingData.edges],
        style: [
          // Main numbers - each PDF gets unique color
          {
            selector: 'node[type="main"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'color': '#fff',
              'text-outline-width': '2px',
              'text-outline-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
              'background-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
              'width': '60px',
              'height': '60px',
              'border-width': '3px',
              'border-color': '#03091bcb',
              'font-weight': 'bold'
            }
          },
          // Regular contacts
          {
            selector: 'node[type="contact"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'color': '#fff',
              'text-outline-color': '#2563eb',
              'text-outline-width': '2px',
              'background-color': '#22c55e',
              'width': '40px',
              'height': '40px'
            }
          },
          // Shared contacts (appear in multiple PDFs) - special styling
          {
            selector: 'node[type="shared_contact"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'color': '#fff',
              'text-outline-color': '#f59e0b',
              'text-outline-width': '3px',
              'background-color': '#f59e0b',
              'width': '45px',
              'height': '45px',
              'border-width': '3px',
              'border-color': '#d97706',
              'border-style': 'double'
            }
          },
          // Normal edges
          {
            selector: 'edge[edgeType="normal"]',
            style: {
              'width': 'data(callCount)',
              'line-color': '#22c55e',
              'target-arrow-color': '#22c55e',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '15px',
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px'
            }
          },
          // Shared edges (dotted line for cross-PDF connections)
          {
            selector: 'edge[edgeType="shared"]',
            style: {
              'width': 'data(callCount)',
              'line-color': '#f59e0b',
              'target-arrow-color': '#f59e0b',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'line-style': 'dashed',
              'line-dash-pattern': [6, 3],
              'label': 'data(label)',
              'font-size': '9px',
              'font-weight': 'bold',
              'text-background-color': '#fef3c7',
              'text-background-opacity': 0.95,
              'text-background-padding': '3px'
            }
          }
        ],
        layout: {
          name: 'concentric',
          concentric: (node: cytoscape.NodeSingular) => node.data('type') === 'main' ? 100 : 0,
          levelWidth: () => 1,
          minNodeSpacing: 100
        }
      });

      // Outgoing Combined Graph
      cyOutgoing = cytoscape({
        container: outgoingGraphRef.current,
        elements: [...outgoingData.nodes, ...outgoingData.edges],
        style: [
          {
            selector: 'node[type="main"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'color': '#fff',
              'text-outline-width': '2px',
              'text-outline-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
              'background-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
              'width': '60px',
              'height': '60px',
              'border-width': '3px',
              'border-color': '#020613ca',
              'font-weight': 'bold'
            }
          },
          {
            selector: 'node[type="contact"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'color': '#fff',
              'text-outline-color': '#dc2626',
              'text-outline-width': '2px',
              'background-color': '#2563eb',
              'width': '40px',
              'height': '40px'
            }
          },
          {
            selector: 'node[type="shared_contact"]',
            style: {
              'label': 'data(fullNumber)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'color': '#fff',
              'text-outline-color': '#f59e0b',
              'text-outline-width': '3px',
              'background-color': '#f59e0b',
              'width': '45px',
              'height': '45px',
              'border-width': '3px',
              'border-color': '#d97706',
              'border-style': 'double'
            }
          },
          {
            selector: 'edge[edgeType="normal"]',
            style: {
              'width': 'data(callCount)',
              'line-color': '#7c3aed',
              'target-arrow-color': '#7c3aed',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '15px',
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px'
            }
          },
          {
            selector: 'edge[edgeType="shared"]',
            style: {
              'width': 'data(callCount)',
              'line-color': '#f59e0b',
              'target-arrow-color': '#f59e0b',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'line-style': 'dashed',
              'line-dash-pattern': [6, 3],
              'label': 'data(label)',
              'font-size': '9px',
              'font-weight': 'bold',
              'text-background-color': '#fef3c7',
              'text-background-opacity': 0.95,
              'text-background-padding': '3px'
            }
          }
        ],
        layout: {
          name: 'concentric',
          concentric: (node: cytoscape.NodeSingular) => node.data('type') === 'main' ? 100 : 0,
          levelWidth: () => 1,
          minNodeSpacing: 100
        }
      });

      // Add tooltips on hover
      [cyIncoming, cyOutgoing].forEach(cy => {
        if (cy) {
          cy.on('mouseover', 'node[type="shared_contact"]', (evt) => {
            const node = evt.target;
            const sharedWith = node.data('sharedWith');
            console.log(`Shared contact: ${node.data('fullNumber')} appears in PDFs with main numbers: ${sharedWith.join(', ')}`);
          });
        }
      });
    }, 100);

    return () => {
      if (cyIncoming) cyIncoming.destroy();
      if (cyOutgoing) cyOutgoing.destroy();
    };
  }, [incomingData, outgoingData]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Combined Network Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Merged visualization of all analyzed PDFs. 
          <span className="font-semibold text-orange-600"> Orange nodes with dashed lines</span> indicate contacts shared across multiple PDFs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Incoming Calls Network</h3>
            <div className="text-sm text-gray-600">
              {incomingData.nodes.length} nodes, {incomingData.edges.length} connections
            </div>
          </div>
          <div 
            ref={incomingGraphRef}
            className="border rounded-lg bg-gray-50"
            style={{ height: '500px', width: '100%' }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium mb-2">Legend:</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getPdfColor(0) }}></div>
              <span>Main Numbers (each PDF has unique color)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Numbers who called the main number</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-700"></div>
              <span>Shared contacts (dotted lines) - appears in multiple PDFs</span>
            </div>
            <p className="mt-2 text-xs">Arrow shows direction, label shows call count</p>
          </div>
        </div>

        {/* Outgoing */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Outgoing Calls Network</h3>
            <div className="text-sm text-gray-600">
              {outgoingData.nodes.length} nodes, {outgoingData.edges.length} connections
            </div>
          </div>
          <div 
            ref={outgoingGraphRef}
            className="border rounded-lg bg-gray-50"
            style={{ height: '500px', width: '100%' }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium mb-2">Legend:</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getPdfColor(0) }}></div>
              <span>Main Numbers (each PDF has unique color)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Numbers called by the main number</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-700"></div>
              <span>Shared contacts (dotted lines) - appears in multiple PDFs</span>
            </div>
            <p className="mt-2 text-xs">Arrow shows direction, label shows call count</p>
          </div>
        </div>
      </div>
    </div>
  );  
}

function LocationTimePeriods({ results }: { results: AnalysisResult[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Location Time Periods</h2>

      <p className="text-sm text-gray-600 mb-4">
        Sessions are split when there is a gap greater than{" "}
      <span className="font-semibold">
        {results[0]?.location_analysis?.gap_minutes ?? 180} minutes
      </span>.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-700 p-3 border-b">
                Main Number
              </th>
              <th className="text-left text-sm font-semibold text-gray-700 p-3 border-b">
                
              </th>
              <th className="text-left text-sm font-semibold text-gray-700 p-3 border-b">
                Location
              </th>
              <th className="text-left text-sm font-semibold text-gray-700 p-3 border-b">
                Time Period
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((r, idx) => {
              const locs = r.location_analysis?.locations ?? [];

              return (
                <React.Fragment key={`pdf-${idx}`}>
                  {/*  PDF/Main Number Header Row */}
                  <tr className="bg-gray-100 border-b">
                    <td className="p-3 text-sm font-bold text-gray-800" colSpan={4}>
                      {r.main_number}{" "}
                      <span className="text-gray-500 font-normal">
                        ({r.pdf_filename})
                      </span>
                    </td>
                  </tr>

                  {/* If no location data */}
                {locs.length === 0 ? (
                    <tr className="border-b">
                      <td className="p-3 text-sm text-gray-500" colSpan={4}>
                        No location data found in this PDF
                      </td>
                    </tr>
              ) : (
                /* Location session rows */
                locs.map((l, j) => (
                    <tr key={`row-${idx}-${j}`} className="border-b hover:bg-gray-50">
                        {/* ↳ indent column under main number */}
                        <td className="p-3 text-sm text-gray-400 font-mono"></td>

                        {/* Session number per PDF */}
                        <td className="p-3 text-sm text-gray-700 font-semibold">
                          {j + 1}
                        </td>

                        <td className="p-3 text-sm text-gray-700">{l.location}</td>

                        <td className="p-3 text-sm text-gray-700">
                          {l.start} - {l.end}
                          <span className="text-gray-500"> ({l.count} records)</span>
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Optional spacer between PDFs */}
                  <tr>
                    <td colSpan={4} className="h-2 bg-white"></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
   );
}

export default CallAnalysis;
