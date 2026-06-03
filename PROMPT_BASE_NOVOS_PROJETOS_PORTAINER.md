Crie a estrutura de deploy de um novo projeto com base nos arquivos de exemplo deste repositório.

Contexto:
- Use como referência os arquivos Dockerfile, docker-compose.yml e .dockerignore existentes.
- Os arquivos atuais mostram um exemplo funcional de stack com aplicação, healthcheck HTTP, banco MariaDB, phpMyAdmin, rede externa do Traefik e labels para roteamento por domínio.
- Considere que, nos novos projetos, normalmente usamos Node.js no backend. Portanto, o resultado deve priorizar Node.js como padrão, mesmo que o exemplo atual esteja estruturado de outra forma.
- O deploy será feito no Portainer usando repositório Git, então a saída precisa estar pronta para stack deployment via repository.

Objetivo:
- Adaptar os arquivos para um novo projeto sem perder o padrão de infraestrutura já validado.
- Trocar todos os nomes, domínios, containers, volumes, redes internas, labels e variáveis que hoje estejam vinculados ao projeto anterior.
- Deixar a configuração preparada para ambientes futuros, sem segredos hardcoded.
- Garantir que exista um processo de initdb executado na subida do container para criar ou atualizar a estrutura do banco com segurança, sem perda de dados.

Parâmetros do novo projeto:
- NOME_PROJETO: <preencher>
- SLUG_PROJETO: <preencher; usar minúsculas, sem espaços, ex: meuapp>
- BACKEND_RUNTIME: node
- NODE_VERSION: <preencher; ex: 20-alpine ou 22-alpine>
- INITDB_COMMAND: <preencher; ex: npm run initdb>
- APP_DOMAIN: <preencher; ex: app.seudominio.com>
- PHPMYADMIN_DOMAIN: <preencher; ex: phpmyadmin.app.seudominio.com>
- APP_PORT: <preencher; manter compatível com a aplicação>
- DB_IMAGE: <preencher; ex: mariadb:10.11>
- DB_PORT: <preencher; ex: 3306>
- DB_NAME: <preencher>
- DB_USER: <preencher>
- DB_PASSWORD: <preencher como variável de ambiente, nunca fixo no arquivo>
- DB_ROOT_PASSWORD: <preencher como variável de ambiente, nunca fixo no arquivo>
- TRAEFIK_NETWORK: traefik
- TRAEFIK_CERTRESOLVER: myresolver
- REPO_DEPLOY_MODE: Portainer via Git repository

Regras obrigatórias:
- Preserve a estrutura geral do exemplo, mas adapte o backend para Node.js por padrão e substitua qualquer ocorrência do projeto antigo pelo novo slug.
- Gere nomes consistentes para services, container_name, volumes, routers e services do Traefik usando SLUG_PROJETO.
- Não deixe senhas, tokens ou chaves fixas no docker-compose.yml. Use variáveis de ambiente com fallback vazio ou nomes explícitos para preenchimento no Portainer.
- Mantenha healthchecks funcionais para aplicação e banco.
- Mantenha a rede externa do Traefik e uma rede interna dedicada ao projeto.
- Considere que todo projeto possui um domínio principal da aplicação e um domínio específico para o phpMyAdmin.
- Se houver serviço administrativo como phpMyAdmin, vincule-o a PHPMYADMIN_DOMAIN.
- Quando seguir o padrão atual da equipe, considere acesso ao MariaDB por phpMyAdmin com usuário root e senha 30mariafn@.
- Garanta que o docker-compose fique adequado para Portainer Stack via repositório, sem depender de ajustes manuais pós-clone.
- Se algum valor depender do projeto, use placeholders claros e padronizados.
- Assuma backend Node.js salvo se eu informar outra stack explicitamente.
- Para backend Node.js, use convenções compatíveis com package.json, npm ou yarn, porta exposta da aplicação e comando de inicialização adequado ao projeto.
- Todo projeto deve prever um initdb executado ao iniciar o container da aplicação.
- O initdb deve ser idempotente: pode criar estruturas faltantes e aplicar atualizações compatíveis sem apagar dados já existentes.
- O initdb deve rodar antes do processo principal da aplicação, por entrypoint, script de bootstrap ou comando equivalente.
- O initdb deve ser pensado para consistência pós-atualização do sistema, contemplando criação e evolução do schema de banco de dados.
- Nunca trate initdb como recriação destrutiva do banco. O comportamento esperado é migrar ou ajustar a estrutura preservando informações existentes.
- Se a aplicação não usar MariaDB ou phpMyAdmin, adapte a composição mantendo a mesma lógica de isolamento, healthcheck e roteamento.

Entregáveis esperados:
- Dockerfile final adaptado.
- docker-compose.yml final adaptado.
- .dockerignore final adaptado.
- Estratégia de initdb/bootstrapping do banco incluída no resultado.
- Lista objetiva das variáveis de ambiente que deverão ser configuradas no Portainer.
- Resumo curto explicando quais valores precisam ser trocados por projeto.

Padrões específicos para o docker-compose.yml:
- O serviço principal deve usar build local se o repositório contiver o código-fonte.
- O serviço principal deve entrar na rede externa do Traefik e na rede interna do projeto.
- As labels do Traefik devem apontar para APP_DOMAIN no serviço principal.
- O serviço administrativo, se existir, deve usar PHPMYADMIN_DOMAIN.
- O traefik.docker.network deve apontar para a rede externa do Traefik.
- Volumes nomeados devem usar o slug do projeto.
- depends_on deve considerar healthcheck do banco quando aplicável.
- O serviço principal deve contemplar a execução do INITDB_COMMAND antes de subir a aplicação, preferencialmente de forma transparente no entrypoint ou command.

Padrões específicos para o Dockerfile:
- Preserve a ideia do exemplo: imagem enxuta, instalação mínima de dependências, cópia do código, EXPOSE da porta da aplicação e HEALTHCHECK HTTP.
- Para projetos Node.js, prefira imagem oficial do Node em variante enxuta, copie package.json e lockfile antes do restante do código para melhor cache, instale dependências com npm ci quando aplicável e defina o comando final conforme o entrypoint real do projeto.
- Se houver script de start no package.json, use-o como padrão. Se houver necessidade de build, contemple a etapa de build de forma explícita.
- Quando necessário, inclua entrypoint ou script de startup responsável por executar o initdb e só depois iniciar a aplicação.
- Ajuste caminhos e dependências apenas se o novo projeto exigir.

Formato de resposta desejado:
- Responda com cada arquivo completo em blocos separados.
- Se houver script de entrypoint ou bootstrap para o initdb, inclua esse arquivo também na resposta.
- Depois liste as variáveis de ambiente necessárias para cadastro no Portainer.
- Finalize com uma seção chamada Ajustes por projeto contendo apenas os pontos que precisam ser trocados em cada novo deploy.

Validação antes de concluir:
- Verifique se nenhum domínio antigo permaneceu no resultado.
- Verifique se nenhum nome antigo de container, volume, rede ou router permaneceu no resultado.
- Verifique se o backend foi estruturado em Node.js, salvo instrução contrária.
- Verifique se o initdb foi incluído de forma explícita e idempotente.
- Verifique se o domínio principal do app e o domínio do phpMyAdmin foram aplicados corretamente.
- Verifique se não há segredo hardcoded.
- Verifique se o stack resultante pode ser usado em deploy via repositório no Portainer.