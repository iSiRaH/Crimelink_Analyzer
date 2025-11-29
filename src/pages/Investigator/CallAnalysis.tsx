import { useState, useRef } from 'react';
import { FaUpload, FaFileAlt, FaNetworkWired, FaExclamationTriangle, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { investigatorService } from '../../services/investigatorService';

interface AnalysisResult {
  analysis_id: string;
  status: string;
  timestamp: string;
  file_name: string;
  total_calls: number;
  unique_numbers: string[];
  call_frequency: { [key: string]: number };
  time_pattern: { [key: string]: number };
  common_contacts: Array<{ phone: string; count: number }>;
  network_graph: {
    nodes: Array<{ 
      id: string; 
      label: string; 
      type: string; 
      size: number; 
      centrality: number;
      color?: string;
      incoming_count?: number;
      outgoing_count?: number;
    }>;
    edges: Array<{ 
      source: string; 
      target: string; 
      weight: number; 
      label: string;
      type?: string;
      color?: string;
      arrows?: string;
    }>;
    total_nodes: number;
    total_edges: number;
    density: number;
    main_number?: string;
  };
  criminal_matches: Array<{
    phone: string;
    criminal_id: string;
    name: string;
    nic: string;
    crime_history: Array<{ crime_type: string; date: string; status: string }>;
  }>;
  risk_score: number;
}

function CallAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
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
      setResult(null);
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
      const response = await investigatorService.uploadCallRecords(selectedFile);
      
      // Start polling for results
      setPolling(true);
      pollForResults(response.analysis_id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pollForResults = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts * 2 seconds = 40 seconds timeout

    const poll = async () => {
      try {
        const data = await investigatorService.getCallAnalysisResults(id);
        
        if (data && data.status === 'completed') {
          setResult(data);
          setPolling(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setError('Analysis is taking longer than expected. Please check back later.');
          setPolling(false);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          // Not ready yet, continue polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            setError('Analysis timeout. Please try again.');
            setPolling(false);
          }
        } else {
          setError('Failed to retrieve results');
          setPolling(false);
        }
      }
    };

    poll();
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaNetworkWired className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Call Record Analysis</h1>
            <p className="text-gray-600">Upload PDF call records to analyze patterns and identify criminal connections</p>
          </div>
        </div>

        {/* Upload Section */}
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
                  disabled={uploading || polling}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Processing Status */}
        {polling && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
            <FaSpinner className="animate-spin" />
            <span>Analyzing call records... This may take a few moments.</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-600 text-sm mb-1">Total Calls</div>
              <div className="text-2xl font-bold text-gray-800">{result.total_calls}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-600 text-sm mb-1">Unique Numbers</div>
              <div className="text-2xl font-bold text-gray-800">{result.unique_numbers.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-600 text-sm mb-1">Criminal Matches</div>
              <div className="text-2xl font-bold text-red-600">{result.criminal_matches.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-600 text-sm mb-1">Risk Score</div>
              <div className={`text-2xl font-bold ${getRiskColor(result.risk_score).split(' ')[0]}`}>
                {result.risk_score}/100
              </div>
              <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${getRiskColor(result.risk_score)}`}>
                {getRiskLabel(result.risk_score)}
              </div>
            </div>
          </div>

          {/* Criminal Matches */}
          {result.criminal_matches.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600" />
                Criminal Matches Found
              </h2>
              <div className="space-y-4">
                {result.criminal_matches.map((match, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-600 text-sm">Name:</span>
                        <p className="font-medium">{match.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">NIC:</span>
                        <p className="font-medium">{match.nic}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Phone:</span>
                        <p className="font-medium">{match.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Criminal ID:</span>
                        <p className="font-medium">{match.criminal_id}</p>
                      </div>
                    </div>
                    {match.crime_history && match.crime_history.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-sm">Crime History:</span>
                        <div className="mt-2 space-y-1">
                          {match.crime_history.map((crime, idx) => (
                            <div key={idx} className="text-sm bg-white p-2 rounded">
                              <span className="font-medium">{crime.crime_type}</span> - {crime.date} ({crime.status})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Contacts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Most Frequent Contacts</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Call Count</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.common_contacts.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm">{contact.count}</td>
                      <td className="px-4 py-3 text-sm">
                        {((contact.count / result.total_calls) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Network Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm">Total Nodes</div>
                <div className="text-2xl font-bold text-gray-800">{result.network_graph.total_nodes}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm">Total Connections</div>
                <div className="text-2xl font-bold text-gray-800">{result.network_graph.total_edges}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-gray-600 text-sm">Network Density</div>
                <div className="text-2xl font-bold text-gray-800">{(result.network_graph.density * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Time Pattern */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Call Activity by Hour</h2>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(result.time_pattern)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([hour, count]) => {
                  const maxCount = Math.max(...Object.values(result.time_pattern));
                  const heightPercent = (count / maxCount) * 100;
                  return (
                    <div key={hour} className="flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t" style={{ height: '100px', display: 'flex', alignItems: 'flex-end' }}>
                        <div
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{hour}:00</div>
                      <div className="text-xs text-gray-500">{count}</div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Network Visualization */}
          {result.network_graph.nodes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Communication Network Web</h2>
              <div className="mb-4 flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <span>Main Number (Center): {result.network_graph.main_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <span>Incoming Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span>Outgoing Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <span>Both Directions</span>
                </div>
              </div>
              
              {/* SVG Network Visualization */}
              <div className="border rounded-lg p-4 bg-gray-50 overflow-x-auto">
                <svg width="800" height="600" viewBox="0 0 800 600" className="mx-auto">
                  <defs>
                    <marker id="arrowIncoming" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                    </marker>
                    <marker id="arrowOutgoing" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                    </marker>
                  </defs>
                  
                  {/* Draw edges first (behind nodes) */}
                  {result.network_graph.edges.map((edge, index) => {
                    const sourceNode = result.network_graph.nodes.find(n => n.id === edge.source);
                    const targetNode = result.network_graph.nodes.find(n => n.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return null;
                    
                    // Calculate positions for circular layout
                    const mainIndex = result.network_graph.nodes.findIndex(n => n.type === 'main');
                    const sourceIndex = result.network_graph.nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = result.network_graph.nodes.findIndex(n => n.id === edge.target);
                    
                    let x1, y1, x2, y2;
                    
                    if (sourceIndex === mainIndex) {
                      // Main node at center
                      x1 = 400;
                      y1 = 300;
                      const angle = (2 * Math.PI * (targetIndex - 1)) / (result.network_graph.nodes.length - 1);
                      const radius = 200;
                      x2 = 400 + radius * Math.cos(angle);
                      y2 = 300 + radius * Math.sin(angle);
                    } else if (targetIndex === mainIndex) {
                      // Main node at center
                      x2 = 400;
                      y2 = 300;
                      const angle = (2 * Math.PI * (sourceIndex - 1)) / (result.network_graph.nodes.length - 1);
                      const radius = 200;
                      x1 = 400 + radius * Math.cos(angle);
                      y1 = 300 + radius * Math.sin(angle);
                    } else {
                      return null;
                    }
                    
                    return (
                      <line 
                        key={`edge-${index}`}
                        x1={x1} y1={y1} 
                        x2={x2} y2={y2}
                        stroke={edge.color}
                        strokeWidth={Math.min(edge.weight / 2, 4)}
                        opacity="0.6"
                        markerEnd={edge.type === 'incoming' ? 'url(#arrowIncoming)' : 'url(#arrowOutgoing)'}
                      />
                    );
                  })}
                  
                  {/* Draw nodes */}
                  {result.network_graph.nodes.map((node, index) => {
                    let x, y;
                    
                    if (node.type === 'main') {
                      // Main node at center
                      x = 400;
                      y = 300;
                    } else {
                      // Other nodes in circular layout
                      const total = result.network_graph.nodes.length - 1;
                      const angle = (2 * Math.PI * (index - 1)) / total;
                      const radius = 200;
                      x = 400 + radius * Math.cos(angle);
                      y = 300 + radius * Math.sin(angle);
                    }
                    
                    return (
                      <g key={node.id}>
                        {/* Node circle */}
                        <circle 
                          cx={x} cy={y} 
                          r={node.size / 2} 
                          fill={node.color}
                          stroke="white"
                          strokeWidth={node.type === 'main' ? 3 : 2}
                        />
                        
                        {/* Phone number label */}
                        <text 
                          x={x} y={y + (node.size / 2) + 15} 
                          textAnchor="middle" 
                          fontSize="11"
                          fill="#374151"
                          fontWeight={node.type === 'main' ? 'bold' : 'normal'}
                        >
                          {node.label}
                        </text>
                        
                        {/* Call counts for non-main nodes */}
                        {node.type !== 'main' && (node.incoming_count || node.outgoing_count) && (
                          <text 
                            x={x} y={y + (node.size / 2) + 28} 
                            textAnchor="middle" 
                            fontSize="9"
                            fill="#6b7280"
                          >
                            {node.incoming_count && node.incoming_count > 0 && `↓${node.incoming_count}`}
                            {node.incoming_count && node.incoming_count > 0 && node.outgoing_count && node.outgoing_count > 0 && ' '}
                            {node.outgoing_count && node.outgoing_count > 0 && `↑${node.outgoing_count}`}
                          </text>
                        )}
                        
                        {/* Main label */}
                        {node.type === 'main' && (
                          <text 
                            x={x} y={y + 5} 
                            textAnchor="middle" 
                            fontSize="10"
                            fill="white"
                            fontWeight="bold"
                          >
                            MAIN
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p><strong>Legend:</strong></p>
                <p>• The main number (MSISON: {result.network_graph.main_number}) is at the center</p>
                <p>• Green lines = Incoming calls (from other numbers TO main)</p>
                <p>• Red lines = Outgoing calls (from main TO other numbers)</p>
                <p>• Line thickness indicates call frequency</p>
                <p>• Numbers below contacts show: ↓ incoming count, ↑ outgoing count</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
            <FaCheckCircle />
            <span>Analysis completed successfully. Analysis ID: {result.analysis_id}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default CallAnalysis;