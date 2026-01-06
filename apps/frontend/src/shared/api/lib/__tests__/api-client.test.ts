import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient, ApiError } from '../api-client';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Helper function to create a mock Response
function createMockResponse(
  ok: boolean,
  status: number,
  data?: { success: boolean; data?: unknown; error?: string; details?: Array<{ path: string; message: string }> }
): Response {
  return {
    ok,
    status,
    json: async () => data || {},
    text: async () => data ? JSON.stringify(data) : '',
    headers: new Headers(),
  } as unknown as Response;
}

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ApiClient('http://test.com');
  });

  describe('GET requests', () => {
    it('should make GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      fetchMock.mockResolvedValueOnce(createMockResponse(true, 200, { success: true, data: mockData }));

      const result = await client.get<{ id: number; name: string }>('/test');

      expect(fetchMock).toHaveBeenCalledWith('http://test.com/test', expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('should add Authorization header if token exists', async () => {
      localStorageMock.getItem.mockReturnValueOnce('test-token');
      fetchMock.mockResolvedValueOnce(createMockResponse(true, 200, { success: true, data: {} }));

      await client.get('/test');

      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[1]?.headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should throw ApiError on failed response', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(false, 404));

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('POST requests', () => {
    it('should make POST request with JSON body', async () => {
      const mockBody = { name: 'New Item' };
      const mockData = { id: 1, ...mockBody };
      fetchMock.mockResolvedValueOnce(createMockResponse(true, 201, { success: true, data: mockData }));

      const result = await client.post('/create', mockBody);

      expect(result).toEqual(mockData);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with JSON body', async () => {
      const mockBody = { id: 1, name: 'Updated' };
      fetchMock.mockResolvedValueOnce(createMockResponse(true, 200, { success: true, data: mockBody }));

      const result = await client.put('/update/1', mockBody);

      expect(result).toEqual(mockBody);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(true, 200, { success: true, data: { message: 'Deleted' } }));

      const result = await client.delete('/delete/1');

      expect(result).toEqual({ message: 'Deleted' });
    });
  });

  describe('error handling', () => {
    it('should throw ApiError with correct status code', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(false, 500));

      try {
        await client.get('/error');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
      }
    });

    it('should handle errors gracefully when response parsing fails', async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse(false, 500));

      await expect(client.get('/error')).rejects.toThrow();
    });
  });
});
