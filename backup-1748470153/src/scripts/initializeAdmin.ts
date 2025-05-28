import { User } from '../models/User';
import { LoggerService } from '../services/LoggerService';
import { DatabaseService } from '../services/DatabaseService';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const logger = LoggerService.getInstance();
const dbService = DatabaseService.getInstance();

async function initializeAdmin() {
  try {
    logger.info('Iniciando criação do usuário administrador...');

    // Conectar ao banco de dados
    await dbService.connect();

    // Verificar se já existe um admin
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      logger.info('Usuário administrador já existe. Pulando criação.');
      return;
    }

    // Obter credenciais do .env ou usar padrões
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    // Criar usuário admin
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
      isActive: true,
    });

    await admin.save();

    logger.info(`Usuário administrador criado com sucesso: ${adminEmail}`);
  } catch (error) {
    logger.error('Erro ao criar usuário administrador:', error);
  } finally {
    // Desconectar do banco de dados
    await dbService.disconnect();
    process.exit(0);
  }
}

// Executar função
initializeAdmin();
