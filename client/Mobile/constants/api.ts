/**
 * Centralized API Configuration
 * ====================================
 * UPDATE THIS SINGLE FILE to fix network request failures
 * 
 * IMPORTANT: Find your development machine IP:
 * 1. Windows: Open CMD and run: ipconfig
 * 2. Look for "IPv4 Address" under your network adapter (usually 192.168.x.x)
 * 3. Replace the IP below with your actual machine IP
 * 
 * Make sure your server is running: npm start (in server folder)
 * ====================================
 */

// ⚠️ CHANGE THIS TO YOUR ACTUAL DEVELOPMENT MACHINE IP
// Example: "http://192.168.1.5:5000" or "http://192.168.0.100:5000"
// Use ipconfig on Windows to find your IP address
const API_BASE_URL = "http://192.168.8.19:5000";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    DETAIL: (id: string) => `${API_BASE_URL}/products/${id}`,
  },
  CART: {
    BASE: `${API_BASE_URL}/cart`,
  },
  ORDERS: {
    BASE: `${API_BASE_URL}/orders`,
    BY_USER: (userId: string) => `${API_BASE_URL}/orders/${userId}`,
  },
};

export default API_CONFIG;
