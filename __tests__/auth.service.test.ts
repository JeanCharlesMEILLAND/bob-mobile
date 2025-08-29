// __tests__/auth.service.test.ts - Tests unitaires pour auth.service
import { AuthService } from '../src/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    authService = AuthService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('login', () => {
    const mockLoginData = {
      identifier: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      jwt: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        nom: 'Test',
        prenom: 'User'
      }
    };

    test('should login successfully and store token', async () => {
      const mockApi = require('axios').create();
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login(mockLoginData.identifier, mockLoginData.password);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/local', mockLoginData);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('userToken', mockResponse.jwt);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockResponse.user));
      expect(result).toEqual({
        success: true,
        user: mockResponse.user,
        token: mockResponse.jwt
      });
    });

    test('should handle login failure', async () => {
      const mockApi = require('axios').create();
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
          status: 400
        }
      };
      mockApi.post.mockRejectedValueOnce(mockError);

      const result = await authService.login(mockLoginData.identifier, mockLoginData.password);

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('should handle network error', async () => {
      const mockApi = require('axios').create();
      mockApi.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await authService.login(mockLoginData.identifier, mockLoginData.password);

      expect(result).toEqual({
        success: false,
        error: 'Erreur de connexion'
      });
    });
  });

  describe('logout', () => {
    test('should clear stored data on logout', async () => {
      await authService.logout();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('getStoredToken', () => {
    test('should return stored token', async () => {
      const mockToken = 'stored-jwt-token';
      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);

      const token = await authService.getStoredToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userToken');
      expect(token).toBe(mockToken);
    });

    test('should return null if no token stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const token = await authService.getStoredToken();

      expect(token).toBeNull();
    });
  });

  describe('getStoredUser', () => {
    test('should return parsed user data', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));

      const user = await authService.getStoredUser();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userData');
      expect(user).toEqual(mockUser);
    });

    test('should return null if no user data or invalid JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid-json');

      const user = await authService.getStoredUser();

      expect(user).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    test('should return true for valid JWT token', () => {
      // Mock JWT with valid expiration (exp > current time)
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `header.${btoa(JSON.stringify({ exp: futureExp }))}.signature`;

      const isValid = authService.isTokenValid(validToken);

      expect(isValid).toBe(true);
    });

    test('should return false for expired JWT token', () => {
      // Mock JWT with expired expiration
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = `header.${btoa(JSON.stringify({ exp: pastExp }))}.signature`;

      const isValid = authService.isTokenValid(expiredToken);

      expect(isValid).toBe(false);
    });

    test('should return false for malformed token', () => {
      const malformedToken = 'not-a-valid-jwt';

      const isValid = authService.isTokenValid(malformedToken);

      expect(isValid).toBe(false);
    });

    test('should return false for null token', () => {
      const isValid = authService.isTokenValid(null);

      expect(isValid).toBe(false);
    });
  });

  describe('refreshUserData', () => {
    test('should fetch and store updated user data', async () => {
      const mockToken = 'valid-token';
      const mockUserData = {
        id: '1',
        username: 'updateduser',
        email: 'updated@example.com',
        bobizPoints: 150
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      
      const mockApi = require('axios').create();
      mockApi.get.mockResolvedValueOnce({ data: mockUserData });

      const result = await authService.refreshUserData();

      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUserData));
      expect(result).toEqual({
        success: true,
        user: mockUserData
      });
    });

    test('should handle missing token', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await authService.refreshUserData();

      expect(result).toEqual({
        success: false,
        error: 'No authentication token found'
      });
    });
  });

  describe('validateUser', () => {
    test('should return true for valid user object', () => {
      const validUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      };

      const isValid = authService.validateUser(validUser);

      expect(isValid).toBe(true);
    });

    test('should return false for invalid user object', () => {
      const invalidUser = {
        id: '1',
        // missing required fields
      };

      const isValid = authService.validateUser(invalidUser);

      expect(isValid).toBe(false);
    });

    test('should return false for null user', () => {
      const isValid = authService.validateUser(null);

      expect(isValid).toBe(false);
    });
  });
});