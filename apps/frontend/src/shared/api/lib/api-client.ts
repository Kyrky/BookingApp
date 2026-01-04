const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ path: string; message: string }>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    console.log(`[API] ${config.method || "GET"} ${url}`);

    const response = await fetch(url, config);

    console.log(`[API] Response status: ${response.status}`, response);

    // Check if response is OK before parsing
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const text = await response.text();
        console.error(`[API] Error response:`, text);
        errorMessage = text || errorMessage;
      } catch (e) {
        // Ignore text parse errors
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Parse JSON
    let data: ApiResponse<T>;
    try {
      const text = await response.text();
      console.log(`[API] Response text:`, text);
      data = JSON.parse(text);
    } catch (e) {
      console.error(`[API] Failed to parse JSON:`, e);
      throw new ApiError("Invalid JSON response", response.status);
    }

    if (!data.success || !data.data) {
      throw new ApiError("Invalid response format", response.status);
    }

    return data.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "Request failed",
        response.status,
        data.details
      );
    }

    if (!data.success || !data.data) {
      throw new ApiError("Invalid response format", response.status);
    }

    return data.data;
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async putForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || "Request failed",
        response.status,
        data.details
      );
    }

    if (!data.success || !data.data) {
      throw new ApiError("Invalid response format", response.status);
    }

    return data.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, ApiError };
