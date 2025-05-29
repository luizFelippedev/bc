// tests/unit/services/CacheService.test.ts
import { CacheService } from '../../../src/services/CacheService';
import Redis from 'ioredis';

// Mock do Redis
jest.mock('ioredis');
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedisClient: jest.Mocked<Redis>;

  beforeEach(() => {
    // Reset todos os mocks
    jest.clearAllMocks();
    
    // Criar mock do cliente Redis
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      incrby: jest.fn(),
      decrby: jest.fn(),
      mget: jest.fn(),
      pipeline: jest.fn(),
      flushall: jest.fn(),
      dbsize: jest.fn(),
      info: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
      connect: jest.fn(),
      memory: jest.fn()
    } as any;

    // Configurar o mock do Redis para retornar nosso cliente mockado
    MockedRedis.mockImplementation(() => mockRedisClient);
    
    // Obter instância do CacheService
    cacheService = CacheService.getInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('deve retornar dados do cache quando existir', async () => {
      // Arrange
      const key = 'test-key';
      const expectedData = { id: 1, name: 'Test' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(expectedData));

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedData);
    });

    it('deve retornar null quando dados não existirem', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockRedisClient.get.mockResolvedValue(null);

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('deve retornar null em caso de erro', async () => {
      // Arrange
      const key = 'error-key';
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('deve armazenar dados com TTL', async () => {
      // Arrange
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      const ttl = 3600;
      mockRedisClient.setex.mockResolvedValue('OK');

      // Act
      const result = await cacheService.set(key, data, ttl);

      // Assert
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(data)
      );
      expect(result).toBe(true);
    });

    it('deve armazenar dados sem TTL', async () => {
      // Arrange
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      mockRedisClient.set.mockResolvedValue('OK');

      // Act
      const result = await cacheService.set(key, data, 0);

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(data)
      );
      expect(result).toBe(true);
    });

    it('deve retornar false em caso de erro', async () => {
      // Arrange
      const key = 'error-key';
      const data = { id: 1, name: 'Test' };
      mockRedisClient.setex.mockRejectedValue(new Error('Redis error'));

      // Act
      const result = await cacheService.set(key, data, 3600);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('deve excluir chave existente', async () => {
      // Arrange
      const key = 'test-key';
      mockRedisClient.del.mockResolvedValue(1);

      // Act
      const result = await cacheService.delete(key);

      // Assert
      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('deve retornar false para chave inexistente', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockRedisClient.del.mockResolvedValue(0);

      // Act
      const result = await cacheService.delete(key);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deletePattern', () => {
    it('deve excluir múltiplas chaves por padrão', async () => {
      // Arrange
      const pattern = 'test:*';
      const keys = ['test:1', 'test:2', 'test:3'];
      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(3);

      // Act
      const result = await cacheService.deletePattern(pattern);

      // Assert
      expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedisClient.del).toHaveBeenCalledWith(...keys);
      expect(result).toBe(3);
    });

    it('deve retornar 0 quando nenhuma chave for encontrada', async () => {
      // Arrange
      const pattern = 'non-existent:*';
      mockRedisClient.keys.mockResolvedValue([]);

      // Act
      const result = await cacheService.deletePattern(pattern);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('exists', () => {
    it('deve retornar true para chave existente', async () => {
      // Arrange
      const key = 'existing-key';
      mockRedisClient.exists.mockResolvedValue(1);

      // Act
      const result = await cacheService.exists(key);

      // Assert
      expect(mockRedisClient.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('deve retornar false para chave inexistente', async () => {
      // Arrange
      const key = 'non-existing-key';
      mockRedisClient.exists.mockResolvedValue(0);

      // Act
      const result = await cacheService.exists(key);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('increment', () => {
    it('deve incrementar valor', async () => {
      // Arrange
      const key = 'counter';
      const increment = 5;
      mockRedisClient.incrby.mockResolvedValue(10);

      // Act
      const result = await cacheService.increment(key, increment);

      // Assert
      expect(mockRedisClient.incrby).toHaveBeenCalledWith(key, increment);
      expect(result).toBe(10);
    });

    it('deve usar incremento padrão de 1', async () => {
      // Arrange
      const key = 'counter';
      mockRedisClient.incrby.mockResolvedValue(1);

      // Act
      const result = await cacheService.increment(key);

      // Assert
      expect(mockRedisClient.incrby).toHaveBeenCalledWith(key, 1);
      expect(result).toBe(1);
    });
  });

  describe('getBatch', () => {
    it('deve obter múltiplas chaves', async () => {
      // Arrange
      const keys = ['key1', 'key2', 'key3'];
      const values = ['value1', 'value2', null];
      mockRedisClient.mget.mockResolvedValue(values);

      // Act
      const result = await cacheService.getBatch(keys);

      // Assert
      expect(mockRedisClient.mget).toHaveBeenCalledWith(...keys);
      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: null
      });
    });
  });

  describe('isHealthy', () => {
    it('deve retornar true quando Redis estiver saudável', async () => {
      // Arrange
      mockRedisClient.ping.mockResolvedValue('PONG');

      // Act
      const result = await cacheService.isHealthy();

      // Assert
      expect(mockRedisClient.ping).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve retornar false quando Redis não estiver saudável', async () => {
      // Arrange
      mockRedisClient.ping.mockRejectedValue(new Error('Connection error'));

      // Act
      const result = await cacheService.isHealthy();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas do Redis', async () => {
      // Arrange
      const mockInfo = 'keyspace_hits:1000\r\nkeyspace_misses:100\r\nused_memory:1048576\r\nconnected_clients:5';
      mockRedisClient.info.mockResolvedValue(mockInfo);
      mockRedisClient.dbsize.mockResolvedValue(50);

      // Act
      const result = await cacheService.getStats();

      // Assert
      expect(result).toEqual({
        totalKeys: 50,
        memoryUsage: '1 MB',
        connectedClients: 5,
        keyspaceHits: 1000,
        keyspaceMisses: 100,
        hitRate: '90.91%'
      });
    });

    it('deve retornar estatísticas padrão em caso de erro', async () => {
      // Arrange
      mockRedisClient.info.mockRejectedValue(new Error('Info error'));
      mockRedisClient.dbsize.mockRejectedValue(new Error('DBSize error'));

      // Act
      const result = await cacheService.getStats();

      // Assert
      expect(result).toEqual({
        totalKeys: 0,
        memoryUsage: '0 B',
        connectedClients: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        hitRate: '0%'
      });
    });
  });

  describe('flushAll', () => {
    it('deve limpar todo o cache', async () => {
      // Arrange
      mockRedisClient.flushall.mockResolvedValue('OK');

      // Act
      const result = await cacheService.flushAll();

      // Assert
      expect(mockRedisClient.flushall).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve retornar false em caso de erro', async () => {
      // Arrange
      mockRedisClient.flushall.mockRejectedValue(new Error('Flush error'));

      // Act
      const result = await cacheService.flushAll();

      // Assert
      expect(result).toBe(false);
    });
  });
});