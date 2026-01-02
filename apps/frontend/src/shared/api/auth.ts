const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export { authStorage } from "./authStorage";

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

class AuthApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const result = await response.json();
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
}

export const authApi = new AuthApi();
