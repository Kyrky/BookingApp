import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStorage, type StoredUser } from '../authStorage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('authStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('token management', () => {
    it('should get token from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('test-token');

      const token = authStorage.getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      expect(token).toBe('test-token');
    });

    it('should return null when token does not exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const token = authStorage.getToken();

      expect(token).toBeNull();
    });

    it('should set token to localStorage', () => {
      authStorage.setToken('new-token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    });

    it('should remove token from localStorage', () => {
      authStorage.removeToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('refresh token management', () => {
    it('should get refresh token from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('refresh-token');

      const token = authStorage.getRefreshToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(token).toBe('refresh-token');
    });

    it('should return null when refresh token does not exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const token = authStorage.getRefreshToken();

      expect(token).toBeNull();
    });

    it('should set refresh token to localStorage', () => {
      authStorage.setRefreshToken('new-refresh-token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_refresh_token', 'new-refresh-token');
    });

    it('should remove refresh token from localStorage', () => {
      authStorage.removeRefreshToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_refresh_token');
    });
  });

  describe('user management', () => {
    const mockUser: StoredUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    it('should get user from localStorage and parse it', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

      const user = authStorage.getUser();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_user');
      expect(user).toEqual(mockUser);
    });

    it('should return null when user does not exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const user = authStorage.getUser();

      expect(user).toBeNull();
    });

    it('should set user to localStorage as JSON string', () => {
      authStorage.setUser(mockUser);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });

    it('should remove user from localStorage', () => {
      authStorage.removeUser();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('clear all auth data', () => {
    it('should remove token, refresh token, and user', () => {
      authStorage.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('should call remove methods in correct order', () => {
      const removeTokenSpy = vi.spyOn(authStorage, 'removeToken');
      const removeRefreshTokenSpy = vi.spyOn(authStorage, 'removeRefreshToken');
      const removeUserSpy = vi.spyOn(authStorage, 'removeUser');

      authStorage.clear();

      expect(removeTokenSpy).toHaveBeenCalled();
      expect(removeRefreshTokenSpy).toHaveBeenCalled();
      expect(removeUserSpy).toHaveBeenCalled();

      // Verify order: token -> refresh token -> user
      expect(removeTokenSpy).toHaveBeenCalledBefore(removeRefreshTokenSpy);
      expect(removeRefreshTokenSpy).toHaveBeenCalledBefore(removeUserSpy);
    });
  });
});
