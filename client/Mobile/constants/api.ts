
const API_BASE_URL = "http://192.168.8.4:5000";

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
