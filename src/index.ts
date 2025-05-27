// src/index.ts - Ponto de entrada principal da aplicação
import 'dotenv/config';
import { startServer } from '../src/Server';

// Iniciar a aplicação
startServer().catch((error) => {
  console.error('❌ Falha crítica na inicialização:', error);
  process.exit(1);
});