#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Validar formato da mensagem de commit
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Formato de commit inválido!"
    echo ""
    echo "Use o formato: tipo(escopo): descrição"
    echo ""
    echo "Tipos válidos:"
    echo "  feat:     nova funcionalidade"
    echo "  fix:      correção de bug"
    echo "  docs:     documentação"
    echo "  style:    formatação"
    echo "  refactor: refatoração"
    echo "  test:     testes"
    echo "  chore:    manutenção"
    echo "  perf:     performance"
    echo "  ci:       CI/CD"
    echo "  build:    build"
    echo "  revert:   reverter commit"
    echo ""
    echo "Exemplos:"
    echo "  feat(auth): adicionar login JWT"
    echo "  fix(api): corrigir validação de email"
    echo "  docs: atualizar README"
    echo ""
    exit 1
fi

echo "✅ Formato de commit válido!"