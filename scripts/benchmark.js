// scripts/benchmark.js - Script de Benchmark de Performance
const http = require('http');
const { performance } = require('perf_hooks');

// Configurações
const CONFIG = {
  baseUrl: process.env.BENCHMARK_URL || 'http://localhost:5000',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 10,
  requestsPerUser: parseInt(process.env.REQUESTS_PER_USER) || 20,
  warmupRequests: parseInt(process.env.WARMUP_REQUESTS) || 5,
  timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000
};

// Endpoints para testar
const ENDPOINTS = [
  { path: '/health', method: 'GET', weight: 1 },
  { path: '/api/public/projects', method: 'GET', weight: 3 },
  { path: '/api/public/certificates', method: 'GET', weight: 2 },
  { path: '/api/public/configuration', method: 'GET', weight: 1 },
  { path: '/docs', method: 'GET', weight: 1 }
];

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para colorir texto
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Classe para coletar estatísticas
class Statistics {
  constructor() {
    this.requests = [];
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
  }

  addRequest(responseTime, statusCode, endpoint) {
    this.requests.push({
      responseTime,
      statusCode,
      endpoint,
      timestamp: Date.now()
    });
  }

  addError(error, endpoint) {
    this.errors.push({
      error: error.message,
      endpoint,
      timestamp: Date.now()
    });
  }

  getReport() {
    const responseTimes = this.requests.map(r => r.responseTime);
    const successfulRequests = this.requests.filter(r => r.statusCode < 400);
    const errorRequests = this.requests.filter(r => r.statusCode >= 400);
    
    const totalTime = this.endTime - this.startTime;
    const rps = this.requests.length / (totalTime / 1000);

    return {
      summary: {
        totalRequests: this.requests.length,
        successfulRequests: successfulRequests.length,
        errorRequests: errorRequests.length,
        errors: this.errors.length,
        successRate: (successfulRequests.length / this.requests.length * 100).toFixed(2),
        requestsPerSecond: rps.toFixed(2),
        totalTime: (totalTime / 1000).toFixed(2)
      },
      performance: {
        averageResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2),
        minResponseTime: Math.min(...responseTimes).toFixed(2),
        maxResponseTime: Math.max(...responseTimes).toFixed(2),
        p50: this.percentile(responseTimes, 50).toFixed(2),
        p90: this.percentile(responseTimes, 90).toFixed(2),
        p95: this.percentile(responseTimes, 95).toFixed(2),
        p99: this.percentile(responseTimes, 99).toFixed(2)
      },
      endpointStats: this.getEndpointStats()
    };
  }

  percentile(arr, p) {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getEndpointStats() {
    const endpointGroups = {};
    
    this.requests.forEach(req => {
      if (!endpointGroups[req.endpoint]) {
        endpointGroups[req.endpoint] = [];
      }
      endpointGroups[req.endpoint].push(req.responseTime);
    });

    const stats = {};
    Object.keys(endpointGroups).forEach(endpoint => {
      const times = endpointGroups[endpoint];
      stats[endpoint] = {
        count: times.length,
        avg: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
        min: Math.min(...times).toFixed(2),
        max: Math.max(...times).toFixed(2),
        p95: this.percentile(times, 95).toFixed(2)
      };
    });

    return stats;
  }
}

// Função para fazer uma requisição HTTP
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.baseUrl);
    const startTime = performance.now();

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Portfolio-Benchmark/1.0',
        'Accept': 'application/json, text/html',
        'Connection': 'keep-alive'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          bodySize: data.length,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Função para selecionar endpoint baseado no peso
function selectEndpoint() {
  const totalWeight = ENDPOINTS.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of ENDPOINTS) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return ENDPOINTS[0]; // fallback
}

// Função para simular um usuário
async function simulateUser(userId, stats) {
  console.log(colorize(`Usuário ${userId} iniciado`, 'blue'));
  
  for (let i = 0; i < CONFIG.requestsPerUser; i++) {
    try {
      const endpoint = selectEndpoint();
      const result = await makeRequest(endpoint.path, endpoint.method);
      
      stats.addRequest(result.responseTime, result.statusCode, endpoint.path);
      
      // Pequeno delay entre requisições
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
    } catch (error) {
      const endpoint = selectEndpoint();
      stats.addError(error, endpoint.path);
    }
  }
  
  console.log(colorize(`Usuário ${userId} finalizado`, 'green'));
}

// Função para warmup
async function warmup() {
  console.log(colorize('\n🔥 Iniciando warmup...', 'yellow'));
  
  for (let i = 0; i < CONFIG.warmupRequests; i++) {
    try {
      await makeRequest('/health');
      process.stdout.write('.');
    } catch (error) {
      process.stdout.write('x');
    }
  }
  
  console.log(colorize('\n✅ Warmup concluído!\n', 'green'));
}

// Função para imprimir relatório
function printReport(stats) {
  const report = stats.getReport();
  
  console.log(colorize('\n📊 RELATÓRIO DE BENCHMARK', 'bright'));
  console.log('='.repeat(50));
  
  // Resumo
  console.log(colorize('\n📈 RESUMO GERAL', 'cyan'));
  console.log(`Total de Requisições: ${colorize(report.summary.totalRequests, 'bright')}`);
  console.log(`Requisições Bem-sucedidas: ${colorize(report.summary.successfulRequests, 'green')}`);
  console.log(`Requisições com Erro: ${colorize(report.summary.errorRequests, 'red')}`);
  console.log(`Erros de Conexão: ${colorize(report.summary.errors, 'red')}`);
  console.log(`Taxa de Sucesso: ${colorize(report.summary.successRate + '%', 'green')}`);
  console.log(`Requisições por Segundo: ${colorize(report.summary.requestsPerSecond, 'bright')}`);
  console.log(`Tempo Total: ${colorize(report.summary.totalTime + 's', 'bright')}`);
  
  // Performance
  console.log(colorize('\n⚡ PERFORMANCE', 'cyan'));
  console.log(`Tempo de Resposta Médio: ${colorize(report.performance.averageResponseTime + 'ms', 'bright')}`);
  console.log(`Tempo Mínimo: ${colorize(report.performance.minResponseTime + 'ms', 'green')}`);
  console.log(`Tempo Máximo: ${colorize(report.performance.maxResponseTime + 'ms', 'red')}`);
  console.log(`P50 (Mediana): ${colorize(report.performance.p50 + 'ms', 'yellow')}`);
  console.log(`P90: ${colorize(report.performance.p90 + 'ms', 'yellow')}`);
  console.log(`P95: ${colorize(report.performance.p95 + 'ms', 'magenta')}`);
  console.log(`P99: ${colorize(report.performance.p99 + 'ms', 'red')}`);
  
  // Estatísticas por endpoint
  console.log(colorize('\n🎯 ESTATÍSTICAS POR ENDPOINT', 'cyan'));
  Object.keys(report.endpointStats).forEach(endpoint => {
    const stats = report.endpointStats[endpoint];
    console.log(`\n${colorize(endpoint, 'bright')}`);
    console.log(`  Requisições: ${stats.count}`);
    console.log(`  Tempo Médio: ${stats.avg}ms`);
    console.log(`  Min/Max: ${stats.min}ms / ${stats.max}ms`);
    console.log(`  P95: ${stats.p95}ms`);
  });
  
  // Análise de performance
  console.log(colorize('\n🔍 ANÁLISE', 'cyan'));
  
  const avgResponseTime = parseFloat(report.performance.averageResponseTime);
  const rps = parseFloat(report.summary.requestsPerSecond);
  const successRate = parseFloat(report.summary.successRate);
  
  if (successRate < 95) {
    console.log(colorize('⚠️  Taxa de sucesso baixa! Verifique logs de erro.', 'red'));
  }
  
  if (avgResponseTime > 1000) {
    console.log(colorize('⚠️  Tempo de resposta alto! Considere otimizações.', 'yellow'));
  } else if (avgResponseTime < 100) {
    console.log(colorize('✅ Excelente tempo de resposta!', 'green'));
  }
  
  if (rps < 50) {
    console.log(colorize('⚠️  Baixo throughput. Considere scaling horizontal.', 'yellow'));
  } else if (rps > 200) {
    console.log(colorize('✅ Excelente throughput!', 'green'));
  }
  
  console.log('\n' + '='.repeat(50));
}

// Função principal
async function runBenchmark() {
  console.log(colorize('🚀 PORTFOLIO BACKEND BENCHMARK', 'bright'));
  console.log('='.repeat(50));
  console.log(`URL Base: ${colorize(CONFIG.baseUrl, 'blue')}`);
  console.log(`Usuários Simultâneos: ${colorize(CONFIG.concurrentUsers, 'bright')}`);
  console.log(`Requisições por Usuário: ${colorize(CONFIG.requestsPerUser, 'bright')}`);
  console.log(`Total de Requisições: ${colorize(CONFIG.concurrentUsers * CONFIG.requestsPerUser, 'bright')}`);
  
  // Verificar se servidor está disponível
  try {
    await makeRequest('/health');
    console.log(colorize('✅ Servidor disponível!', 'green'));
  } catch (error) {
    console.log(colorize('❌ Servidor não disponível!', 'red'));
    console.log(colorize(`Erro: ${error.message}`, 'red'));
    process.exit(1);
  }
  
  // Warmup
  await warmup();
  
  // Executar benchmark
  console.log(colorize('🏃‍♂️ Executando benchmark...', 'yellow'));
  
  const stats = new Statistics();
  stats.startTime = Date.now();
  
  // Criar promises para usuários simultâneos
  const userPromises = [];
  for (let i = 1; i <= CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i, stats));
  }
  
  // Aguardar todos os usuários terminarem
  await Promise.all(userPromises);
  
  stats.endTime = Date.now();
  
  // Imprimir relatório
  printReport(stats);
}

// Executar benchmark
if (require.main === module) {
  runBenchmark().catch(error => {
    console.error(colorize(`❌ Erro no benchmark: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { runBenchmark, Statistics };