import axios from "axios";

// Base URL for the Express backend
const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Admin API Login (Step 1: Check Email & Password)
 */
export const verifyAdminCredentials = async (email, password) => {
  try {
    const response = await api.post("/auth/admin/login", { email, password });
    return response.data; // Expected response: { message: "Credentials Verified", phoneNumber: "..." }
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
    return response.data; // Expected response: { success: true, token, admin }
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
    return response.data; // Expected response: { success: true, message: "User Found", phoneNumber: "..." }
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
    return response.data; // Expected response: { success: true, token, user }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to generate citizen token";
    throw new Error(errorMsg);
  }
};

/**
 * Fetch complaints belonging to the admin's district
 */
export const fetchDistrictIssues = async (token) => {
  try {
    const response = await api.get("/problems/district-issues", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expected: { success: true, count, issues }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to fetch district issues";
    throw new Error(errorMsg);
  }
};

/**
 * Update issue status and remarks
 */
export const updateIssueStatus = async (id, status, remarks, token) => {
  try {
    const response = await api.patch(
      `/problems/${id}/status`,
      { status, remarks },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // Expected: { success: true, message, problem }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to update problem status";
    throw new Error(errorMsg);
  }
};

export default api;
