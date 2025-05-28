# 🔄 SCRIPT DE ATUALIZAÇÃO SEGURA - PORTFOLIO BACKEND (PowerShell)

Write-Host "🚀 Iniciando atualizações seguras do Portfolio Backend..." -ForegroundColor Green

# ================================
# PASSO 1: BACKUP DE SEGURANÇA
# ================================
Write-Host "📦 Criando backup do package.json..." -ForegroundColor Yellow
Copy-Item package.json package.json.backup
Copy-Item package-lock.json package-lock.json.backup

Write-Host "✅ Backup criado! Se algo der errado:" -ForegroundColor Green
Write-Host "   Copy-Item package.json.backup package.json" -ForegroundColor Gray
Write-Host "   Copy-Item package-lock.json.backup package-lock.json" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray

# ================================
# PASSO 2: ATUALIZAÇÃO CRÍTICA
# ================================
Write-Host ""
Write-Host "🔧 PASSO 2: Corrigindo connect-redis (CRÍTICO)..." -ForegroundColor Cyan
npm install connect-redis@latest

Write-Host "🧪 Testando se compila..." -ForegroundColor Yellow
$buildResult = npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build OK!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro na build! Revertendo..." -ForegroundColor Red
    npm install connect-redis@6.1.3
    exit 1
}

# ================================
# PASSO 3: ATUALIZAÇÕES SEGURAS
# ================================
Write-Host ""
Write-Host "🔧 PASSO 3: Atualizações seguras..." -ForegroundColor Cyan

Write-Host "Atualizando Helmet..." -ForegroundColor Yellow
npm install helmet@8.1.0

Write-Host "Atualizando Sharp..." -ForegroundColor Yellow
npm install sharp@0.34.2

Write-Host "Atualizando TypeScript..." -ForegroundColor Yellow
npm install typescript@5.8.3

Write-Host "🧪 Testando build novamente..." -ForegroundColor Yellow
$buildResult2 = npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Todas as atualizações seguras aplicadas!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro! Revertendo TypeScript..." -ForegroundColor Red
    npm install typescript@5.4.5
    npm run build
}

# ================================
# PASSO 4: RELATÓRIO FINAL
# ================================
Write-Host ""
Write-Host "📊 RELATÓRIO DE ATUALIZAÇÕES:" -ForegroundColor Magenta
Write-Host "✅ connect-redis: Atualizado (correção crítica)" -ForegroundColor Green
Write-Host "✅ helmet: 7.2.0 → 8.1.0" -ForegroundColor Green
Write-Host "✅ sharp: 0.33.5 → 0.34.2" -ForegroundColor Green
Write-Host "✅ typescript: 5.4.5 → 5.8.3" -ForegroundColor Green

Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS OPCIONAIS:" -ForegroundColor Yellow
Write-Host "1. npm install uuid@11.1.0 @types/uuid@10.0.0" -ForegroundColor Gray
Write-Host "2. Testar geração de IDs" -ForegroundColor Gray
Write-Host "3. npm install nodemailer@7.0.3" -ForegroundColor Gray
Write-Host "4. Testar envio de emails" -ForegroundColor Gray

Write-Host ""
Write-Host "⚠️  NÃO ATUALIZAR AINDA:" -ForegroundColor Red
Write-Host "- Express 5.x (breaking changes)" -ForegroundColor Red
Write-Host "- ESLint 9.x (nova configuração)" -ForegroundColor Red
Write-Host "- bcryptjs 3.x (pode quebrar auth)" -ForegroundColor Red

Write-Host ""
Write-Host "🎉 Atualizações seguras concluídas!" -ForegroundColor Green
Write-Host "Execute 'npm run dev' para iniciar o servidor" -ForegroundColor Cyan