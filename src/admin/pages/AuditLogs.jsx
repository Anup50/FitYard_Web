import React, { useState, useEffect } from "react";
import {
  getAuditLogs,
  getAuditStats,
  exportAuditLogs,
  getAuditFilterOptions,
} from "../../api/audit";
import { toast } from "react-toastify";

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    userEmail: "",
    action: "",
    status: "",
    userType: "",
    limit: 25,
    page: 1,
    dateRange: {
      preset: "7d",
      startDate: "",
      endDate: "",
    },
    showAdvanced: false,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    limit: 25,
  });

  useEffect(() => {
    handleDatePresetChange("7d");
  }, []);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "statistics") {
      fetchStats();
    }
  }, [activeTab, filters]);

  const handleFilterChange = (key, value) => {
    if (key.startsWith("dateRange.")) {
      const dateKey = key.split(".")[1];
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateKey]: value,
        },
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    }
  };

  const handleDatePresetChange = (preset) => {
    const now = new Date();
    let startDate = "";
    let endDate = "";

    if (preset !== "custom") {
      endDate = now.toISOString().split("T")[0];
      const start = new Date(now);

      switch (preset) {
        case "1d":
          start.setDate(now.getDate() - 1);
          break;
        case "7d":
          start.setDate(now.getDate() - 7);
          break;
        case "30d":
          start.setDate(now.getDate() - 30);
          break;
        case "90d":
          start.setDate(now.getDate() - 90);
          break;
      }

      startDate = start.toISOString().split("T")[0];
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: { preset, startDate, endDate },
      page: 1,
    }));
  };

  const applyQuickFilter = (filterType) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const quickFilters = {
      "failed-logins": {
        status: "FAILURE",
        action: "LOGIN",
      },
      "admin-actions": {
        userType: "Admin",
        dateRange: {
          preset: "custom",
          startDate: yesterday.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0],
        },
      },
      "users-only": {
        userType: "User",
      },
      "recent-errors": {
        status: "FAILURE",
        dateRange: {
          preset: "custom",
          startDate: yesterday.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0],
        },
      },
      "product-changes": {
        action: "PRODUCT_CREATE,PRODUCT_UPDATE,PRODUCT_DELETE",
      },
    };

    const filterConfig = quickFilters[filterType];
    if (filterConfig) {
      setFilters((prev) => ({
        ...prev,
        ...filterConfig,
        page: 1,
      }));
    }
  };

  const getActiveFilters = () => {
    const activeFilters = [];

    if (filters.userEmail) {
      activeFilters.push({
        key: "userEmail",
        label: "Email",
        value: filters.userEmail,
      });
    }
    if (filters.userType) {
      activeFilters.push({
        key: "userType",
        label: "User Type",
        value: filters.userType,
      });
    }
    if (filters.action) {
      activeFilters.push({
        key: "action",
        label: "Action",
        value: filters.action,
      });
    }
    if (filters.status) {
      activeFilters.push({
        key: "status",
        label: "Status",
        value: filters.status,
      });
    }
    if (filters.dateRange.preset && filters.dateRange.preset !== "7d") {
      const presetLabels = {
        "1d": "Last 24 Hours",
        "30d": "Last 30 Days",
        "90d": "Last 3 Months",
        custom: "Custom Range",
      };
      activeFilters.push({
        key: "dateRange.preset",
        label: "Date Range",
        value:
          presetLabels[filters.dateRange.preset] || filters.dateRange.preset,
      });
    }

    return activeFilters;
  };

  const clearSingleFilter = (filterKey) => {
    if (filterKey === "dateRange.preset") {
      handleDatePresetChange("7d");
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: "",
        page: 1,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      userEmail: "",
      action: "",
      status: "",
      userType: "",
      limit: 25,
      page: 1,
      dateRange: {
        preset: "7d",
        startDate: "",
        endDate: "",
      },
      showAdvanced: false,
    });
    handleDatePresetChange("7d");
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        userEmail: filters.userEmail,
        action: filters.action,
        status: filters.status,
        userType: filters.userType,
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, value]) => value !== "")
      );

      const response = await getAuditLogs(cleanParams);

      let logsData = [];
      let paginationData = {};

      if (response.data) {
        if (response.data.success === true) {
          logsData = response.data.logs || response.data.data?.logs || [];
          paginationData =
            response.data.pagination || response.data.data?.pagination || {};
        } else if (Array.isArray(response.data)) {
          logsData = response.data;
          paginationData = {
            currentPage: 1,
            totalPages: 1,
            totalLogs: response.data.length,
            limit: 25,
          };
        } else if (response.data.logs) {
          logsData = response.data.logs;
          paginationData = response.data.pagination || {};
        } else if (response.logs) {
          logsData = response.logs;
          paginationData = response.pagination || {};
        }
      }

      if (Array.isArray(logsData) && logsData.length >= 0) {
        setLogs(logsData);
        setPagination({
          currentPage: paginationData.currentPage || 1,
          totalPages: paginationData.totalPages || 1,
          totalLogs: paginationData.totalLogs || logsData.length,
          limit: paginationData.limit || 25,
        });

        if (logsData.length === 0) {
        } else {
        }
      } else {
        toast.error("Failed to fetch audit logs - Invalid response format");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error(
            "Audit logs API endpoint not found. Please check if the backend supports audit logging."
          );
        } else if (error.response.status === 401) {
          toast.error("Unauthorized access to audit logs");
        } else {
          toast.error(
            `Error fetching audit logs: ${
              error.response.data?.message || error.message
            }`
          );
        }
      } else if (error.request) {
        toast.error(
          "Network error: Cannot connect to backend server. Please check if the backend is running on https://localhost:4000"
        );
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await getAuditStats();

      if (response.data && response.data.success) {
        setStats(response.data.data || {});
      } else {
        toast.error("Failed to fetch statistics - Invalid response format");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Audit statistics API endpoint not found");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized access to audit statistics");
      } else {
        toast.error(
          `Error fetching statistics: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const queryParams = {
        userEmail: filters.userEmail,
        action: filters.action,
        status: filters.status,
        userType: filters.userType,
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, value]) => value !== "")
      );

      const response = await exportAuditLogs(cleanParams);

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fityard-audit-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Error exporting audit logs");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePageChange = (page) => {
    handleFilterChange("page", page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    return status === "SUCCESS"
      ? "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
      : "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800";
  };

  const getUserTypeBadge = (userType) => {
    return userType === "Admin"
      ? "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
      : "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">
          Monitor and review system activities and user actions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "logs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "statistics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div>
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 transition-colors"
            >
              <span className="font-medium">Filters</span>
              <svg
                className={`h-5 w-5 transform transition-transform ${
                  showMobileFilters ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div
            className={`bg-white rounded border p-4 mb-6 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Export Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filter Logs</h3>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exportLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            </div>

            {/* Quick Filter Buttons */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyQuickFilter("failed-logins")}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                >
                  Failed Logins
                </button>
                <button
                  onClick={() => applyQuickFilter("admin-actions")}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 transition-colors"
                >
                  Admin Actions
                </button>
                <button
                  onClick={() => applyQuickFilter("users-only")}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                >
                  Users Only
                </button>
                <button
                  onClick={() => applyQuickFilter("recent-errors")}
                  className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded hover:bg-orange-200 transition-colors"
                >
                  Recent Errors
                </button>
                <button
                  onClick={() => applyQuickFilter("product-changes")}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                >
                  Product Changes
                </button>
              </div>
            </div>

            {/* Date Range Presets */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
              {[
                { key: "1d", label: "Last 24 Hours" },
                { key: "7d", label: "7 Days" },
                { key: "30d", label: "30 Days" },
                { key: "90d", label: "3 Months" },
                { key: "custom", label: "Custom Range" },
              ].map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handleDatePresetChange(preset.key)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    filters.dateRange.preset === preset.key
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date Range Inputs (shown when custom is selected) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  {filters.dateRange.preset === "custom" ? (
                    <>
                      <input
                        type="date"
                        value={filters.dateRange.startDate}
                        onChange={(e) =>
                          handleFilterChange(
                            "dateRange.startDate",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={filters.dateRange.endDate}
                        onChange={(e) =>
                          handleFilterChange(
                            "dateRange.endDate",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600">
                      {filters.dateRange.startDate && filters.dateRange.endDate
                        ? `${filters.dateRange.startDate} to ${filters.dateRange.endDate}`
                        : "Select preset above"}
                    </div>
                  )}
                </div>
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  value={filters.userType}
                  onChange={(e) =>
                    handleFilterChange("userType", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Users</option>
                  <option value="User">Users Only</option>
                  <option value="Admin">Admins Only</option>
                </select>
              </div>

              {/* Action with Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <optgroup label="Authentication">
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="REGISTER">Registration</option>
                  </optgroup>
                  <optgroup label="Admin Actions">
                    <option value="ADMIN_LOGIN">Admin Login</option>
                    <option value="ADMIN_LOGOUT">Admin Logout</option>
                    <option value="ADMIN_ACTION">Admin Action</option>
                  </optgroup>
                  <optgroup label="Product Management">
                    <option value="PRODUCT_CREATE">Create Product</option>
                    <option value="PRODUCT_UPDATE">Update Product</option>
                    <option value="PRODUCT_DELETE">Delete Product</option>
                  </optgroup>
                  <optgroup label="Orders & Cart">
                    <option value="ORDER_CREATE">Create Order</option>
                    <option value="ORDER_UPDATE">Update Order</option>
                    <option value="CART_ADD">Add to Cart</option>
                    <option value="CART_UPDATE">Update Cart</option>
                    <option value="CART_REMOVE">Remove from Cart</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="PROFILE_UPDATE">Profile Update</option>
                    <option value="FILE_UPLOAD">File Upload</option>
                    <option value="ERROR">Errors</option>
                  </optgroup>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILURE">Failure</option>
                </select>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-end">
                <button
                  onClick={() =>
                    handleFilterChange("showAdvanced", !filters.showAdvanced)
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                >
                  {filters.showAdvanced ? "Hide" : "Show"} Advanced
                  <svg
                    className={`ml-1 h-4 w-4 transform transition-transform ${
                      filters.showAdvanced ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {filters.showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Email
                  </label>
                  <input
                    type="text"
                    value={filters.userEmail}
                    onChange={(e) =>
                      handleFilterChange("userEmail", e.target.value)
                    }
                    placeholder="Search by email..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results Per Page
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) =>
                      handleFilterChange("limit", parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {getActiveFilters().length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {getActiveFilters().map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {filter.label}: {filter.value}
                    <button
                      onClick={() => clearSingleFilter(filter.key)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {getActiveFilters().length > 0 && (
                <span className="text-blue-600 font-medium">Filtered: </span>
              )}
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalLogs
              )}{" "}
              of {pagination.totalLogs.toLocaleString()} logs
              {getActiveFilters().length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({getActiveFilters().length} filter
                  {getActiveFilters().length !== 1 ? "s" : ""} applied)
                </span>
              )}
            </div>
            {loading && <div className="text-sm text-gray-600">Loading...</div>}
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded border overflow-hidden">
            {logs.length === 0 && !loading ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">
                  No audit logs found
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  This could be because:
                </p>
                <div className="text-sm text-gray-500 space-y-1 max-w-md mx-auto">
                  <p>• No audit logs have been created yet</p>
                  <p>• Your filters are too restrictive</p>
                  <p>• Backend audit logging is not configured</p>
                  <p>• Authentication session expired</p>
                </div>
                <div className="mt-6 space-x-3">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {log.userEmail || "Anonymous"}
                            </div>
                            <div className="mt-1">
                              <span className={getUserTypeBadge(log.userType)}>
                                {log.userType}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {log.action}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.method} {log.endpoint}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={log.description}>
                              {log.description}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={getStatusBadge(log.status)}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {log.ipAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page{" "}
                    <span className="font-medium">
                      {pagination.currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .slice(
                        Math.max(0, pagination.currentPage - 3),
                        Math.min(
                          pagination.totalPages,
                          pagination.currentPage + 2
                        )
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "statistics" && (
        <div>
          {stats && Object.keys(stats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Logs */}
              <div className="bg-white p-6 rounded border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Total Logs
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalLogs?.toLocaleString()}
                </p>
              </div>

              {/* Successful Actions */}
              <div className="bg-white p-6 rounded border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Successful Actions
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.successfulActions?.toLocaleString()}
                </p>
              </div>

              {/* Failed Actions */}
              <div className="bg-white p-6 rounded border">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed Actions
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  {stats.failedActions?.toLocaleString()}
                </p>
              </div>

              {/* Top Actions */}
              {stats.topActions && (
                <div className="bg-white p-6 rounded border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Top Actions
                  </h3>
                  <div className="space-y-2">
                    {stats.topActions.map((action, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{action._id}</span>
                        <span className="font-medium">{action.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Users */}
              {stats.topUsers && (
                <div className="bg-white p-6 rounded border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Most Active Users
                  </h3>
                  <div className="space-y-2">
                    {stats.topUsers.map((user, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600 truncate">
                          {user._id || "Anonymous"}
                        </span>
                        <span className="font-medium">{user.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {stats.recentActivity && (
                <div className="bg-white p-6 rounded border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-3"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No statistics available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
