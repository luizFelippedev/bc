// tests/unit/services/LoggerService.test.ts
import { LoggerService } from '../../../src/services/LoggerService';

describe('LoggerService', () => {
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = LoggerService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = LoggerService.getInstance();
      const instance2 = LoggerService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(LoggerService);
    });
  });

  describe('logging methods', () => {
    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      loggerService.error('Test error message');
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      loggerService.info('Test info message');
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      loggerService.warn('Test warning message');
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
      
      loggerService.debug('Test debug message');
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('logRequest', () => {
    it('should log HTTP request information', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      const mockReq = {
        method: 'GET',
        url: '/api/test',
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        user: { id: 'test-user-id' }
      } as any;

      const mockRes = {
        statusCode: 200,
        get: jest.fn().mockReturnValue('100')
      } as any;

      loggerService.logRequest(mockReq, mockRes, 150.5);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockReq.get).toHaveBeenCalledWith('user-agent');
      expect(mockRes.get).toHaveBeenCalledWith('content-length');
    });

    it('should log warning for error status codes', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const mockReq = {
        method: 'POST',
        url: '/api/test',
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        user: { id: 'test-user-id' }
      } as any;

      const mockRes = {
        statusCode: 404,
        get: jest.fn().mockReturnValue('0')
      } as any;

      loggerService.logRequest(mockReq, mockRes, 50.2);
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('metadata logging', () => {
    it('should log with metadata object', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      const metadata = {
        userId: 'test-user',
        action: 'test-action',
        timestamp: new Date().toISOString()
      };
      
      loggerService.info('Test message with metadata', metadata);
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle null metadata gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      expect(() => {
        loggerService.info('Test message', null);
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle undefined metadata gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      expect(() => {
        loggerService.info('Test message', undefined);
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
