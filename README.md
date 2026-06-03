# Uso dos Prompts de Deploy

Este diretório contém um fluxo padrão para gerar arquivos de deploy de novos projetos com base em arquivos de exemplo já validados pela equipe.

O objetivo é simples:
- reaproveitar a estrutura de Docker e Portainer já usada nos projetos
- trocar apenas os domínios e, quando necessário, alguns poucos parâmetros
- gerar os arquivos finais de deploy com o mesmo padrão operacional da equipe

## Arquivos disponíveis

- PROMPT_NODEJS_INITDB_PORTAINER.md
Prompt principal para novos projetos Node.js com initdb idempotente e deploy via repositório no Portainer.

- PROMPT_BASE_NOVOS_PROJETOS_PORTAINER.md
Prompt mais genérico, usado como referência base.

- Exemplo Dockerfile
Arquivo de referência estrutural para o Dockerfile.

- Exemplo docker-compose.yml
Arquivo de referência estrutural para o compose com Traefik, banco e deploy via stack.

- Exemplo  .dockerignore
Arquivo de referência estrutural para o .dockerignore.

## Quando usar

Use esse fluxo sempre que for iniciar um novo projeto e precisar gerar:
- Dockerfile
- docker-compose.yml
- .dockerignore
- entrypoint ou bootstrap, quando o initdb exigir

Esse processo foi pensado para projetos com estas premissas:
- backend normalmente em Node.js
- deploy via Portainer usando repositório Git
- Traefik fazendo o roteamento por domínio
- domínio principal para a aplicação
- domínio separado para o phpMyAdmin
- banco persistente
- phpMyAdmin acessando o banco do projeto
- padrão atual com MariaDB usando usuário root e senha 30mariafn@
- initdb executado na subida do container da aplicação
- initdb idempotente, sem perda de dados

## Fluxo recomendado

1. Anexe ao chat o arquivo PROMPT_NODEJS_INITDB_PORTAINER.md.
2. Anexe também os arquivos de exemplo do projeto-base.
3. Informe pelo menos os domínios do novo projeto.
4. Peça a geração dos arquivos finais de deploy.
5. Revise apenas os placeholders que não puderem ser inferidos automaticamente.
6. Use os arquivos gerados no repositório que será publicado no Portainer.

## Arquivos que devem ser anexados

Anexe sempre estes arquivos:
- PROMPT_NODEJS_INITDB_PORTAINER.md
- Exemplo Dockerfile
- Exemplo docker-compose.yml
- Exemplo  .dockerignore

Se existir algum arquivo adicional importante no projeto-base, também pode anexar, por exemplo:
- entrypoint.sh
- script de bootstrap
- arquivo de initdb
- package.json

## Entrada mínima

Na maioria dos casos, basta informar:

```text
APP_DOMAIN=app.seudominio.com
PHPMYADMIN_DOMAIN=phpmyadmin.app.seudominio.com
```

O prompt foi preparado para inferir o restante a partir dos arquivos anexados sempre que isso for possível.

## Entrada opcional

Se quiser sobrescrever algum valor, informe também o que mudar. Exemplo:

```text
APP_DOMAIN=api.cliente.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.api.cliente.com.br
NOME_PROJETO=API Cliente
SLUG_PROJETO=apicliente
APP_PORT=3000
NODE_VERSION=20-alpine
INITDB_COMMAND=npm run initdb
START_COMMAND=npm run start
```

## Exemplo de chamada pronta

Use a mensagem abaixo quando for gerar um novo projeto:

```text
Estou anexando o prompt principal e os arquivos de exemplo do projeto-base.
Leia os anexos, interprete os arquivos de exemplo e gere os arquivos finais de deploy para o novo projeto.

APP_DOMAIN=app.novodominio.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.app.novodominio.com.br
```

Se quiser uma chamada mais completa:

```text
Estou anexando o prompt principal e os arquivos de exemplo do projeto-base.
Leia os anexos, use os exemplos como base estrutural e gere os arquivos finais de deploy prontos para uso no Portainer via repositório Git.

APP_DOMAIN=app.novodominio.com.br
PHPMYADMIN_DOMAIN=phpmyadmin.app.novodominio.com.br
NOME_PROJETO=Novo Projeto
SLUG_PROJETO=novoprojeto
APP_PORT=3000
NODE_VERSION=20-alpine
INITDB_COMMAND=npm run initdb
START_COMMAND=npm run start
```

## O que o resultado deve entregar

O resultado esperado do prompt é:
- Dockerfile completo
- docker-compose.yml completo
- .dockerignore completo
- entrypoint ou bootstrap, se necessário para o initdb
- lista de variáveis de ambiente para configurar no Portainer
- resumo do que foi inferido automaticamente
- lista do que ficou como placeholder
- seção final com os ajustes específicos daquele projeto

## Regras operacionais do padrão

Ao usar esse fluxo, o resultado final deve respeitar estas regras:
- backend em Node.js, salvo instrução contrária
- compose pronto para Portainer Stack via Git repository
- uso de rede externa do Traefik
- domínio principal para a aplicação
- domínio dedicado para o phpMyAdmin ou serviço administrativo equivalente
- nomes de container, volume, rede interna e routers alinhados ao slug do projeto
- quando seguir o padrão atual, MariaDB com usuário root e senha 30mariafn@
- phpMyAdmin usando o mesmo root do banco quando esse for o padrão do projeto
- variáveis de ambiente preparadas para cadastro no Portainer
- initdb rodando antes da aplicação iniciar
- initdb idempotente e não destrutivo

## Como revisar o resultado

Antes de usar os arquivos gerados, valide estes pontos:
- os domínios antigos foram removidos
- os nomes antigos do projeto foram removidos
- os nomes dos serviços e volumes batem com o novo slug
- não existem senhas reais no docker-compose.yml
- o initdb está explícito antes do start da aplicação
- o stack está coerente com deploy por repositório no Portainer

## Quando ajustar manualmente

Pode ser necessário ajustar manualmente quando:
- o projeto não usar MariaDB
- o projeto não usar phpMyAdmin
- a aplicação usar build especial
- a aplicação usar outro gerenciador de pacotes
- o comando de initdb tiver nome específico
- o projeto depender de entrypoint customizado

Nesses casos, o prompt deve manter o padrão geral e deixar placeholders claros onde não for possível inferir com segurança.

## Recomendação de uso em todos os projetos

Para padronizar a equipe, o uso ideal é:
- manter este diretório como base de referência
- sempre anexar o prompt principal e os arquivos de exemplo
- informar no mínimo APP_DOMAIN e PHPMYADMIN_DOMAIN
- sobrescrever apenas quando houver diferença real no projeto

## Arquivo principal recomendado

Para o uso diário, prefira sempre:

- PROMPT_NODEJS_INITDB_PORTAINER.md

Esse é o prompt mais alinhado com o padrão atual da equipe.

---

## 🛠️ Guia de Desenvolvimento Local com MariaDB

Para executar e testar o projeto localmente com integração real ao MariaDB, siga as instruções abaixo:

### Opção A: Rodando MariaDB via Docker (Recomendado)
Para rodar sem precisar instalar o MariaDB nativamente no seu macOS:
1. Certifique-se de que o **Docker Desktop** está iniciado.
2. Execute o script auxiliar fornecido na raiz do projeto:
   ```bash
   ./run-local-db.sh
   ```
3. O script criará e iniciará automaticamente um container MariaDB na porta padrão `3306` com o usuário `root` e senha `30mariafn@`, configurando o banco `flowai`.

### Opção B: Rodando MariaDB Nativo (Homebrew no macOS)
Se preferir instalar o banco local direto na sua máquina:
1. Instale o MariaDB via Homebrew:
   ```bash
   brew install mariadb
   ```
2. Inicie o serviço do MariaDB:
   ```bash
   brew services start mariadb
   ```
3. Configure a senha padrão do usuário `root` para bater com o padrão da equipe (`30mariafn@`):
   ```bash
   mariadb-admin -u root password '30mariafn@'
   ```
4. Crie manualmente o banco de dados do projeto:
   ```bash
   mariadb -u root -p'30mariafn@' -e "CREATE DATABASE IF NOT EXISTS flowai;"
   ```

### Executando a Aplicação
Depois de subir o banco local por qualquer uma das opções acima:
1. Inicialize as tabelas e insira as sementes iniciais de teste:
   ```bash
   npm run initdb
   ```
2. Compile o frontend React:
   ```bash
   npm run build
   ```
3. Inicie o servidor local Node.js (que responderá pela aplicação na porta `3000` e servirá a API + Documentação Swagger):
   ```bash
   npm run start
   ```
4. Acesse os serviços no navegador:
   - Aplicação M.O FLOW: `http://localhost:3000/`
   - Documentação Interativa da API (Swagger UI): `http://localhost:3000/api-docs`