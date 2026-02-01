import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../auth';
import type { LoginRequest, RegisterRequest } from '../auth';

// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('authApi', () => {
  const mockBaseUrl = 'http://localhost:3001';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the authApi to use the mock base URL
    (authApi as any).baseUrl = mockBaseUrl;
  });

  describe('login', () => {
    it('should send login request with correct payload', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        token: 'jwt-token',
        refreshToken: 'refresh-token',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await authApi.login(loginData);

      expect(fetchMock).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed login', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response);

      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should send registration request with correct payload', async () => {
      const registerData: RegisterRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockResponse = {
        user: {
          id: 'user-456',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await authApi.register(registerData);

      expect(fetchMock).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed registration', async () => {
      const registerData: RegisterRequest = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'User already exists' }),
      } as Response);

      await expect(authApi.register(registerData)).rejects.toThrow('User already exists');
    });
  });

  describe('refresh', () => {
    it('should send refresh token request', async () => {
      const refreshData = { refreshToken: 'old-refresh-token' };

      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await authApi.refresh(refreshData);

      expect(fetchMock).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refreshData),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed token refresh', async () => {
      const refreshData = { refreshToken: 'expired-token' };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token refresh failed' }),
      } as Response);

      await expect(authApi.refresh(refreshData)).rejects.toThrow('Token refresh failed');
    });
  });

  describe('getMe', () => {
    it('should send getMe request with auth header', async () => {
      // Mock authStorage.getToken
      vi.doMock('../authStorage', () => ({
        authStorage: {
          getToken: () => 'test-token',
        },
      }));

      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockResponse }),
      } as Response);

      // Mock localStorage to return a token
      const localStorageGet = vi.spyOn(localStorage, 'getItem').mockReturnValue('test-token');

      const result = await authApi.getMe();

      expect(fetchMock).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
        }
      );
      expect(result).toEqual(mockResponse);

      localStorageGet.mockRestore();
    });

    it('should throw error when not authenticated', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(authApi.getMe()).rejects.toThrow('Failed to get user');
    });
  });
});
