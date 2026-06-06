import axios from "axios";

// Base URL for the Express backend
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Admin API Login (Step 1: Check Email & Password)
 */
export const verifyAdminCredentials = async (email, password) => {
  try {
    const response = await api.post("/auth/admin/login", { email, password });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Invalid Admin credentials";
    throw new Error(errorMsg);
  }
};

/**
 * Admin API JWT Token Generation (Step 3: Generate token after OTP success)
 */
export const generateAdminJwt = async (email) => {
  try {
    const response = await api.post("/auth/admin/token", { email });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to generate admin token";
    throw new Error(errorMsg);
  }
};

/**
 * Citizen API Login (Step 1: Check Aadhaar & Phone)
 */
export const verifyCitizenCredentials = async (aadhaarNumber, phoneNumber) => {
  try {
    const response = await api.post("/user/login", { aadhaarNumber, phoneNumber });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Invalid Aadhaar or Phone Number";
    throw new Error(errorMsg);
  }
};

/**
 * Citizen API JWT Token Generation (Step 3: Generate token after OTP success)
 */
export const generateCitizenJwt = async (phoneNumber) => {
  try {
    const response = await api.post("/user/token", { phoneNumber });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to generate citizen token";
    throw new Error(errorMsg);
  }
};

/**
 * Register a new citizen account
 * POST /api/user/create-user
 */
export const createCitizenAccount = async (userData) => {
  try {
    const response = await api.post("/user/create-user", userData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to create citizen account";
    throw new Error(errorMsg);
  }
};

/**
 * Fetch all issues submitted by the currently logged-in citizen
 * GET /api/problems/my-issues  (JWT required)
 */
export const fetchMyIssues = async () => {
  try {
    const response = await api.get("/problems/my-issues");
    return response.data; // { success: true, issues: [...] }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to fetch your issues";
    throw new Error(errorMsg);
  }
};

/**
 * Submit a new civic issue with optional media uploads
 * POST /api/problems/create  multipart/form-data  (JWT required)
 * @param {FormData} formData  - must contain title, description, category, and optionally media files
 */
export const submitCivicIssue = async (formData) => {
  try {
    const response = await api.post("/problems/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { success: true, problem: {...} }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to submit the issue";
    throw new Error(errorMsg);
  }
};

/**
 * Fetch all issues submitted in the citizen's district
 * GET /api/problems/district-issues  (JWT required)
 */
export const fetchDistrictIssues = async () => {
  try {
    const response = await api.get("/problems/district-issues");
    return response.data; // { success: true, count, issues: [...] }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to fetch district issues";
    throw new Error(errorMsg);
  }
};

/**
 * Toggle support/upvote on a civic issue
 * POST /api/problems/:id/upvote  (JWT required)
 */
export const toggleIssueUpvote = async (id) => {
  try {
    const response = await api.post(`/problems/${id}/upvote`);
    return response.data; // { success: true, message, upvotes: [...] }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to toggle endorsement";
    throw new Error(errorMsg);
  }
};

export default api;

