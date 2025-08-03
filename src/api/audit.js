import axiosInstance from "./axiosInstance";

export const getAuditLogs = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (
      params[key] !== "" &&
      params[key] !== null &&
      params[key] !== undefined
    ) {
      queryParams.append(key, params[key]);
    }
  });

  const url = `/api/audit/logs?${queryParams.toString()}`;
  // console.log("Audit API: Making request to:", url);
  // console.log("Audit API: Request params:", params);

  return axiosInstance
    .get(url)
    .then((response) => {
      // console.log("Audit API: Raw response:", response);
      return response;
    })
    .catch((error) => {
      // console.error("Audit API: Request failed:", error);
      // console.error("Audit API: Error response:", error.response);
      throw error;
    });
};

export const getAuditStats = (days = 7) => {
  return axiosInstance.get(`/api/audit/stats?days=${days}`);
};

export const exportAuditLogs = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (
      params[key] !== "" &&
      params[key] !== null &&
      params[key] !== undefined
    ) {
      queryParams.append(key, params[key]);
    }
  });

  return axiosInstance.get(`/api/audit/export?${queryParams.toString()}`, {
    responseType: "blob",
  });
};

export const getAuditFilterOptions = () => {
  return axiosInstance.get("/api/audit/filter-options");
};

export const clearOldAuditLogs = (days = 90) => {
  return axiosInstance.delete(`/api/audit/cleanup?days=${days}`);
};
