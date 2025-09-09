// API utility functions for making authenticated requests
export const API_BASE_URL = "http://localhost:9000/api/v1";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const apiRequestWithFile = async (
  endpoint: string,
  formData: FormData,
  token?: string
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};
