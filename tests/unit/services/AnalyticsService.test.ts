// tests/unit/services/AnalyticsService.test.ts
import { AnalyticsService } from '../../../src/services/AnalyticsService';
import { Analytics } from '../../../src/models/Analytics';
import { Project } from '../../../src/models/Project';
import { CacheService } from '../../../src/services/CacheService';

// Mock dos modelos
jest.mock('../../../src/models/Analytics');
jest.mock('../../../src/models/Project');
jest.mock('../../../src/services/CacheService');

const MockedAnalytics = Analytics as jest.MockedClass<typeof Analytics>;
const MockedProject = Project as jest.MockedClass<typeof Project>;
const MockedCacheService = CacheService as jest.MockedClass<typeof CacheService>;

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do CacheService
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      getInstance: jest.fn()
    } as any;
    
    MockedCacheService.getInstance.mockReturnValue(mockCacheService);
    
    // Obter instância do AnalyticsService
    analyticsService = AnalyticsService.getInstance();
  });

  describe('trackEvent', () => {
    it('deve rastrear evento de visualização de projeto', async () => {
      // Arrange
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(true);
      
      MockedAnalytics.mockImplementation(() => ({
        save: mockSave
      } as any));
      
      MockedProject.findByIdAndUpdate = mockFindByIdAndUpdate;
      
      const eventOptions = {
        eventType: 'project_view' as const,
        projectId: '60d5ecb54b24a1a8c8b9e6f1',
        sessionId: 'session123',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '192.168.1.1'
      };

      // Act
      await analyticsService.trackEvent(eventOptions);

      // Assert
      expect(MockedAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'project_view',
          projectId: '60d5ecb54b24a1a8c8b9e6f1',
          sessionId: 'session123',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
      );
      
      expect(mockSave).toHaveBeenCalled();
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        '60d5ecb54b24a1a8c8b9e6f1',
        { $inc: { views: 1 } }
      );
    });

    it('deve rastrear evento de visualização de página', async () => {
      // Arrange
      const mockSave = jest.fn().mockResolvedValue(true);
      
      MockedAnalytics.mockImplementation(() => ({
        save: mockSave
      } as any));
      
      const eventOptions = {
        eventType: 'page_view' as const,
        page: '/about',
        sessionId: 'session456',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        ip: '10.0.0.1'
      };

      // Act
      await analyticsService.trackEvent(eventOptions);

      // Assert
      expect(MockedAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'page_view',
          page: '/about',
          sessionId: 'session456',
          device: 'mobile', // Deve detectar mobile do user agent
          browser: expect.any(String),
          os: 'iOS'
        })
      );
      
      expect(mockSave).toHaveBeenCalled();
    });

    it('deve lidar com erro durante rastreamento', async () => {
      // Arrange
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));
      
      MockedAnalytics.mockImplementation(() => ({
        save: mockSave
      } as any));
      
      const eventOptions = {
        eventType: 'page_view' as const,
        sessionId: 'session789',
        userAgent: 'Mozilla/5.0',
        ip: '127.0.0.1'
      };

      // Act & Assert
      await expect(analyticsService.trackEvent(eventOptions)).resolves.not.toThrow();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getDetailedStats', () => {
    it('deve retornar estatísticas detalhadas', async () => {
      // Arrange
      const mockEvents = [
        { eventType: 'page_view', device: 'desktop', createdAt: new Date() },
        { eventType: 'project_view', device: 'mobile', createdAt: new Date() },
        { eventType: 'certificate_view', device: 'tablet', createdAt: new Date() }
      ];
      
      MockedAnalytics.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockEvents)
        })
      });

      const filters = { eventType: 'page_view' };

      // Act
      const result = await analyticsService.getDetailedStats(filters);

      // Assert
      expect(MockedAnalytics.find).toHaveBeenCalledWith(filters);
      expect(result).toEqual({
        total: 3,
        byType: {
          pageView: 1,
          projectView: 1,
          certificateView: 1,
          contact: 0
        },
        byDevice: {
          desktop: 1,
          mobile: 1,
          tablet: 1
        }
      });
    });

    it('deve retornar objeto vazio em caso de erro', async () => {
      // Arrange
      MockedAnalytics.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      const result = await analyticsService.getDetailedStats();

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('getRealTimeStats', () => {
    it('deve retornar estatísticas em cache', async () => {
      // Arrange
      const cachedStats = {
        activeVisitors: 5,
        pageViews: 10,
        projectViews: 3,
        recentProjects: [],
        lastUpdated: new Date()
      };
      
      mockCacheService.get.mockResolvedValue(cachedStats);

      // Act
      const result = await analyticsService.getRealTimeStats();

      // Assert
      expect(mockCacheService.get).toHaveBeenCalledWith('admin:realtime:stats');
      expect(result).toEqual(cachedStats);
    });

    it('deve calcular estatísticas se não estiverem em cache', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(null);
      
      const mockEvents = [
        { eventType: 'page_view', sessionId: 'session1', createdAt: new Date() },
        { eventType: 'project_view', sessionId: 'session2', createdAt: new Date() },
        { eventType: 'page_view', sessionId: 'session1', createdAt: new Date() }
      ];
      
      MockedAnalytics.find = jest.fn().mockResolvedValue(mockEvents);
      MockedAnalytics.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await analyticsService.getRealTimeStats();

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          activeVisitors: 2, // sessions únicas
          pageViews: 2,
          projectViews: 1,
          recentProjects: [],
          lastUpdated: expect.any(Date)
        })
      );
      
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'admin:realtime:stats',
        expect.any(Object),
        15
      );
    });

    it('deve retornar estatísticas padrão em caso de erro', async () => {
      // Arrange
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));
      MockedAnalytics.find = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      const result = await analyticsService.getRealTimeStats();

      // Assert
      expect(result).toEqual({
        activeVisitors: 0,
        pageViews: 0,
        projectViews: 0,
        recentProjects: [],
        lastUpdated: expect.any(Date)
      });
    });
  });

  describe('parseUserAgent', () => {
    it('deve detectar Chrome no Windows', () => {
      // Arrange
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      // Act - Precisamos acessar o método privado para teste
      const result = (analyticsService as any).parseUserAgent(userAgent);

      // Assert
      expect(result).toEqual({
        device: 'desktop',
        browser: 'Chrome',
        os: 'Windows'
      });
    });

    it('deve detectar Safari no iPhone', () => {
      // Arrange
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
      
      // Act
      const result = (analyticsService as any).parseUserAgent(userAgent);

      // Assert
      expect(result).toEqual({
        device: 'mobile',
        browser: 'Safari',
        os: 'iOS'
      });
    });

    it('deve detectar Firefox no Linux', () => {
      // Arrange
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0';
      
      // Act
      const result = (analyticsService as any).parseUserAgent(userAgent);

      // Assert
      expect(result).toEqual({
        device: 'desktop',
        browser: 'Firefox',
        os: 'Linux'
      });
    });

    it('deve detectar user agent desconhecido', () => {
      // Arrange
      const userAgent = 'Unknown Browser 1.0';
      
      // Act
      const result = (analyticsService as any).parseUserAgent(userAgent);

      // Assert
      expect(result).toEqual({
        device: 'desktop',
        browser: 'unknown',
        os: 'unknown'
      });
    });

    it('deve detectar tablet', () => {
      // Arrange
      const userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      
      // Act
      const result = (analyticsService as any).parseUserAgent(userAgent);

      // Assert
      expect(result).toEqual({
        device: 'tablet',
        browser: 'Safari',
        os: 'iOS'
      });
    });
  });
});