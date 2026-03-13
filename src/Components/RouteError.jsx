import { Link } from "react-router-dom";

const RouteError = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or was moved.
        </p>
        <a
          href="/"
          className="inline-block mt-6 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default RouteError;
