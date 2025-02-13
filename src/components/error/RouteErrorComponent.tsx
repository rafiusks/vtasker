interface RouteErrorComponentProps {
  error: unknown;
}

export const RouteErrorComponent = ({ error }: RouteErrorComponentProps) => {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}; 