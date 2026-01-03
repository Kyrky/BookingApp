const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import { authStorage } from "./authStorage";

export { authStorage } from "./authStorage";

function getAuthHeaders(): Record<string, string> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

class AuthApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const url = `${this.baseUrl}/api/auth/login`;
    console.log("API Login request:", { url, data });
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("API Login response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("API Login error:", error);
      throw new Error(error.error || "Login failed");
    }

    const result = await response.json();
    console.log("API Login success:", result);
    return result.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const result = await response.json();
    return result.data;
  }

  async refresh(data: RefreshRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Token refresh failed");
    }

    const result = await response.json();
    return result.data;
  }

  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    const result = await response.json();
    return result.data;
  }
}

export const authApi = new AuthApi();
