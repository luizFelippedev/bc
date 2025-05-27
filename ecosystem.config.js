// ecosystem.config.js - Configuração PM2 para Produção
module.exports = {
  apps: [
    {
      // Aplicação principal
      name: 'portfolio-backend',
      script: 'dist/index.js',
      cwd: './',
      args: '',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      
      // Configurações de ambiente
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        LOG_LEVEL: 'info'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000,
        LOG_LEVEL: 'warn'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'error'
      },
      
      // Monitoramento e restart
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'exports', 'backups'],
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logs
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Auto restart configurações
      cron_restart: '0 2 * * *', // Restart diário às 2h
      
      // Source map support
      source_map_support: true,
      
      // Variáveis específicas da aplicação
      env_file: '.env'
    },
    
    // Worker para tarefas em background (opcional)
    {
      name: 'portfolio-worker',
      script: 'dist/worker.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'background',
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background',
        LOG_LEVEL: 'warn'
      },
      
      cron_restart: '0 3 * * *', // Restart às 3h
      max_memory_restart: '512M',
      
      // Logs separados para worker
      log_file: './logs/worker-combined.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      
      // Desabilitado por padrão (habilitar se necessário)
      autorestart: false
    }
  ],
  
  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/portfolio-backend.git',
      path: '/var/www/portfolio-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:seu-usuario/portfolio-backend.git',
      path: '/var/www/portfolio-backend-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};