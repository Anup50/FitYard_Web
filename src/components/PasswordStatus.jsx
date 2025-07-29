import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPasswordStatus } from "../utils/passwordApi";
import { useAuth } from "../context/AuthContext";

const PasswordStatus = ({ showDetails = true, className = "" }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPasswordStatus = async () => {
      if (!isAuthenticated() || !user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPasswordStatus(user._id);
        setPasswordStatus(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch password status:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPasswordStatus();
  }, [user, isAuthenticated]);

  if (!isAuthenticated() || loading) {
    return showDetails ? (
      <div className={`password-status-container ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ) : null;
  }

  if (error || !passwordStatus) {
    return showDetails ? (
      <div
        className={`password-status-container password-status-warning ${className}`}
      >
        <div className="flex items-center">
          <svg
            className="password-status-icon text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Unable to check password status</span>
        </div>
        {showDetails && (
          <button
            onClick={() => navigate("/change-password")}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Update password anyway
          </button>
        )}
      </div>
    ) : null;
  }

  const { isExpired, isExpiring, expiresAt, daysUntilExpiry } = passwordStatus;

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get status info
  const getStatusInfo = () => {
    if (isExpired) {
      return {
        type: "expired",
        icon: (
          <svg
            className="password-status-icon text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Password Expired",
        message: "Your password has expired and must be reset immediately.",
        actionText: "Reset Password Now",
        actionUrl: "/forgot-password?expired=true",
        urgent: true,
      };
    }

    if (isExpiring) {
      return {
        type: "warning",
        icon: (
          <svg
            className="password-status-icon text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Password Expiring Soon",
        message: `Your password will expire in ${daysUntilExpiry} day${
          daysUntilExpiry !== 1 ? "s" : ""
        }.`,
        actionText: "Change Password",
        actionUrl: "/change-password",
        urgent: daysUntilExpiry <= 3,
      };
    }

    return {
      type: "good",
      icon: (
        <svg
          className="password-status-icon text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Password Status Good",
      message: expiresAt
        ? `Your password expires on ${formatDate(expiresAt)}.`
        : "Your password is current.",
      actionText: "Change Password",
      actionUrl: "/change-password",
      urgent: false,
    };
  };

  const statusInfo = getStatusInfo();

  // Compact view for navigation bar or small spaces
  if (!showDetails) {
    if (statusInfo.type === "expired" || statusInfo.urgent) {
      return (
        <div className={`inline-flex items-center space-x-1 ${className}`}>
          {statusInfo.icon}
          <span className="text-sm font-medium text-red-600">
            {statusInfo.type === "expired" ? "Expired" : `${daysUntilExpiry}d`}
          </span>
        </div>
      );
    }
    return null;
  }

  // Full detailed view
  return (
    <div
      className={`password-status-container password-status-${statusInfo.type} ${className}`}
    >
      <div className="password-status-header">
        <div className="flex items-center">
          {statusInfo.icon}
          <h4 className="font-medium text-gray-900">{statusInfo.title}</h4>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{statusInfo.message}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(statusInfo.actionUrl)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            statusInfo.urgent
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {statusInfo.actionText}
        </button>

        {expiresAt && (
          <span className="text-xs text-gray-500">
            Expires: {formatDate(expiresAt)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PasswordStatus;
