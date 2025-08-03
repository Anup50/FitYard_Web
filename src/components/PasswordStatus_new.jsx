import React, { useState, useEffect } from "react";
import { getPasswordStatus } from "../utils/passwordApi";
import { useAuth } from "../context/AuthContext";

const PasswordStatus = ({ showDetails = true, className = "" }) => {
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPasswordStatus();
  }, [user, isAuthenticated]);

  if (!isAuthenticated() || loading) {
    return showDetails ? (
      <div className={`${className}`}>
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
        className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
      >
        <div className="flex items-center">
          <div className="w-5 h-5 text-yellow-500 mr-2">⚠️</div>
          <span className="text-sm text-yellow-800">
            Unable to check password status
          </span>
        </div>
      </div>
    ) : null;
  }

  const { isExpired, isExpiring, expiresAt, daysUntilExpiry } = passwordStatus;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusInfo = () => {
    if (isExpired) {
      return {
        type: "error",
        icon: "❌",
        title: "Password Expired",
        message: `Your password expired ${
          expiresAt ? `on ${formatDate(expiresAt)}` : "recently"
        }. Please update it immediately.`,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        urgent: true,
      };
    }

    if (isExpiring && daysUntilExpiry <= 7) {
      return {
        type: "warning",
        icon: "⚠️",
        title: "Password Expiring Soon",
        message: `Your password will expire in ${daysUntilExpiry} day${
          daysUntilExpiry !== 1 ? "s" : ""
        } ${expiresAt ? `on ${formatDate(expiresAt)}` : ""}.`,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800",
        urgent: false,
      };
    }

    return {
      type: "success",
      icon: "✅",
      title: "Password Status Good",
      message: expiresAt
        ? `Your password expires on ${formatDate(expiresAt)}.`
        : "Your password is current.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      urgent: false,
    };
  };

  const statusInfo = getStatusInfo();

  if (!showDetails) {
    if (statusInfo.type === "error" || statusInfo.urgent) {
      return (
        <div className={`inline-flex items-center space-x-1 ${className}`}>
          <span className="text-sm">{statusInfo.icon}</span>
          <span className="text-sm font-medium text-red-600">
            {statusInfo.type === "error" ? "Expired" : `${daysUntilExpiry}d`}
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`p-4 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg ${className}`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg">{statusInfo.icon}</span>
        <div className="flex-1">
          <h4 className={`font-medium ${statusInfo.textColor} mb-1`}>
            {statusInfo.title}
          </h4>
          <p className={`text-sm ${statusInfo.textColor}`}>
            {statusInfo.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordStatus;
