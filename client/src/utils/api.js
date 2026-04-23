const API_URL = import.meta.env.VITE_API_URL;

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("locksend_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

export const api = {
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  get: (endpoint) =>
    request(endpoint, { method: "GET" }),
};
