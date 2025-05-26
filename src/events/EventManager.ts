import { EventEmitter } from 'events';
import { LoggerService } from '../services/LoggerService';

export class EventManager {
  private static instance: EventManager;
  private emitter: EventEmitter;
  private logger: LoggerService;

  private constructor() {
    this.emitter = new EventEmitter();
    this.logger = LoggerService.getInstance();
    this.setupEventHandlers();
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private setupEventHandlers(): void {
    this.emitter.on('error', (error) => {
      this.logger.error('Event error:', error);
    });
  }

  public emit(event: string, data: any): void {
    this.emitter.emit(event, data);
  }

  public on(event: string, handler: (data: any) => void): void {
    this.emitter.on(event, handler);
  }
}
