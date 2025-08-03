import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTimeUntilExpiry, getStoredToken } from "../utils/jwtUtils";

const TokenExpiryWarning = () => {
  const { user, logout, tokenExpiring } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user || !tokenExpiring) {
      setShowWarning(false);
      return;
    }

    setShowWarning(true);

    const updateTimeLeft = () => {
      const token = getStoredToken();
      if (!token) {
        setShowWarning(false);
        return;
      }

      const minutes = getTimeUntilExpiry(token);
      setTimeLeft(minutes);

      if (minutes <= 0) {
        setShowWarning(false);
        logout();
      }
    };

    updateTimeLeft();

    const interval = setInterval(updateTimeLeft, 30000);

    return () => clearInterval(interval);
  }, [user, tokenExpiring, logout]);

  const handleExtendSession = async () => {
    setShowWarning(false);
  };

  const handleLogoutNow = () => {
    logout();
  };

  if (!showWarning || !timeLeft) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Session Expiring Soon</p>
            <p className="text-sm">
              Your session will expire in {timeLeft} minute
              {timeLeft !== 1 ? "s" : ""}. Save your work to avoid losing data.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExtendSession}
            className="px-3 py-1 bg-black text-yellow-500 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogoutNow}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={() => setShowWarning(false)}
            className="p-1 hover:bg-yellow-600 rounded transition-colors"
            title="Dismiss warning"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiryWarning;
