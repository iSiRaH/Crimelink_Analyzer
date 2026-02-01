import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import cytoscape from 'cytoscape';
// @ts-expect-error - no types available for cytoscape-cose-bilkent
import coseBilkent from 'cytoscape-cose-bilkent';
import { 
  FaUpload, FaFileAlt, FaNetworkWired, FaExclamationTriangle, 
  FaSpinner, FaTrash, FaExpand, FaSearchPlus, FaSearchMinus, 
  FaCrosshairs, FaDownload, FaTimes, FaPhoneAlt, FaPhoneVolume
} from 'react-icons/fa';

// Register the cose-bilkent layout
cytoscape.use(coseBilkent);

// ============= Type Definitions =============

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
  total_calls: number;
  total_incoming: number;
  total_outgoing: number;
  unique_numbers: string[];
  common_contacts: Array<{ phone: string; count: number }>;
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
}

interface CombinedGraphData {
  nodes: cytoscape.NodeDefinition[];
  edges: cytoscape.EdgeDefinition[];
}

// ============= Color Palette =============

const getPdfColor = (index: number): string => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
  ];
  return colors[index % colors.length];
};

// ============= Graph Styling =============

const getIncomingGraphStyles = (): cytoscape.StylesheetStyle[] => [
  {
    selector: 'node[type="main"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 8,
      'font-size': '11px',
      'color': '#e5e7eb',
      'text-outline-width': 2,
      'text-outline-color': '#1f2937',
      'background-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
      'width': 70,
      'height': 70,
      'border-width': 4,
      'border-color': '#374151',
      'font-weight': 'bold'
    }
  },
  {
    selector: 'node[type="contact"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': '10px',
      'color': '#fff',
      'text-outline-width': 2,
      'text-outline-color': '#064e3b',
      'background-color': '#10b981',
      'width': 50,
      'height': 50,
      'border-width': 3,
      'border-color': '#34d399'
    }
  },
  {
    selector: 'node[type="shared_contact"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': '11px',
      'color': '#fff',
      'text-outline-width': 2,
      'text-outline-color': '#92400e',
      'background-color': '#fbbf24',
      'width': 58,
      'height': 58,
      'border-width': 4,
      'border-color': '#fcd34d',
      'border-style': 'double',
      'font-weight': 'bold'
    }
  },
  {
    selector: 'edge[edgeType="normal"]',
    style: {
      'width': (ele: cytoscape.EdgeSingular) => Math.min(2 + ele.data('callCount') * 0.6, 10),
      'line-color': '#34d399',
      'target-arrow-color': '#34d399',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '9px',
      'color': '#9ca3af',
      'text-background-color': '#1f2937',
      'text-background-opacity': 0.9,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle'
    }
  },
  {
    selector: 'edge[edgeType="shared"]',
    style: {
      'width': (ele: cytoscape.EdgeSingular) => Math.min(2 + ele.data('callCount') * 0.6, 10),
      'line-color': '#fbbf24',
      'target-arrow-color': '#fbbf24',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'line-style': 'dashed',
      'line-dash-pattern': [6, 3],
      'label': 'data(label)',
      'font-size': '10px',
      'color': '#fef3c7',
      'font-weight': 'bold',
      'text-background-color': '#1f2937',
      'text-background-opacity': 0.95,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#fff',
      'border-width': 5
    }
  }
];

const getOutgoingGraphStyles = (): cytoscape.StylesheetStyle[] => [
  {
    selector: 'node[type="main"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 8,
      'font-size': '11px',
      'color': '#e5e7eb',
      'text-outline-width': 2,
      'text-outline-color': '#1f2937',
      'background-color': (ele: cytoscape.NodeSingular) => getPdfColor(ele.data('pdfIndex')),
      'width': 70,
      'height': 70,
      'border-width': 4,
      'border-color': '#374151',
      'font-weight': 'bold'
    }
  },
  {
    selector: 'node[type="contact"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': '10px',
      'color': '#fff',
      'text-outline-width': 2,
      'text-outline-color': '#7f1d1d',
      'background-color': '#f87171',
      'width': 50,
      'height': 50,
      'border-width': 3,
      'border-color': '#fca5a5'
    }
  },
  {
    selector: 'node[type="shared_contact"]',
    style: {
      'label': 'data(label)',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'font-size': '11px',
      'color': '#fff',
      'text-outline-width': 2,
      'text-outline-color': '#92400e',
      'background-color': '#fbbf24',
      'width': 58,
      'height': 58,
      'border-width': 4,
      'border-color': '#fcd34d',
      'border-style': 'double',
      'font-weight': 'bold'
    }
  },
  {
    selector: 'edge[edgeType="normal"]',
    style: {
      'width': (ele: cytoscape.EdgeSingular) => Math.min(2 + ele.data('callCount') * 0.6, 10),
      'line-color': '#f87171',
      'target-arrow-color': '#f87171',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '9px',
      'color': '#9ca3af',
      'text-background-color': '#1f2937',
      'text-background-opacity': 0.9,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle'
    }
  },
  {
    selector: 'edge[edgeType="shared"]',
    style: {
      'width': (ele: cytoscape.EdgeSingular) => Math.min(2 + ele.data('callCount') * 0.6, 10),
      'line-color': '#fbbf24',
      'target-arrow-color': '#fbbf24',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'line-style': 'dashed',
      'line-dash-pattern': [6, 3],
      'label': 'data(label)',
      'font-size': '10px',
      'color': '#fef3c7',
      'font-weight': 'bold',
      'text-background-color': '#1f2937',
      'text-background-opacity': 0.95,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle'
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#fff',
      'border-width': 5
    }
  }
];

// ============= Graph Layout Config =============

const getLayoutConfig = () => ({
  name: 'cose-bilkent',
  quality: 'default',
  nodeDimensionsIncludeLabels: true,
  refresh: 30,
  fit: true,
  padding: 50,
  randomize: true,
  nodeRepulsion: 8500,
  idealEdgeLength: 120,
  edgeElasticity: 0.45,
  nestingFactor: 0.1,
  gravity: 0.25,
  numIter: 2500,
  tile: true,
  animate: false,
  gravityRange: 3.8
});

// ============= Tooltip Component =============

interface TooltipProps {
  content: string;
  position: { x: number; y: number } | null;
}

function Tooltip({ content, position }: TooltipProps) {
  if (!position) return null;
  
  return (
    <div 
      className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-gray-100 rounded-lg shadow-xl border border-gray-700 pointer-events-none whitespace-pre-line"
      style={{ 
        left: position.x + 15, 
        top: position.y + 15,
        maxWidth: '300px'
      }}
    >
      {content}
    </div>
  );
}

// ============= Fullscreen Modal Component =============

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  graphData: CombinedGraphData;
  graphType: 'incoming' | 'outgoing';
  pdfResults: AnalysisResult[];
}

function GraphModal({ isOpen, onClose, title, graphData, graphType, pdfResults }: GraphModalProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [tooltip, setTooltip] = useState<{ content: string; position: { x: number; y: number } } | null>(null);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.3);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() / 1.3);
    }
  }, []);

  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  }, []);

  const handleExportPNG = useCallback(() => {
    if (cyRef.current) {
      const png = cyRef.current.png({ 
        output: 'blob', 
        bg: '#111827',
        scale: 2,
        full: true
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, [title]);

  useEffect(() => {
    if (!isOpen || !graphRef.current) return;

    const styles = graphType === 'incoming' ? getIncomingGraphStyles() : getOutgoingGraphStyles();

    const cy = cytoscape({
      container: graphRef.current,
      elements: [...graphData.nodes, ...graphData.edges],
      style: styles,
      layout: getLayoutConfig(),
      minZoom: 0.1,
      maxZoom: 4,
      wheelSensitivity: 0.3
    });

    cyRef.current = cy;

    // Tooltip on hover
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const fullNumber = node.data('fullNumber');
      const type = node.data('type');
      const callCount = node.data('callCount');
      const sharedWith = node.data('sharedWith');
      const pdfName = node.data('pdfName');

      let content = `📞 ${fullNumber}`;
      if (type === 'main') {
        content += `\n📄 ${pdfName}`;
      } else if (type === 'shared_contact') {
        content += `\n🔗 Shared with: ${sharedWith?.join(', ')}`;
        content += `\n📊 ${callCount} calls`;
      } else {
        content += `\n📊 ${callCount} calls`;
      }

      setTooltip({
        content,
        position: { x: evt.originalEvent.clientX, y: evt.originalEvent.clientY }
      });
    });

    cy.on('mouseout', 'node', () => {
      setTooltip(null);
    });

    cy.on('mousemove', 'node', (evt) => {
      setTooltip(prev => prev ? { ...prev, position: { x: evt.originalEvent.clientX, y: evt.originalEvent.clientY } } : null);
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [isOpen, graphData, graphType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-[95vw] h-[90vh] bg-gray-900 rounded-xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-4">
            {graphType === 'incoming' ? (
              <FaPhoneVolume className="text-2xl text-green-500" />
            ) : (
              <FaPhoneAlt className="text-2xl text-red-500" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-100">{title}</h2>
              <p className="text-sm text-gray-400">
                {graphData.nodes.length} nodes • {graphData.edges.length} connections
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
              title="Zoom In"
            >
              <FaSearchPlus />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
              title="Zoom Out"
            >
              <FaSearchMinus />
            </button>
            <button
              onClick={handleFit}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
              title="Fit to Screen"
            >
              <FaCrosshairs />
            </button>
            <div className="w-px h-8 bg-gray-600 mx-2" />
            <button
              onClick={handleExportPNG}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition flex items-center gap-2"
              title="Export as PNG"
            >
              <FaDownload />
              Export PNG
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-gray-700 hover:bg-red-600 text-gray-200 rounded-lg transition ml-2"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative">
          <div 
            ref={graphRef}
            className="absolute inset-0 bg-gray-900"
          />
          <Tooltip content={tooltip?.content || ''} position={tooltip?.position || null} />
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-800">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getPdfColor(0) }} />
              <span className="text-gray-300">Main Numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${graphType === 'incoming' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-gray-300">{graphType === 'incoming' ? 'Callers' : 'Called Numbers'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-300" />
              <span className="text-gray-300">Shared Contacts</span>
            </div>
            {pdfResults.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-600" />
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">PDFs:</span>
                  {pdfResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPdfColor(i) }} />
                      <span className="text-gray-400 text-xs">{r.main_number.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= Network Graph Preview Component =============

interface NetworkGraphPreviewProps {
  graphData: CombinedGraphData;
  graphType: 'incoming' | 'outgoing';
  onExpand: () => void;
}

function NetworkGraphPreview({ graphData, graphType, onExpand }: NetworkGraphPreviewProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!graphRef.current) return;

    const styles = graphType === 'incoming' ? getIncomingGraphStyles() : getOutgoingGraphStyles();

    const timer = setTimeout(() => {
      if (!graphRef.current) return;

      const cy = cytoscape({
        container: graphRef.current,
        elements: [...graphData.nodes, ...graphData.edges],
        style: styles,
        layout: getLayoutConfig(),
        minZoom: 0.2,
        maxZoom: 2,
        wheelSensitivity: 0.3,
        userPanningEnabled: true,
        userZoomingEnabled: true
      });

      cyRef.current = cy;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphData, graphType]);

  return (
    <div className="relative group">
      <div 
        ref={graphRef}
        className="w-full h-[400px] rounded-lg bg-gray-900 border border-gray-700"
      />
      
      {/* Expand Button Overlay */}
      <button
        onClick={onExpand}
        className="absolute top-3 right-3 px-4 py-2 bg-gray-800/90 hover:bg-gray-700 text-gray-200 rounded-lg transition flex items-center gap-2 border border-gray-600 backdrop-blur-sm"
      >
        <FaExpand />
        View Fullscreen
      </button>

      {/* Node count badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gray-800/90 text-gray-300 text-sm rounded-lg border border-gray-600 backdrop-blur-sm">
        {graphData.nodes.length} nodes • {graphData.edges.length} edges
      </div>
    </div>
  );
}

// ============= Main Component =============

function CallAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'incoming' | 'outgoing' }>({ isOpen: false, type: 'incoming' });
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

      // Get JWT token for authenticated request through Spring Boot
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Route through Spring Boot API Gateway
      const response = await fetch('/api/call-analysis/analyze/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze PDF');
      }

      const data = await response.json();
      
      if (data.analyses && data.analyses.length > 0) {
        const newResult = data.analyses[0];
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

  // Memoized combined graph data
  const combinedGraphs = useMemo(() => {
    if (results.length === 0) return null;

    const incomingContactCounts = new Map<string, Set<string>>();
    const outgoingContactCounts = new Map<string, Set<string>>();

    results.forEach(result => {
      result.incoming_graph.edges.forEach(edge => {
        const contact = edge.source;
        if (contact !== result.main_number) {
          if (!incomingContactCounts.has(contact)) {
            incomingContactCounts.set(contact, new Set());
          }
          incomingContactCounts.get(contact)!.add(result.main_number);
        }
      });

      result.outgoing_graph.edges.forEach(edge => {
        const contact = edge.target;
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
      const mainNodeId = `main_${result.main_number}`;
      if (!incomingNodes.has(mainNodeId)) {
        incomingNodes.set(mainNodeId, {
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
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Upload Section */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/50 rounded-xl border border-blue-700">
              <FaNetworkWired className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Call Record Analysis</h1>
              <p className="text-gray-400">Upload PDF call records to analyze communication patterns</p>
            </div>
          </div>
          {results.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 transition flex items-center gap-2 border border-red-700"
            >
              <FaTrash />
              Clear All
            </button>
          )}
        </div>

        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-900/50 hover:bg-gray-900 transition">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf"
            className="hidden"
          />
          
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                <FaUpload className="text-2xl text-gray-400" />
              </div>
              <div>
                <p className="text-gray-400 mb-3">Upload call record PDF file</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium"
                >
                  Select File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-700">
                <FaFileAlt className="text-2xl text-blue-400" />
              </div>
              <div>
                <p className="text-gray-100 font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition border border-gray-600"
                >
                  Change File
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
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
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-400">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center gap-2 text-blue-400">
            <FaSpinner className="animate-spin" />
            <span>Analyzing call records... This may take a few moments.</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && combinedGraphs && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Analysis Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-900/30 rounded-xl border border-blue-800">
                <div className="text-3xl font-bold text-blue-400">{results.length}</div>
                <div className="text-sm text-gray-400 mt-1">PDFs Analyzed</div>
              </div>
              <div className="text-center p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                <div className="text-3xl font-bold text-gray-100">
                  {results.reduce((sum, r) => sum + r.total_calls, 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Total Calls</div>
              </div>
              <div className="text-center p-4 bg-emerald-900/30 rounded-xl border border-emerald-800">
                <div className="text-3xl font-bold text-emerald-400">
                  {results.reduce((sum, r) => sum + r.total_incoming, 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Incoming Calls</div>
              </div>
              <div className="text-center p-4 bg-red-900/30 rounded-xl border border-red-800">
                <div className="text-3xl font-bold text-red-400">
                  {results.reduce((sum, r) => sum + r.total_outgoing, 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Outgoing Calls</div>
              </div>
            </div>

            {/* PDF List */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Analyzed Files:</h3>
              <div className="flex flex-wrap gap-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="px-3 py-2 bg-gray-700 rounded-lg text-sm flex items-center gap-2 border border-gray-600"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getPdfColor(index) }}
                    />
                    <span className="font-medium text-gray-100">{result.main_number}</span>
                    <span className="text-gray-400">({result.pdf_filename})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Network Graphs */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-100">Communication Network Analysis</h2>
              <p className="text-sm text-gray-400 mt-1">
                Visual representation of call patterns. 
                <span className="text-amber-400 font-medium"> Yellow nodes</span> indicate contacts shared across multiple PDFs.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Incoming Network */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-900/50 rounded-lg border border-emerald-700">
                    <FaPhoneVolume className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-100">Incoming Calls Network</h3>
                    <p className="text-xs text-gray-400">Numbers that called the main number</p>
                  </div>
                </div>
                <NetworkGraphPreview 
                  graphData={combinedGraphs.incoming}
                  graphType="incoming"
                  onExpand={() => setModalState({ isOpen: true, type: 'incoming' })}
                />
              </div>

              {/* Outgoing Network */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-900/50 rounded-lg border border-red-700">
                    <FaPhoneAlt className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-100">Outgoing Calls Network</h3>
                    <p className="text-xs text-gray-400">Numbers called by the main number</p>
                  </div>
                </div>
                <NetworkGraphPreview 
                  graphData={combinedGraphs.outgoing}
                  graphType="outgoing"
                  onExpand={() => setModalState({ isOpen: true, type: 'outgoing' })}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Legend:</h4>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getPdfColor(0) }} />
                  <span className="text-gray-400">Main Numbers (unique color per PDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-400" />
                  <span className="text-gray-400">Incoming Callers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-400" />
                  <span className="text-gray-400">Outgoing Contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-300" />
                  <span className="text-gray-400">Shared Contacts (dashed lines)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {combinedGraphs && (
        <GraphModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          title={modalState.type === 'incoming' ? 'Incoming Calls Network' : 'Outgoing Calls Network'}
          graphData={modalState.type === 'incoming' ? combinedGraphs.incoming : combinedGraphs.outgoing}
          graphType={modalState.type}
          pdfResults={results}
        />
      )}
    </div>
  );
}

export default CallAnalysis;
