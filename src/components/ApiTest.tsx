import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ApiStatus {
  status: string;
  message: string;
}

interface TestResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<ApiStatus | null>(null);
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.healthCheck();
      setHealthStatus(data);
    } catch (err) {
      setError('Failed to connect to backend API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.test();
      setTestData(data);
    } catch (err) {
      setError('Failed to test endpoint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">API Connection Test</h2>
      
      {/* Health Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Health Check</h3>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {healthStatus && (
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-700">
              <strong>Status:</strong> {healthStatus.status}
            </p>
            <p className="text-green-700">
              <strong>Message:</strong> {healthStatus.message}
            </p>
          </div>
        )}
        <button
          onClick={checkHealth}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Health Check
        </button>
      </div>

      {/* Test Endpoint */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Endpoint</h3>
        {testData && (
          <div className="bg-blue-50 p-3 rounded mb-3">
            <p className="text-blue-700">
              <strong>Success:</strong> {testData.success ? 'Yes' : 'No'}
            </p>
            <p className="text-blue-700">
              <strong>Message:</strong> {testData.message}
            </p>
            <p className="text-blue-700">
              <strong>Timestamp:</strong> {new Date(testData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
        <button
          onClick={testEndpoint}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test API Call
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Make sure your Spring Boot backend is running on port 8080</li>
          <li>The frontend is configured to proxy /api requests to the backend</li>
          <li>Click the buttons above to test the API connection</li>
        </ol>
      </div>
    </div>
  );
}

export default ApiTest;
