let csrfToken = null;

export const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/csrf-token`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

export const clearCsrfToken = () => {
  csrfToken = null;
};

export const refreshCsrfToken = async () => {
  clearCsrfToken();
  return await getCsrfToken();
};
