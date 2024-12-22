// src/utils/auth.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const auth = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user")),

  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      this.token = data.token;
      this.user = data.user;
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(username, password) {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.token = null;
    this.user = null;
  },

  isAuthenticated() {
    return !!this.token;
  },

  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  },
};
