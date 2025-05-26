import { App } from './app';
import { LoggerService } from './services/LoggerService';

const logger = LoggerService.getInstance();
const server = new App();

async function bootstrap() {
  try {
    await server.start();

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  logger.info('Received shutdown signal');
  try {
    await server.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

bootstrap();
