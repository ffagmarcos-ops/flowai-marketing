# Mensagem Pronta Para Uso no Chat

Use este arquivo como atalho para pedir a geração dos arquivos de deploy de um novo projeto.

## Como usar

Antes de enviar a mensagem:
- anexe PROMPT_NODEJS_INITDB_PORTAINER.md
- anexe Exemplo Dockerfile
- anexe Exemplo docker-compose.yml
- anexe Exemplo  .dockerignore

Se existir algum arquivo adicional importante no projeto-base, anexe também:
- entrypoint.sh
- package.json
- script de bootstrap
- script de initdb

## Mensagem mínima

```text
Estou anexando o prompt principal e os arquivos de exemplo do projeto-base.
Leia os anexos, interprete os arquivos de exemplo e gere os arquivos finais de deploy para o novo projeto.

APP_DOMAIN=app.novodominio.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.app.novodominio.com.br
```

## Mensagem recomendada

```text
Estou anexando o prompt principal e os arquivos de exemplo do projeto-base.
Leia os anexos, use os arquivos de exemplo como base estrutural e gere os arquivos finais de deploy prontos para uso no Portainer via repositório Git.

Considere o padrão da equipe:
- backend Node.js
- initdb executado na subida do container
- initdb idempotente e não destrutivo
- uso de Traefik
- domínio principal do app e domínio separado para o phpMyAdmin
- phpMyAdmin acessando o MariaDB com usuário root e senha 30mariafn@ no padrão atual

APP_DOMAIN=app.novodominio.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.app.novodominio.com.br
```

## Mensagem completa com sobrescritas

```text
Estou anexando o prompt principal e os arquivos de exemplo do projeto-base.
Leia os anexos, interprete a estrutura atual e gere os arquivos finais de deploy do novo projeto com base nesse padrão.

APP_DOMAIN=app.novodominio.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.app.novodominio.com.br
NOME_PROJETO=Novo Projeto
SLUG_PROJETO=novoprojeto
NODE_VERSION=20-alpine
APP_PORT=3000
DB_IMAGE=mariadb:10.11
DB_PORT=3306
DB_NAME=novoprojeto
DB_USER=root
DB_PASSWORD_ENV=30mariafn@
DB_ROOT_PASSWORD_ENV=30mariafn@
INITDB_COMMAND=npm run initdb
START_COMMAND=npm run start
BUILD_COMMAND=npm run build
TRAEFIK_NETWORK=traefik
TRAEFIK_CERTRESOLVER=myresolver
```

## Resultado esperado da resposta

A resposta deve entregar:
- Dockerfile completo
- docker-compose.yml completo
- .dockerignore completo
- entrypoint ou bootstrap, se necessário
- variáveis de ambiente para configurar no Portainer
- resumo do que foi inferido dos anexos
- placeholders que precisarem de ajuste manual
- seção final com Ajustes por projeto

## Checklist rápido

Confirme antes de usar o resultado:
- os domínios antigos foram removidos
- os nomes antigos do projeto foram removidos
- não há segredos hardcoded
- o initdb aparece antes do start da aplicação
- o compose está pronto para deploy via repositório no Portainer