FROM node:20-alpine

# Instala curl para o healthcheck e bash para o entrypoint
RUN apk add --no-cache curl bash

WORKDIR /app

# Copia arquivos de dependência primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instala dependências de produção e de desenvolvimento (necessárias para o build TypeScript)
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

# Executa a compilação do TypeScript e compilação estática do Vite (gera pasta dist/)
RUN npm run build

# Garante permissões de execução para o entrypoint
RUN chmod +x /app/entrypoint.sh

ENV PORT=3000
EXPOSE 3000

# Healthcheck do container
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
