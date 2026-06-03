Use este prompt quando eu anexar este arquivo junto com os arquivos de exemplo do projeto-base.

Modo de uso desta chamada:
- Considere que eu vou anexar este prompt e também os arquivos de exemplo atuais, como Dockerfile, docker-compose.yml e .dockerignore.
- Leia e interprete os arquivos anexados de exemplo antes de gerar qualquer resposta.
- Reaproveite a estrutura, o padrão de nomenclatura, a lógica de Traefik, a organização de serviços, healthchecks, redes, volumes e estratégia de deploy vista nos exemplos.
- Eu normalmente preciso preencher apenas os domínios do novo projeto.
- Sempre que possível, infira o restante com base nos arquivos anexados de exemplo.
- Se algum valor não puder ser inferido com segurança a partir dos anexos, mantenha placeholder claro e padronizado no resultado, sem bloquear a geração dos arquivos.

Entrada mínima esperada do usuário junto com os anexos:
- APP_DOMAIN: <preencher; ex: app.seudominio.com>
- PHPMYADMIN_DOMAIN: <preencher; ex: phpmyadmin.app.seudominio.com>

Entrada opcional, apenas se eu quiser sobrescrever algo:
- NOME_PROJETO: <opcional>
- SLUG_PROJETO: <opcional>
- NODE_VERSION: <opcional>
- APP_PORT: <opcional>
- DB_IMAGE: <opcional>
- DB_PORT: <opcional>
- DB_NAME: <opcional>
- DB_USER: <opcional>
- DB_PASSWORD_ENV: <opcional>
- DB_ROOT_PASSWORD_ENV: <opcional>
- INITDB_COMMAND: <opcional>
- START_COMMAND: <opcional>
- BUILD_COMMAND: <opcional>
- TRAEFIK_NETWORK: <opcional>
- TRAEFIK_CERTRESOLVER: <opcional>

Crie a estrutura completa de deploy de um novo projeto usando Node.js no backend, com base nos arquivos de exemplo anexados, mantendo o padrão operacional usado pela equipe.

Contexto obrigatório:
- Use os arquivos de exemplo anexados como fonte principal de verdade para a estrutura de Docker, docker-compose, Traefik, banco e Portainer.
- O backend padrão dos novos projetos é Node.js.
- O deploy sempre será feito pelo Portainer usando repositório Git.
- Todo projeto possui um domínio principal da aplicação e um domínio separado para o phpMyAdmin.
- O domínio do phpMyAdmin será usado para acesso administrativo ao banco de dados do projeto.
- Quando o projeto seguir o padrão atual da equipe, considere MariaDB com usuário root e senha padrão 30mariafn@.
- Todo projeto precisa subir com um processo de initdb executado na inicialização do container da aplicação.
- Esse initdb deve criar ou atualizar o banco com segurança, sem apagar dados existentes, garantindo consistência após atualização do sistema.

Objetivo:
- Gerar os arquivos prontos para um novo projeto em Node.js.
- Adaptar tudo para o novo nome do projeto, novos domínios e nova identidade do stack.
- Manter compatibilidade com Traefik e Portainer.
- Preservar o padrão operacional atual, incluindo o acesso do phpMyAdmin ao MariaDB com root quando esse for o modelo adotado no projeto-base.
- Garantir estratégia idempotente de inicialização e atualização de banco.

Dados do projeto:
- NOME_PROJETO: <inferir do domínio ou manter placeholder se não vier informado>
- SLUG_PROJETO: <inferir do domínio ou do exemplo; manter minúsculo e sem espaços>
- NODE_VERSION: <inferir do padrão atual ou manter placeholder>
- APP_PORT: <inferir do exemplo ou manter o valor do projeto>
- APP_DOMAIN: <preenchimento obrigatório>
- PHPMYADMIN_DOMAIN: <preenchimento obrigatório>
- DB_IMAGE: <inferir do exemplo>
- DB_PORT: <inferir do exemplo>
- DB_NAME: <inferir do exemplo e adaptar para o novo slug>
- DB_USER: <inferir do exemplo; quando seguir o padrão atual, usar root>
- DB_PASSWORD_ENV: <quando seguir o padrão atual, considerar 30mariafn@ como senha padrão do banco>
- DB_ROOT_PASSWORD_ENV: <quando seguir o padrão atual, considerar 30mariafn@ como senha root padrão>
- INITDB_COMMAND: <inferir do padrão do projeto ou usar placeholder claro>
- START_COMMAND: <inferir do padrão do projeto ou usar placeholder claro>
- BUILD_COMMAND: <inferir se aplicável>
- TRAEFIK_NETWORK: <inferir do exemplo; padrão traefik>
- TRAEFIK_CERTRESOLVER: <inferir do exemplo; manter placeholder se necessário>

Instruções obrigatórias:
- Gere Dockerfile, docker-compose.yml e .dockerignore completos.
- Se necessário para o initdb, gere também entrypoint.sh ou script equivalente de bootstrap.
- Interprete primeiro os anexos e só depois proponha os arquivos finais.
- Se eu informar apenas APP_DOMAIN e ADMIN_DOMAIN, gere mesmo assim todos os arquivos necessários usando os exemplos anexados como base.
- Se eu informar apenas APP_DOMAIN e PHPMYADMIN_DOMAIN, gere mesmo assim todos os arquivos necessários usando os exemplos anexados como base.
- Sempre que um valor puder ser deduzido dos exemplos anexados, deduza em vez de me pedir mais dados.
- Quando um valor não puder ser deduzido com segurança, use placeholder explícito e pronto para ajuste posterior no Portainer ou no repositório.
- Substitua completamente qualquer referência do projeto antigo por SLUG_PROJETO.
- Gere nomes consistentes para services, containers, volumes, networks internas, routers e services do Traefik.
- Quando o padrão do projeto-base anexado usar root com senha 30mariafn@ para MariaDB e phpMyAdmin, preserve esse padrão explicitamente no resultado, salvo instrução contrária.
- O phpMyAdmin deve acessar o banco usando usuário root e a senha root padrão quando esse for o padrão do projeto-base.
- O serviço principal deve ser Node.js e usar o código do próprio repositório com build local.
- O serviço principal deve executar o initdb antes de iniciar a aplicação.
- O initdb deve ser idempotente e seguro para reexecução em atualizações.
- O initdb não pode recriar o banco de forma destrutiva.
- O initdb deve aplicar criação inicial e evolução de schema preservando os dados existentes.
- O serviço principal deve depender do healthcheck do banco quando aplicável.
- O serviço principal deve entrar na rede externa do Traefik e em uma rede interna do projeto.
- Se houver phpMyAdmin ou serviço administrativo, ele deve usar PHPMYADMIN_DOMAIN.
- O roteamento principal do Traefik deve usar APP_DOMAIN.
- O stack final deve estar pronto para Portainer Stack via Git repository, sem ajustes manuais obrigatórios após o clone.

Regras específicas para o Dockerfile:
- Use imagem oficial do Node em variante enxuta.
- Copie package.json e lockfile antes do restante do código para aproveitar cache de dependências.
- Use npm ci quando aplicável.
- Se o projeto exigir build, execute a etapa de build de forma explícita.
- Exponha APP_PORT.
- Inclua healthcheck HTTP compatível com a rota de saúde da aplicação.
- Se o initdb depender de um script de bootstrap, copie esse script e garanta permissão de execução.
- O comando final do container deve respeitar a ordem: initdb primeiro, aplicação depois.

Regras específicas para o docker-compose.yml:
- O serviço principal deve usar build: . quando o repositório contiver a aplicação.
- Defina container_name com base em SLUG_PROJETO.
- Use restart: always.
- Configure environment com APP_PORT, conexão de banco, flags do runtime e demais variáveis necessárias.
- Quando o padrão do projeto-base anexado usar MariaDB root/root password fixa, reflita esse mesmo padrão no resultado salvo instrução contrária.
- Configure healthcheck HTTP para a aplicação.
- Configure labels do Traefik com routers e services nomeados com SLUG_PROJETO.
- Defina traefik.docker.network apontando para a rede externa do Traefik.
- Se houver banco, use volume nomeado com base em SLUG_PROJETO.
- Se houver phpMyAdmin, inclua labels e variáveis coerentes com PHPMYADMIN_DOMAIN.
- Quando seguir o padrão atual da equipe, configure phpMyAdmin com PMA_USER=root e PMA_PASSWORD=30mariafn@.

Regras específicas para o initdb:
- Assuma que todo projeto possui um comando de inicialização de banco, como npm run initdb.
- Esse comando deve ser executado sempre que o container da aplicação iniciar.
- O script ou comando precisa tolerar múltiplas execuções sem corromper dados.
- O comportamento esperado é semelhante a migrações versionadas ou sincronização segura de schema.
- Se houver necessidade, inclua um wait-for-db antes do initdb.
- Se for necessário criar um entrypoint, ele deve aguardar o banco, executar o initdb e então iniciar o processo principal.

Saída esperada:
- Entregue cada arquivo completo em blocos separados.
- Inclua, se aplicável, o arquivo de entrypoint/bootstrap completo.
- Depois apresente uma lista objetiva de variáveis de ambiente para cadastro no Portainer.
- Antes dos arquivos, mostre de forma curta quais valores foram inferidos a partir dos anexos e quais ficaram como placeholder.
- Finalize com uma seção chamada Ajustes por projeto.

A seção Ajustes por projeto deve conter somente:
- nome do projeto
- slug do projeto
- domínio principal
- domínio do phpMyAdmin
- porta da aplicação
- nome do banco
- usuário do banco
- imagem do banco, se mudar
- nome do comando de initdb, se mudar
- nome do comando de start, se mudar

Checklist de validação antes de responder:
- Nenhum domínio antigo deve aparecer.
- Nenhum nome antigo de projeto deve aparecer.
- O backend deve estar em Node.js.
- O initdb deve estar explícito, antes do start da aplicação.
- O initdb deve ser idempotente e não destrutivo.
- O domínio principal do app e o domínio do phpMyAdmin devem estar distintos e corretos.
- Quando o padrão anexado usar root e senha 30mariafn@, esse acesso deve estar refletido corretamente no MariaDB e no phpMyAdmin.
- Os arquivos finais devem refletir a interpretação dos anexos de exemplo.
- O resultado deve estar adequado para deploy via repositório no Portainer.