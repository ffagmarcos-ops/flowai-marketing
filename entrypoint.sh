#!/bin/bash
set -e

# Configurações de conexão do MariaDB a partir das variáveis de ambiente
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"30mariafn@"}

echo "[ENTRYPOINT] Aguardando a inicialização do MariaDB em ${DB_HOST}:${DB_PORT}..."

# Loop para aguardar a porta do banco estar aberta
for i in {1..30}; do
  if bash -c "cat < /dev/null > /dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; then
    echo "[ENTRYPOINT] MariaDB está ativo e respondendo na porta ${DB_PORT}."
    break
  fi
  echo "[ENTRYPOINT] Banco indisponível. Aguardando 2 segundos... ($i/30)"
  sleep 2
done

# Executa o script de inicialização/atualização de banco (initdb)
echo "[ENTRYPOINT] Executando o script de initdb..."
npm run initdb

# Inicia a aplicação principal
echo "[ENTRYPOINT] Iniciando a aplicação Node.js..."
exec npm run start
