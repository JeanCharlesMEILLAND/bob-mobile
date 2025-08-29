// __tests__/api.strict.test.ts - Tests unitaires pour api.strict
import { StrictApiService } from '../src/services/api.strict';

// Mock axios
const mockAxiosCreate = jest.fn();
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  create: mockAxiosCreate.mockReturnValue(mockAxiosInstance),
  isAxiosError: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('mock-token'),
}));

describe('StrictApiService', () => {
  let strictAPI: StrictApiService;

  beforeEach(() => {
    strictAPI = new StrictApiService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with correct base URL', () => {
      expect(mockAxiosCreate).toHaveBeenCalledWith({
        baseURL: 'http://localhost:1337/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('get method', () => {
    test('should make GET request successfully', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', name: 'Test' }],
          meta: { total: 1 }
        },
        status: 200,
        headers: {}
      };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await strictAPI.get('/users');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', undefined);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data.data,
        meta: mockResponse.data.meta,
        status: 200,
        headers: {}
      });
    });

    test('should handle GET request error', async () => {
      const mockError = {
        response: {
          data: { error: { message: 'Not found' } },
          status: 404
        }
      };
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      const result = await strictAPI.get('/users/999');

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Not found',
          status: 404,
          details: mockError.response.data
        }
      });
    });

    test('should handle network error', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      const result = await strictAPI.get('/users');

      expect(result).toEqual({
        success: false,
        error: {
          message: 'Network Error',
          status: 0,
          details: networkError
        }
      });
    });

    test('should include query parameters', async () => {
      const mockResponse = { data: { data: [] }, status: 200, headers: {} };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const queryParams = { page: 1, limit: 10 };
      await strictAPI.get('/users', { params: queryParams });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: queryParams });
    });
  });

  describe('post method', () => {
    test('should make POST request successfully', async () => {
      const mockData = { username: 'newuser', email: 'new@example.com' };
      const mockResponse = {
        data: { data: { id: '1', ...mockData } },
        status: 201,
        headers: {}
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await strictAPI.post('/users', mockData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', { data: mockData }, undefined);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data.data,
        status: 201,
        headers: {}
      });
    });

    test('should handle validation errors', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'ValidationError',
              details: {
                errors: [
                  { path: ['username'], message: 'Username is required' },
                  { path: ['email'], message: 'Invalid email format' }
                ]
              }
            }
          },
          status: 400
        }
      };
      mockAxiosInstance.post.mockRejectedValueOnce(mockError);

      const result = await strictAPI.post('/users', {});

      expect(result).toEqual({
        success: false,
        error: {
          message: 'ValidationError',
          status: 400,
          details: mockError.response.data,
          validationErrors: [
            { field: 'username', message: 'Username is required' },
            { field: 'email', message: 'Invalid email format' }
          ]
        }
      });
    });
  });

  describe('put method', () => {
    test('should make PUT request successfully', async () => {
      const mockData = { username: 'updateduser' };
      const mockResponse = {
        data: { data: { id: '1', ...mockData } },
        status: 200,
        headers: {}
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      const result = await strictAPI.put('/users/1', mockData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', { data: mockData }, undefined);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data.data,
        status: 200,
        headers: {}
      });
    });
  });

  describe('delete method', () => {
    test('should make DELETE request successfully', async () => {
      const mockResponse = {
        data: { data: { id: '1' } },
        status: 200,
        headers: {}
      };
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

      const result = await strictAPI.delete('/users/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', undefined);
      expect(result).toEqual({
        success: true,
        data: mockResponse.data.data,
        status: 200,
        headers: {}
      });
    });
  });

  describe('validateResponse', () => {
    test('should validate correct Strapi response structure', () => {
      const validResponse = {
        data: [{ id: '1', attributes: { name: 'Test' } }],
        meta: { pagination: { total: 1 } }
      };

      const isValid = strictAPI.validateResponse(validResponse);
      expect(isValid).toBe(true);
    });

    test('should reject invalid response structure', () => {
      const invalidResponse = {
        items: [{ name: 'Test' }], // Wrong structure
        count: 1
      };

      const isValid = strictAPI.validateResponse(invalidResponse);
      expect(isValid).toBe(false);
    });

    test('should handle single entity response', () => {
      const singleResponse = {
        data: { id: '1', attributes: { name: 'Test' } }
      };

      const isValid = strictAPI.validateResponse(singleResponse);
      expect(isValid).toBe(true);
    });
  });

  describe('transformStrapiResponse', () => {
    test('should transform Strapi collection response', () => {
      const strapiResponse = {
        data: [
          {
            id: '1',
            documentId: 'doc1',
            attributes: { name: 'Test 1', value: 100 }
          },
          {
            id: '2',
            documentId: 'doc2',
            attributes: { name: 'Test 2', value: 200 }
          }
        ],
        meta: { pagination: { total: 2 } }
      };

      const transformed = strictAPI.transformStrapiResponse(strapiResponse);

      expect(transformed).toEqual([
        { id: '1', documentId: 'doc1', name: 'Test 1', value: 100 },
        { id: '2', documentId: 'doc2', name: 'Test 2', value: 200 }
      ]);
    });

    test('should transform single Strapi entity response', () => {
      const strapiResponse = {
        data: {
          id: '1',
          documentId: 'doc1',
          attributes: { name: 'Test', value: 100 }
        }
      };

      const transformed = strictAPI.transformStrapiResponse(strapiResponse);

      expect(transformed).toEqual({
        id: '1',
        documentId: 'doc1',
        name: 'Test',
        value: 100
      });
    });

    test('should handle response without attributes', () => {
      const strapiResponse = {
        data: { id: '1', documentId: 'doc1' }
      };

      const transformed = strictAPI.transformStrapiResponse(strapiResponse);

      expect(transformed).toEqual({
        id: '1',
        documentId: 'doc1'
      });
    });
  });

  describe('getQueryString', () => {
    test('should build correct query string for population', () => {
      const params = {
        populate: ['user', 'comments.author'],
        filters: {
          status: { $eq: 'published' },
          createdAt: { $gte: '2023-01-01' }
        },
        sort: ['createdAt:desc'],
        pagination: { page: 1, pageSize: 10 }
      };

      const queryString = strictAPI.getQueryString(params);

      expect(queryString).toContain('populate[0]=user');
      expect(queryString).toContain('populate[1]=comments.author');
      expect(queryString).toContain('filters[status][$eq]=published');
      expect(queryString).toContain('filters[createdAt][$gte]=2023-01-01');
      expect(queryString).toContain('sort[0]=createdAt:desc');
      expect(queryString).toContain('pagination[page]=1');
      expect(queryString).toContain('pagination[pageSize]=10');
    });

    test('should handle empty parameters', () => {
      const queryString = strictAPI.getQueryString({});
      expect(queryString).toBe('');
    });

    test('should handle simple populate string', () => {
      const params = { populate: 'user' };
      const queryString = strictAPI.getQueryString(params);
      expect(queryString).toBe('populate=user');
    });
  });

  describe('error handling', () => {
    test('should extract error message from Strapi error response', () => {
      const strapiError = {
        response: {
          data: {
            error: {
              name: 'ValidationError',
              message: 'Email already taken',
              details: {}
            }
          },
          status: 400
        }
      };

      mockAxiosInstance.post.mockRejectedValueOnce(strapiError);

      return strictAPI.post('/users', {}).then(result => {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Email already taken');
        expect(result.error.status).toBe(400);
      });
    });

    test('should handle timeout errors', async () => {
      const timeoutError = { code: 'ECONNABORTED', message: 'timeout' };
      mockAxiosInstance.get.mockRejectedValueOnce(timeoutError);

      const result = await strictAPI.get('/users');

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('timeout');
    });
  });
});