import React, { useState, useEffect } from "react";
import {
  getCsrfToken,
  clearCsrfToken,
  refreshCsrfToken,
} from "../api/csrfService";

const CSRFDebug = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const csrfToken = await getCsrfToken();
      setToken(csrfToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const csrfToken = await refreshCsrfToken();
      setToken(csrfToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    clearCsrfToken();
    setToken(null);
    setError(null);
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="text-lg font-semibold mb-2">CSRF Debug</h3>

      <div className="mb-2">
        <strong>Token:</strong>
        <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-1 break-all">
          {loading ? "Loading..." : token || "No token"}
        </div>
      </div>

      {error && (
        <div className="mb-2">
          <strong>Error:</strong>
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1">
            {error}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={fetchToken}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Fetch
        </button>
        <button
          onClick={refreshToken}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
        >
          Refresh
        </button>
        <button
          onClick={clearToken}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CSRFDebug;
