import { EventEmitter } from 'events';

class ApplicationEvents extends EventEmitter {
  private static instance: ApplicationEvents;

  private constructor() {
    super();
    this.setMaxListeners(20);
  }

  public static getInstance(): ApplicationEvents {
    if (!ApplicationEvents.instance) {
      ApplicationEvents.instance = new ApplicationEvents();
    }
    return ApplicationEvents.instance;
  }
}

export const eventEmitter = ApplicationEvents.getInstance();

// Event Types
export const EVENT_TYPES = {
  USER: {
    CREATED: 'user:created',
    UPDATED: 'user:updated',
    DELETED: 'user:deleted',
    LOGIN: 'user:login',
    LOGOUT: 'user:logout'
  },
  PROJECT: {
    CREATED: 'project:created',
    UPDATED: 'project:updated',
    DELETED: 'project:deleted',
    VIEWED: 'project:viewed'
  },
  SYSTEM: {
    ERROR: 'system:error',
    WARNING: 'system:warning',
    BACKUP_STARTED: 'system:backup:started',
    BACKUP_COMPLETED: 'system:backup:completed'
  }
};
