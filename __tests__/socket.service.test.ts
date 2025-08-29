// __tests__/socket.service.test.ts - Tests unitaires pour socket.service
import { SocketService } from '../src/services/socket.service';

// Mock socket.io-client
const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: false,
  id: 'mock-socket-id'
};

const mockIo = jest.fn(() => mockSocket);
jest.mock('socket.io-client', () => mockIo);

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('mock-token'),
}));

describe('SocketService', () => {
  let socketService: SocketService;

  beforeEach(() => {
    socketService = SocketService.getInstance();
    jest.clearAllMocks();
    mockSocket.connected = false;
  });

  afterEach(() => {
    socketService.disconnect();
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = SocketService.getInstance();
      const instance2 = SocketService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('connect', () => {
    test('should connect with authentication token', async () => {
      mockSocket.connected = true;
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect') {
          callback();
        }
      });

      await socketService.connect('user123');

      expect(mockIo).toHaveBeenCalledWith('http://localhost:1338', {
        auth: {
          token: 'mock-token'
        },
        transports: ['websocket']
      });
    });

    test('should not connect if already connected', async () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      await socketService.connect('user123');

      expect(mockIo).not.toHaveBeenCalled();
    });

    test('should handle connection error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect_error') {
          callback(new Error('Connection failed'));
        }
      });

      await socketService.connect('user123');

      expect(consoleSpy).toHaveBeenCalledWith('Socket connection error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    test('should disconnect socket', () => {
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(socketService['isConnected']).toBe(false);
    });

    test('should handle disconnect when not connected', () => {
      socketService['socket'] = null;

      expect(() => socketService.disconnect()).not.toThrow();
    });
  });

  describe('joinRoom', () => {
    test('should join room when connected', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      socketService.joinRoom('conversation123');

      expect(mockSocket.emit).toHaveBeenCalledWith('join_room', 'conversation123');
    });

    test('should not join room when not connected', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      socketService['socket'] = null;

      socketService.joinRoom('conversation123');

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Cannot join room: Socket not connected');
      consoleSpy.mockRestore();
    });
  });

  describe('leaveRoom', () => {
    test('should leave room when connected', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      socketService.leaveRoom('conversation123');

      expect(mockSocket.emit).toHaveBeenCalledWith('leave_room', 'conversation123');
    });
  });

  describe('sendMessage', () => {
    test('should send message successfully', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      const messageData = {
        conversationId: 'conv123',
        content: 'Hello world',
        type: 'text' as const
      };

      socketService.sendMessage(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith('send_message', messageData);
    });

    test('should not send message when not connected', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      socketService['socket'] = null;

      const messageData = {
        conversationId: 'conv123',
        content: 'Hello world',
        type: 'text' as const
      };

      socketService.sendMessage(messageData);

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Cannot send message: Socket not connected');
      consoleSpy.mockRestore();
    });
  });

  describe('event listeners', () => {
    test('should add message listener', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;

      const callback = jest.fn();
      socketService.onMessage(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('message_received', callback);
    });

    test('should remove message listener', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;

      const callback = jest.fn();
      socketService.offMessage(callback);

      expect(mockSocket.off).toHaveBeenCalledWith('message_received', callback);
    });

    test('should add user status listener', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;

      const callback = jest.fn();
      socketService.onUserStatus(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('user_status_changed', callback);
    });

    test('should add typing listener', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;

      const callback = jest.fn();
      socketService.onTyping(callback);

      expect(mockSocket.on).toHaveBeenCalledWith('user_typing', callback);
    });

    test('should emit typing event', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      socketService.emitTyping('conv123', true);

      expect(mockSocket.emit).toHaveBeenCalledWith('typing', {
        conversationId: 'conv123',
        isTyping: true
      });
    });
  });

  describe('connection status', () => {
    test('should return correct connection status', () => {
      expect(socketService.isSocketConnected()).toBe(false);

      socketService['isConnected'] = true;
      expect(socketService.isSocketConnected()).toBe(true);
    });

    test('should return socket ID when connected', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      expect(socketService.getSocketId()).toBe('mock-socket-id');
    });

    test('should return null socket ID when not connected', () => {
      socketService['socket'] = null;

      expect(socketService.getSocketId()).toBeNull();
    });
  });

  describe('error handling', () => {
    test('should handle socket errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('Socket error'));
        }
      });

      socketService['setupEventListeners']();

      expect(consoleSpy).toHaveBeenCalledWith('Socket error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    test('should handle reconnection attempts', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'reconnect') {
          callback(1);
        }
      });

      socketService['setupEventListeners']();

      expect(consoleSpy).toHaveBeenCalledWith('Socket reconnected after 1 attempts');
      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    test('should clean up listeners on disconnect', () => {
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      socketService.disconnect();

      expect(mockSocket.off).toHaveBeenCalledWith('connect');
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect');
      expect(mockSocket.off).toHaveBeenCalledWith('connect_error');
      expect(mockSocket.off).toHaveBeenCalledWith('error');
      expect(mockSocket.off).toHaveBeenCalledWith('reconnect');
    });
  });

  describe('message queue', () => {
    test('should queue messages when not connected', () => {
      socketService['isConnected'] = false;
      
      const messageData = {
        conversationId: 'conv123',
        content: 'Queued message',
        type: 'text' as const
      };

      socketService.sendMessage(messageData);

      // Message should be queued
      expect(socketService['messageQueue']).toContainEqual(messageData);
    });

    test('should send queued messages on reconnection', () => {
      // Queue a message
      const messageData = {
        conversationId: 'conv123',
        content: 'Queued message',
        type: 'text' as const
      };
      socketService['messageQueue'].push(messageData);

      // Simulate connection
      mockSocket.connected = true;
      socketService['socket'] = mockSocket;
      socketService['isConnected'] = true;

      // Simulate reconnection event
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect') {
          callback();
        }
      });

      socketService['setupEventListeners']();

      expect(mockSocket.emit).toHaveBeenCalledWith('send_message', messageData);
      expect(socketService['messageQueue']).toHaveLength(0);
    });
  });
});