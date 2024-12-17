import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "./ui/alert";

const DebugManageJobs = () => {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState({
    token: null,
    userId: null,
    userRole: null,
    authError: null,
    apiError: null,
    apiResponse: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get auth details
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        setDebugInfo(prev => ({
          ...prev,
          token: token ? 'Present' : 'Missing',
          userId: userId ? 'Present' : 'Missing',
          userRole
        }));

        // Validate auth presence
        if (!token || !userId || userRole !== 'employer') {
          setDebugInfo(prev => ({
            ...prev,
            authError: 'Missing required auth credentials'
          }));
          setLoading(false);
          return;
        }

        // Test API connection
        const response = await fetch(`/api/jobs/employer/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'API request failed');
        }

        setDebugInfo(prev => ({
          ...prev,
          apiResponse: 'Success',
          apiError: null
        }));

      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          apiError: error.message
        }));
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Info</h1>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Auth Status */}
          <Alert className={debugInfo.authError ? "border-red-500" : "border-green-500"}>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Token:</strong> {debugInfo.token}</p>
                <p><strong>User ID:</strong> {debugInfo.userId}</p>
                <p><strong>User Role:</strong> {debugInfo.userRole}</p>
                {debugInfo.authError && (
                  <p className="text-red-500">Error: {debugInfo.authError}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* API Status */}
          {(debugInfo.apiResponse || debugInfo.apiError) && (
            <Alert className={debugInfo.apiError ? "border-red-500" : "border-green-500"}>
              <AlertDescription>
                <div className="space-y-2">
                  <h2 className="font-semibold">API Status</h2>
                  {debugInfo.apiResponse && (
                    <p className="text-green-600">API Connection: {debugInfo.apiResponse}</p>
                  )}
                  {debugInfo.apiError && (
                    <p className="text-red-500">API Error: {debugInfo.apiError}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugManageJobs;