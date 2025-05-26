// ===== src/services/SocketService.ts =====
import { Server as SocketIOServer, Socket } from 'socket.io';
import { LoggerService } from './LoggerService';

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer;
  private logger: LoggerService;
  private connectedUsers: Map<string, any> = new Map();

  private constructor(io: SocketIOServer) {
    this.io = io;
    this.logger = LoggerService.getInstance();
  }

  public static getInstance(io?: SocketIOServer): SocketService {
    if (!SocketService.instance && io) {
      SocketService.instance = new SocketService(io);
    }
    return SocketService.instance;
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
      this.setupSocketEvents(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    this.logger.info(`Nova conexão WebSocket: ${socket.id}`);
    
    const userInfo = {
      id: socket.id,
      connectedAt: new Date(),
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address
    };
    
    this.connectedUsers.set(socket.id, userInfo);
  }

  private setupSocketEvents(socket: Socket): void {
    socket.on('disconnect', () => {
      this.logger.info(`WebSocket desconectado: ${socket.id}`);
      this.connectedUsers.delete(socket.id);
    });

    socket.on('error', (error) => {
      this.logger.error(`Erro WebSocket ${socket.id}:`, error);
    });
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }
}