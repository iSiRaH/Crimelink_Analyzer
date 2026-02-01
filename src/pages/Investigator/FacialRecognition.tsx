import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, User, Calendar, FileText, TrendingUp } from 'lucide-react';

interface CrimeRecord {
  type: string;
  date: string;
  location: string;
  description: string;
}

interface CrimeHistory {
  total_crimes: number;
  last_crime_date: string;
  crime_types: string[];
  records: CrimeRecord[];
}

interface MatchResult {
  criminal_id: number;
  name: string;
  nic: string;
  similarity: number;
  confidence_level: 'high' | 'medium' | 'low';
  crime_history?: CrimeHistory;
  risk_level?: string;
  last_seen?: string;
  photo_url?: string;
}

interface AnalysisResponse {
  analysis_id: number;
  found_matches: boolean;
  match_count: number;
  matches: MatchResult[];
  processing_time_ms: number;
  timestamp: string;
}

const FacialRecognition: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(75);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setResults(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('threshold', threshold.toString());
      
      const userId = localStorage.getItem('userId') || 'unknown';
      formData.append('user_id', userId);

      const response = await fetch('http://localhost:5002/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data: AnalysisResponse = await response.json();
      setResults(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Facial Recognition Analysis</h1>
        <p className="text-gray-600 mt-2">Upload a suspect image to search for matches in the criminal database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="space-y-4">
                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setImagePreview('');
                    setResults(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Drop image here or click to upload</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG (max 5MB)</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Similarity Threshold: {threshold}%
            </label>
            <input
              type="range"
              min="60"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less strict (60%)</span>
              <span>More strict (95%)</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Lower threshold will find more potential matches but may include false positives.
            </p>
          </div>

          <button
            onClick={analyzeImage}
            disabled={!selectedFile || analyzing}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              !selectedFile || analyzing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {analyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : 'Analyze Image'}
          </button>

          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {results && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
                  <span className="text-sm text-gray-500">{results.processing_time_ms.toFixed(0)}ms</span>
                </div>

                {results.found_matches ? (
                  <div className="flex items-center space-x-3 text-red-600">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                      <p className="font-medium">{results.match_count} {results.match_count === 1 ? 'Match' : 'Matches'} Found</p>
                      <p className="text-sm text-gray-600">Threshold: {threshold}% or higher</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-medium">No Matches Found</p>
                      <p className="text-sm text-gray-600">No criminals matched above {threshold}% similarity</p>
                    </div>
                  </div>
                )}
              </div>

              {results.matches.map((match) => (
                <div key={match.criminal_id} className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-red-500">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{match.name}</h3>
                          <p className="text-sm text-gray-600">NIC: {match.nic}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {match.criminal_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600">{match.similarity.toFixed(1)}%</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getConfidenceColor(match.confidence_level)}`}>
                          {match.confidence_level.toUpperCase()} CONFIDENCE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {match.risk_level && (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Risk Level:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(match.risk_level)}`}>
                          {match.risk_level.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {match.last_seen && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Last Seen:</span>
                        <span>{new Date(match.last_seen).toLocaleDateString()}</span>
                      </div>
                    )}

                    {match.crime_history && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Crime History</span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Crimes:</span>
                              <span className="ml-2 font-medium">{match.crime_history.total_crimes}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Last Crime:</span>
                              <span className="ml-2 font-medium">{new Date(match.crime_history.last_crime_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {match.crime_history.crime_types && match.crime_history.crime_types.length > 0 && (
                            <div>
                              <span className="text-sm text-gray-600">Crime Types:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {match.crime_history.crime_types.map((type, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">{type}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {match.crime_history.records && match.crime_history.records.length > 0 && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-700">Recent Records:</span>
                              <div className="mt-2 space-y-2">
                                {match.crime_history.records.slice(0, 3).map((record, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                                    <div className="font-medium text-gray-800">{record.type}</div>
                                    <div className="text-gray-600 text-xs mt-1">{new Date(record.date).toLocaleDateString()} • {record.location}</div>
                                    {record.description && <div className="text-gray-600 text-xs mt-1">{record.description}</div>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {!results && !analyzing && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Upload an image and click analyze to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacialRecognition;
