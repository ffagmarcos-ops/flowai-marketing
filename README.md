# ⚡ M.O FLOW - Fluxo de Trabalho Inteligente & CRM de Marketing

O **M.O FLOW** é um sistema premium de gerenciamento de fluxos de trabalho e CRM de marketing projetado para agências publicitárias e seus clientes. O sistema combina controle de demandas em Kanban, CRM detalhado, calendário de postagens integrado com arquivos ICS externos de 2026, relatórios automatizados de SLA, assistente de onboarding inteligente alimentado por dados estruturados em JSON, e uma central exclusiva de aprovação de criativos para clientes com logs de auditoria e integrações de simulação de WhatsApp.

---

## 🎨 Design & Interface Premium
- **Estética Futurista:** Design escuro (dark mode), bordas semitransparentes com efeitos glassmorphism (`backdrop-filter`), sombras suaves e realces em gradiente dourado (`#D4AF37`) e neon vibrantes.
- **Componentização Avançada:** Arquitetura limpa baseada em React + TypeScript com CSS nativo e componentização desacoplada de dados através do `DataContext`.
- **Acessibilidade & Micro-animações:** Efeitos de hover suaves em menus, transições de estado fluidas e cards dinâmicos que ganham vida nas interações.

---

## 🔑 Segurança e Perfis de Acesso

O sistema gerencia dois grandes grupos de usuários de forma estritamente independente para garantir que clientes só acessem dados da própria organização:

### 1. Acesso Agência (Interno)
Usuários internos gerenciam toda a operação de criação, contatos, automações e relatórios consolidados de todos os clientes.
- **Login Master Admin:**
  * **Usuário:** `M.O publicidade`
  * **Senha:** `after2026`
- **Cargos Suportados:** `agencia` (Super Admin), `gestor` (Gestor de Contas), `designer` (Criação/Arte).
- **Recursos Disponíveis:** Dashboard completo, Kanban Inteligente, CRM de Clientes, Central de Mensagens, Calendário, IA Copywriter, Painel Administrativo de Usuários, e Relatórios Consolidados de SLA.

### 2. Acesso Cliente (Externo)
Usuários do cliente final entram no sistema utilizando o e-mail cadastrado no CRM e a senha exclusiva configurada pela agência.
- **Restrição de Visibilidade:** O cliente só visualiza demandas, calendários, contatos e métricas referentes à empresa a qual ele está vinculado.
- **Limitação de Operação:** Telas de dashboard, Kanban e calendário operam em modo de leitura. O cliente não pode salvar alterações nas demandas, criar novos contatos ou disparar WhatsApps (os botões são automaticamente ocultados ou desabilitados para visualizadores).
- **Portal de Aprovação:** Apenas demandas em que o contato do cliente foi expressamente designado como **Aprovador** aparecerão na sua lista de aprovações.

---

## 📁 Estrutura de Pastas e Componentes

A estrutura de arquivos do projeto está organizada da seguinte forma:

```text
MARKETING FLOW MO PUBLICIDADE/
├── src/
│   ├── components/
│   │   ├── LoginScreen.tsx      # Tela de login glassmorphic com seleção dinâmica master vs. cliente.
│   │   └── Sidebar.tsx          # Menu de navegação reativo com filtragem por permissão e upload de foto.
│   ├── context/
│   │   └── DataContext.tsx      # Engine de persistência em LocalStorage simulando MySQL + Redis.
│   ├── data/
│   │   └── assistant_guide.json # Base de conhecimento JSON que alimenta o assistente virtual onboarding.
│   ├── views/
│   │   ├── AdminView.tsx        # Controle de usuários internos e log de acessos.
│   │   ├── AIToolsView.tsx      # Gerador de legendas e briefings com IA de marketing.
│   │   ├── ApprovalPortalView.tsx # Workspace do cliente para aprovar, ajustar ou rejeitar criativos.
│   │   ├── CalendarView.tsx     # Calendário de postagens 2026 integrado a ICS com suporte a previews de mídia.
│   │   ├── CRMView.tsx          # Cadastro de empresas (com logos), contatos (com avatares) e acessos.
│   │   ├── DashboardView.tsx    # Indicadores consolidados de SLAs, prazos e entregas.
│   │   ├── ConversationsView.tsx# Simulador central de chats e envios ativos via WhatsApp API.
│   │   ├── KanbanView.tsx       # Kanban interativo de demandas com regras de distribuição.
│   │   └── ReportsView.tsx      # Relatórios de SLA filtráveis por cliente de forma segura.
│   ├── App.tsx                  # Ponto de entrada, roteador de abas e gaveta do Assistente Virtual.
│   ├── types.ts                 # Interfaces de tipos estruturados do banco de dados simulado.
│   └── index.css                # Folha de estilos central e declaração de tokens de design.
```

---

## 🚀 Módulos & Funcionalidades Principais

### 1. Dashboard Executivo (`DashboardView.tsx`)
Apresenta contadores rápidos de demandas criadas, em aprovação e publicadas. Mostra também gráficos simplificados de SLAs cumpridos e taxa de engajamento médio de resposta do cliente.

### 2. Kanban de Fluxo Inteligente (`KanbanView.tsx`)
Quadro dinâmico onde demandas transitam pelas colunas de `Solicitado`, `Produção`, `Aprovação`, `Agendado`, `Publicado` e `Concluído`. Permite anexar arquivos de imagem (base64) que são exibidos de forma destacada nos cards, definir prazos e prioridades, além de selecionar múltiplos aprovadores específicos do cliente.

### 3. CRM de Clientes e Contatos (`CRMView.tsx`)
- **Empresas:** Armazena CNPJ, segmento, contato direto e logotipos da marca (via URL externa ou upload de imagem convertida em base64).
- **Contatos:** Lista os profissionais associados ao cliente. Cada um possui cargo, e-mail de login, senha exclusiva de acesso e uma lista personalizada de acessos (`Acessos Permitidos`).

### 4. Portal de Aprovação de Criativos (`ApprovalPortalView.tsx`)
- **Área de Decisão do Cliente:** Exibe em tamanho ampliado (mínimo de 420px de altura) o criativo anexado à demanda.
- **Ações:** O cliente clica em "Aprovar", "Solicitar Ajuste" ou "Reprovar". A ação exige preenchimento de assinatura/comentários e grava no histórico o IP do usuário, data, hora e status.
- **Notificação Integrada:** Gera um painel para que a agência notifique o cliente pelo WhatsApp com templates prontos (Nova Demanda, Lembrete, SLA de Urgência, e Agradecimento).

### 5. Calendário de Marketing 2026 (`CalendarView.tsx`)
- Visões mensais, semanais e diárias para acompanhar postagens programadas.
- **Suporte a ICS Externos:** Permite carregar calendários de datas comemorativas nacionais para 2026.
- **Previsão de Imagem:** Cards exibem miniaturas grandes da mídia anexada para melhor escaneabilidade visual.
- **Redirecionamento Rápido:** Clientes têm um botão dedicado "Analisar e Aprovar no Portal" que os envia diretamente para o Portal de Aprovação.

### 6. Relatórios de Auditoria (`ReportsView.tsx`)
Audita o tempo médio de resposta de cada cliente e o cumprimento dos acordos de nível de serviço (SLA). Agências podem filtrar por empresa de maneira global; clientes veem as informações restritas à própria empresa.

### 7. Assistente Virtual Onboarding (`App.tsx`)
Um botão flutuante `🤖 Assistente M.O FLOW` no canto inferior direito abre uma gaveta lateral baseada em `assistant_guide.json` para guiar o usuário em suas primeiras etapas dentro do sistema, incluindo links de navegação ativa para as telas descritas.

---

## 🛠️ Tecnologias e Configuração de Desenvolvimento

1. **Framework:** React 18 + TypeScript + Vite.
2. **Estilização:** CSS Vanilla moderna com uso intenso de Custom Properties (variáveis CSS) para temas e layout flex/grid responsivo.
3. **Persistência:** `localStorage` local reativo para persistência de dados simulada entre sessões e recarregamento de página.

### Comandos Úteis

#### Instalação das dependências:
```bash
npm install
```

#### Rodar o servidor de desenvolvimento localmente:
```bash
npm run dev
```

#### Testar e buildar a versão final otimizada para produção:
```bash
npm run build
```
