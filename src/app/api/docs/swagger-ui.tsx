'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues and reduce bundle size
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-96 bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Swagger UI...</p>
      </div>
    </div>
  ),
});

export default function SwaggerUIComponent() {
  const [spec, setSpec] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isAuthConfigured, setIsAuthConfigured] = useState(false);

  const fetchSpec = async (username?: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      // Only add auth if credentials are provided
      if (username && password) {
        const authCredentials = btoa(`${username}:${password}`);
        headers['Authorization'] = `Basic ${authCredentials}`;
      }
      
      const response = await fetch('/api/schema', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        
        if (response.status === 401) {
          setError('Authentication required. Please enter your API credentials below.');
          setIsAuthConfigured(false);
        } else if (response.status === 500) {
          setError(`Server error: ${errorData.message || 'Failed to generate API schema'}`);
        } else {
          setError(`Failed to fetch API documentation: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = await response.json() as object;
      setSpec(data);
      setIsAuthConfigured(true);
    } catch (err) {
      setError('Failed to load API documentation. Please check your network connection.');
      console.error('Error fetching OpenAPI spec:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to fetch without credentials first (in case auth is disabled)
    fetchSpec();
  }, []);

  const handleRetry = () => {
    if (credentials.username && credentials.password) {
      fetchSpec(credentials.username, credentials.password);
    } else {
      fetchSpec();
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      fetchSpec(credentials.username, credentials.password);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading API Documentation...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">🔐</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-2">{error}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 rounded-lg">
              <p className="font-medium mb-1">For development:</p>
              <p>Username: <code className="bg-gray-200 px-1 rounded">demo_user</code></p>
              <p>Password: <code className="bg-gray-200 px-1 rounded">demo_pass</code></p>
              <p className="mt-2 text-xs">Check your .dev.vars file for current credentials</p>
              <button
                type="button"
                onClick={() => setCredentials({ username: 'demo_user', password: 'demo_pass' })}
                className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Quick-fill dev credentials
              </button>
            </div>
          )}
          
          {!isAuthConfigured && (
            <form onSubmit={handleAuth} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Load Documentation
              </button>
            </form>
          )}
          
          <div className="space-x-3">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-600 text-6xl mb-4">📋</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            No API Schema Available
          </h1>
          <p className="text-gray-600 mb-6">
            The API schema could not be loaded. Please try refreshing the page.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load Schema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-800 text-white px-6 py-4 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">TownOfUs.pl API Documentation</h1>
          <p className="text-gray-300 mt-1">
            REST API for the Polish Among Us community website
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <SwaggerUI
          spec={spec}
          deepLinking={true}
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          displayRequestDuration={true}
          tryItOutEnabled={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          requestInterceptor={(request) => {
            // Add authentication headers if credentials are available
            if (credentials.username && credentials.password) {
              const authCredentials = btoa(`${credentials.username}:${credentials.password}`);
              request.headers.Authorization = `Basic ${authCredentials}`;
            }
            
            // Log requests for debugging (remove in production if needed)
            if (process.env.NODE_ENV === 'development') {
              console.log('API Request:', request.url, request.method);
            }
            return request;
          }}
          responseInterceptor={(response) => {
            // Log responses for debugging (remove in production if needed)
            if (process.env.NODE_ENV === 'development') {
              console.log('API Response:', response.url, response.status);
            }
            return response;
          }}
          onComplete={() => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Swagger UI loaded successfully');
            }
          }}
        />
      </div>
    </div>
  );
}