import ApiTest from '../components/ApiTest';

function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">API Testing Page</h1>
        <ApiTest />
      </div>
    </div>
  );
}

export default TestPage;
