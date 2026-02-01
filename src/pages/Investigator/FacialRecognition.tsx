import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, AlertCircle, CheckCircle, User, Calendar, FileText, 
  TrendingUp, X, ZoomIn, Shield, Clock, Camera
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

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
  criminal_id: string | number;
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
  face_detected: boolean;
  face_quality: string;
  processing_time_ms: number;
  timestamp: string;
}

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = 'http://localhost:5002';

// ============================================================================
// Helper Functions
// ============================================================================

const getConfidenceStyles = (level: string) => {
  switch (level) {
    case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
    case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'low': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getRiskStyles = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'critical': return 'text-red-400 bg-red-500/20 border-red-500';
    case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500';
    case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500';
    case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
  }
};

const getQualityStyles = (quality: string) => {
  switch (quality) {
    case 'excellent': return 'text-emerald-400';
    case 'high': return 'text-green-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

// ============================================================================
// Components
// ============================================================================

interface ImagePreviewModalProps {
  imageUrl: string;
  name: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, name, onClose }) => (
  <div 
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div className="relative max-w-4xl max-h-[90vh]">
      <button
        onClick={onClose}
        className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      <img 
        src={imageUrl} 
        alt={name}
        className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="text-center text-white mt-4 text-lg font-medium">{name}</p>
    </div>
  </div>
);

interface MatchCardProps {
  match: MatchResult;
  onImageClick: (url: string, name: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onImageClick }) => (
  <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-red-500/30 hover:border-red-500/50 transition-all">
    {/* Header with similarity */}
    <div className="bg-gradient-to-r from-red-900/40 to-orange-900/30 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Criminal Photo */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => match.photo_url && onImageClick(match.photo_url, match.name)}
          >
            {match.photo_url ? (
              <img 
                src={match.photo_url} 
                alt={match.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-red-500/50 group-hover:border-red-400 transition-colors"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
                <User className="w-10 h-10 text-gray-500" />
              </div>
            )}
            {match.photo_url && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          {/* Criminal Info */}
          <div>
            <h3 className="text-xl font-bold text-white">{match.name}</h3>
            <p className="text-gray-400 text-sm">NIC: {match.nic}</p>
            <p className="text-gray-500 text-xs mt-1">ID: {match.criminal_id}</p>
          </div>
        </div>
        
        {/* Similarity Score */}
        <div className="text-right">
          <div className="text-4xl font-bold text-red-400">{match.similarity.toFixed(1)}%</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 border ${getConfidenceStyles(match.confidence_level)}`}>
            {match.confidence_level.toUpperCase()} MATCH
          </span>
        </div>
      </div>
    </div>

    {/* Details Section */}
    <div className="p-5 space-y-4">
      {/* Risk Level */}
      {match.risk_level && (
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300">Risk Level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskStyles(match.risk_level)}`}>
            {match.risk_level.toUpperCase()}
          </span>
        </div>
      )}

      {/* Last Seen */}
      {match.last_seen && (
        <div className="flex items-center gap-3 text-gray-300">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span>Last Seen:</span>
          <span className="text-white">{new Date(match.last_seen).toLocaleDateString()}</span>
        </div>
      )}

      {/* Crime History */}
      {match.crime_history && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-200">Crime History</span>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Crimes:</span>
                <span className="text-white font-medium">{match.crime_history.total_crimes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Crime:</span>
                <span className="text-white font-medium">
                  {new Date(match.crime_history.last_crime_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {match.crime_history.crime_types?.length > 0 && (
              <div>
                <span className="text-sm text-gray-400">Crime Types:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {match.crime_history.crime_types.map((type, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {match.crime_history.records?.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-300">Recent Records:</span>
                <div className="mt-2 space-y-2">
                  {match.crime_history.records.slice(0, 3).map((record, idx) => (
                    <div key={idx} className="bg-gray-800/70 p-3 rounded border border-gray-700 text-sm">
                      <div className="font-medium text-white">{record.type}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(record.date).toLocaleDateString()} • {record.location}
                      </div>
                      {record.description && (
                        <div className="text-gray-500 text-xs mt-1">{record.description}</div>
                      )}
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
);

// ============================================================================
// Main Component
// ============================================================================

const FacialRecognition: React.FC = () => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(45);
  const [previewModal, setPreviewModal] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG)');
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
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileSelect]);

  const clearImage = useCallback(() => {
    setSelectedFile(null);
    setImagePreview('');
    setResults(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const analyzeImage = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data: AnalysisResponse = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      console.log('First match crime_history:', data.matches?.[0]?.crime_history);
      setResults(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Analysis failed. Make sure the facial recognition service is running.');
      }
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFile, threshold]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Image Preview Modal */}
      {previewModal && (
        <ImagePreviewModal
          imageUrl={previewModal.url}
          name={previewModal.name}
          onClose={() => setPreviewModal(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Facial Recognition Analysis</h1>
          </div>
          <p className="text-gray-400">
            Upload a suspect image to search for matches in the criminal database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${imagePreview 
                  ? 'border-blue-500/50 bg-gray-800/30' 
                  : 'border-gray-600 hover:border-blue-500/50 hover:bg-gray-800/30'
                }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
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
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-72 mx-auto rounded-lg shadow-xl border border-gray-700"
                  />
                  <p className="text-sm text-gray-400">{selectedFile?.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <Upload className="w-16 h-16 mx-auto text-gray-500" />
                  <div>
                    <p className="text-lg font-medium text-gray-300">
                      Drop image here or click to upload
                    </p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Threshold Slider */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">
                  Similarity Threshold
                </label>
                <span className="text-2xl font-bold text-blue-400">{threshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                  [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-500 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-blue-400 [&::-webkit-slider-thumb]:transition-colors"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>More matches (30%)</span>
                <span>Stricter (90%)</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Lower threshold finds more potential matches but may include false positives.
              </p>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeImage}
              disabled={!selectedFile || analyzing}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
                ${!selectedFile || analyzing
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25'
                }`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing Face...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Analyze Image
                </span>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-400">Error</p>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {results && (
              <>
                {/* Results Summary */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {results.processing_time_ms.toFixed(0)}ms
                    </div>
                  </div>

                  {/* Face Quality */}
                  {results.face_detected && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <span className="text-gray-400">Face Quality:</span>
                      <span className={`font-medium capitalize ${getQualityStyles(results.face_quality)}`}>
                        {results.face_quality}
                      </span>
                    </div>
                  )}

                  {/* Match Status */}
                  {results.found_matches ? (
                    <div className="flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-6 h-6" />
                      <div>
                        <p className="font-semibold text-lg">
                          {results.match_count} {results.match_count === 1 ? 'Match' : 'Matches'} Found
                        </p>
                        <p className="text-sm text-gray-400">
                          Threshold: {threshold}% or higher
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                      <div>
                        <p className="font-semibold text-lg">No Matches Found</p>
                        <p className="text-sm text-gray-400">
                          {results.face_detected 
                            ? `No criminals matched above ${threshold}% similarity`
                            : 'No face detected in the image'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Cards */}
                {results.matches.map((match) => (
                  <MatchCard
                    key={match.criminal_id}
                    match={match}
                    onImageClick={(url, name) => setPreviewModal({ url, name })}
                  />
                ))}
              </>
            )}

            {/* Empty State */}
            {!results && !analyzing && (
              <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700/50">
                <User className="w-20 h-20 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 text-lg">
                  Upload an image and click analyze to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialRecognition;
