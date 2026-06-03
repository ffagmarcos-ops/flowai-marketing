import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Usuario, Cliente, Contato, Demanda, Comentario, 
  Historico, Aprovacao, MensagemWhatsapp, Automacao, RoleType, StatusDemanda,
  ItemPlanejamento
} from '../types';

/**
 * Interface do Contexto do Banco de Dados Relacional MySQL + Redis (Simulado por REST API)
 * Controle de Permissões:
 *  - "agencia" / "gestor" / "designer": Acesso total para criar/mover/deletar cartões e visualizar dashboards.
 *  - "cliente": Acesso apenas em leitura para o Kanban, visualização do calendário filtrado, e acesso total ao portal de aprovação de criativos e whatsapp central.
 */
interface DataContextType {
  usuarios: Usuario[];
  clientes: Cliente[];
  contatos: Contato[];
  demandas: Demanda[];
  comentarios: Comentario[];
  historicos: Historico[];
  aprovacoes: Aprovacao[];
  mensagensWhatsapp: MensagemWhatsapp[];
  automacoes: Automacao[];
  currentUsuario: Usuario;
  setCurrentUsuario: (user: Usuario) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCalendarClientId: string;
  setSelectedCalendarClientId: (id: string) => void;
  selectedApprovalDemandId: string;
  setSelectedApprovalDemandId: (id: string) => void;
  // Campaign Planner
  itensPlanejamento: ItemPlanejamento[];
  addItemPlanejamento: (item: Omit<ItemPlanejamento, 'id'>) => void;
  updateItemPlanejamento: (item: ItemPlanejamento) => void;
  deleteItemPlanejamento: (id: string) => void;
  converterPlanejamentoEmDemanda: (id: string) => void;
  // CRUD & Actions
  addDemanda: (demanda: Omit<Demanda, 'id' | 'criadoEm' | 'slaEstourado'>) => void;
  updateDemanda: (demanda: Demanda) => void;
  moveDemanda: (id: string, nextStatus: StatusDemanda, usuarioNome?: string) => void;
  addComentario: (demandaId: string, conteudo: string, usuarioOverride?: { nome: string; role: RoleType }) => void;
  processarAprovacao: (
    demandaId: string, 
    aprovacaoId: string, 
    status: 'Aprovado' | 'Ajuste Solicitado' | 'Reprovado', 
    observacao: string,
    usuarioNome: string
  ) => void;
  enviarMensagemWhatsApp: (clienteId: string, conteudo: string, direcao: 'entrada' | 'saida') => void;
  addCliente: (cliente: Omit<Cliente, 'id' | 'nivelEngajamento' | 'tempoMedioResposta' | 'atrasosContados' | 'aprovacoesContadas'>) => void;
  updateCliente: (cliente: Cliente) => void;
  updateContato: (contato: Contato) => void;
  addContato: (contato: Contato) => void;
  updateUsuario: (usuario: Usuario) => void;
  toggleAutomacao: (id: string) => void;
  simularPrazoVencido: (demandaId: string) => void;
  resetDatabase: () => void;
  addUsuario: (usuario: Usuario) => void;
  regenerarToken: (id: string, type: 'usuario' | 'contato') => Promise<void>;
  aiLogs: string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Core Mock Data — only master user; other users are created dynamically
const DEFAULT_USUARIOS: Usuario[] = [
  { id: 'master1', nome: 'M.O publicidade', email: 'master@flowai.com', telefone: '', whatsapp: '', cargo: 'Master Admin', role: 'agencia', agenciaId: 'ag1', password: 'after2026' }
];

const DEFAULT_CLIENTES: Cliente[] = [];
const DEFAULT_CONTATOS: Contato[] = [];
const DEFAULT_DEMANDAS: Demanda[] = [];
const DEFAULT_APROVACOES: Aprovacao[] = [];
const DEFAULT_COMENTARIOS: Comentario[] = [];
const DEFAULT_HISTORICOS: Historico[] = [];
const DEFAULT_WHATSAPP: MensagemWhatsapp[] = [];

const DEFAULT_AUTOMACOES: Automacao[] = [
  { id: 'au1', agenciaId: 'ag1', evento: 'aprovacao', acao: 'notificar_designer', ativa: true },
  { id: 'au2', agenciaId: 'ag1', evento: 'aprovacao', acao: 'atualizar_kanban', ativa: true },
  { id: 'au3', agenciaId: 'ag1', evento: 'aprovacao', acao: 'enviar_confirmacao', ativa: true },
  { id: 'au4', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'cobrar_whatsapp', ativa: true },
  { id: 'au5', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'escalonar_responsaveis', ativa: true }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(DEFAULT_USUARIOS);
  const [clientes, setClientes] = useState<Cliente[]>(DEFAULT_CLIENTES);
  const [contatos, setContatos] = useState<Contato[]>(DEFAULT_CONTATOS);
  const [demandas, setDemandas] = useState<Demanda[]>(DEFAULT_DEMANDAS);
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>(DEFAULT_APROVACOES);
  const [comentarios, setComentarios] = useState<Comentario[]>(DEFAULT_COMENTARIOS);
  const [historicos, setHistoricos] = useState<Historico[]>(DEFAULT_HISTORICOS);
  const [mensagensWhatsapp, setMensagensWhatsapp] = useState<MensagemWhatsapp[]>(DEFAULT_WHATSAPP);
  const [automacoes, setAutomacoes] = useState<Automacao[]>(DEFAULT_AUTOMACOES);
  const [itensPlanejamento, setItensPlanejamento] = useState<ItemPlanejamento[]>([]);
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  const [currentUsuario, setCurrentUsuario] = useState<Usuario>(() => {
    const saved = localStorage.getItem('mf_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USUARIOS[0];
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('mf_is_logged_in');
    return saved === 'true';
  });

  const [activeView, setActiveView] = useState<string>(() => {
    const saved = localStorage.getItem('mf_active_view');
    return saved || 'dashboard';
  });

  const [selectedCalendarClientId, setSelectedCalendarClientId] = useState<string>(() => {
    const saved = localStorage.getItem('mf_selected_calendar_client_id');
    return saved || '';
  });

  const [selectedApprovalDemandId, setSelectedApprovalDemandId] = useState<string>(() => {
    const saved = localStorage.getItem('mf_selected_approval_demand_id');
    return saved || '';
  });

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUsuario?.apiToken || ''}`
    };
  };

  const regenerarToken = async (id: string, type: 'usuario' | 'contato') => {
    try {
      const response = await fetch(`/api/${type}s/${id}/token`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        const { apiToken } = await response.json();
        if (type === 'usuario') {
          setUsuarios(prev => prev.map(u => u.id === id ? { ...u, apiToken } : u));
          if (currentUsuario.id === id) {
            setCurrentUsuario(prev => ({ ...prev, apiToken }));
          }
        } else {
          setContatos(prev => prev.map(c => c.id === id ? { ...c, apiToken } : c));
          if (currentUsuario.id === id) {
            setCurrentUsuario(prev => ({ ...prev, apiToken }));
          }
        }
      } else {
        console.error('Erro ao regenerar token: resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao regenerar token:', err);
    }
  };

  // Load database tables from the backend Express API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/all-data');
        if (!response.ok) throw new Error('Falha ao conectar com o MariaDB');
        const data = await response.json();
        
        if (data.usuarios && data.usuarios.length > 0) setUsuarios(data.usuarios);
        if (data.clientes) setClientes(data.clientes);
        if (data.contatos) setContatos(data.contatos);
        if (data.demandas) setDemandas(data.demandas);
        if (data.comentarios) setComentarios(data.comentarios);
        if (data.historicos) setHistoricos(data.historicos);
        if (data.aprovacoes) setAprovacoes(data.aprovacoes);
        if (data.mensagensWhatsapp) setMensagensWhatsapp(data.mensagensWhatsapp);
        if (data.automacoes && data.automacoes.length > 0) setAutomacoes(data.automacoes);
        if (data.itensPlanejamento) setItensPlanejamento(data.itensPlanejamento);
      } catch (err) {
        console.error('[DataContext] Erro ao carregar dados do MariaDB local:', err);
      }
    };
    loadData();
  }, []);

  // Sync session states locally
  useEffect(() => {
    localStorage.setItem('mf_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('mf_selected_calendar_client_id', selectedCalendarClientId);
  }, [selectedCalendarClientId]);

  useEffect(() => {
    localStorage.setItem('mf_selected_approval_demand_id', selectedApprovalDemandId);
  }, [selectedApprovalDemandId]);

  useEffect(() => {
    localStorage.setItem('mf_current_user', JSON.stringify(currentUsuario));
  }, [currentUsuario]);

  useEffect(() => {
    localStorage.setItem('mf_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  const resetDatabase = () => {
    // Para banco real, apenas limpa session storage do front
    setCurrentUsuario(DEFAULT_USUARIOS[0]);
    setIsLoggedIn(false);
    localStorage.clear();
  };

  const addUsuario = (usuario: Usuario) => {
    setUsuarios(prev => [...prev, usuario]);
    fetch('/api/usuarios', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(usuario)
    }).catch(err => console.error(err));
  };

  // ACTIONS
  const addDemanda = (newDem: Omit<Demanda, 'id' | 'criadoEm' | 'slaEstourado'>) => {
    const dem: Demanda = {
      ...newDem,
      id: 'd' + (demandas.length + 1) + '_' + Date.now().toString().slice(-4),
      criadoEm: new Date().toISOString(),
      slaEstourado: false
    };
    setDemandas(prev => [dem, ...prev]);

    fetch('/api/demandas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dem)
    }).catch(err => console.error(err));

    // Audit Trail
    const hist: Historico = {
      id: 'h_' + Date.now(),
      demandaId: dem.id,
      usuarioNome: currentUsuario.nome,
      acao: 'Criou a demanda',
      detalhes: `Demanda do tipo ${dem.categoria} com prioridade ${dem.prioridade}`,
      tipo: 'status',
      criadoEm: new Date().toISOString()
    };
    setHistoricos(prev => [hist, ...prev]);
    fetch('/api/historicos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(hist)
    }).catch(err => console.error(err));

    // If there is an attachment URL, make a pending approval entry
    if (dem.anexos.length > 0) {
      const ap: Aprovacao = {
        id: 'ap_' + Date.now(),
        demandaId: dem.id,
        arquivoUrl: dem.anexos[0],
        arquivoNome: dem.titulo.toLowerCase().replace(/\s+/g, '_') + '_layout.png',
        arquivoTipo: 'image',
        status: 'Pendente'
      };
      setAprovacoes(prev => [...prev, ap]);
      fetch('/api/aprovacoes', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ap)
      }).catch(err => console.error(err));
    }
  };

  const updateDemanda = (updated: Demanda) => {
    setDemandas(prev => prev.map(d => d.id === updated.id ? updated : d));
    fetch(`/api/demandas/${updated.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    }).catch(err => console.error(err));
  };

  const moveDemanda = (id: string, nextStatus: StatusDemanda, usuarioNome?: string) => {
    const operator = usuarioNome || currentUsuario.nome;
    setDemandas(prev => prev.map(d => {
      if (d.id === id) {
        if (d.status === nextStatus) return d;
        // Log changes
        const hist: Historico = {
          id: 'h_' + Date.now(),
          demandaId: id,
          usuarioNome: operator,
          acao: 'Alterou o status',
          detalhes: `De "${d.status}" para "${nextStatus}"`,
          tipo: 'status',
          criadoEm: new Date().toISOString()
        };
        setHistoricos(h => [hist, ...h]);
        fetch('/api/historicos', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(hist)
        }).catch(err => console.error(err));

        const updated = { ...d, status: nextStatus };
        fetch(`/api/demandas/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        }).catch(err => console.error(err));

        return updated;
      }
      return d;
    }));
  };

  const addComentario = (demandaId: string, conteudo: string, usuarioOverride?: { nome: string; role: RoleType }) => {
    const autorNome = usuarioOverride ? usuarioOverride.nome : currentUsuario.nome;
    const autorRole = usuarioOverride ? usuarioOverride.role : currentUsuario.role;
    const idUsuario = usuarioOverride ? 'simulated' : currentUsuario.id;

    const coment: Comentario = {
      id: 'c_' + Date.now(),
      demandaId,
      usuarioId: idUsuario,
      usuarioNome: autorNome,
      usuarioRole: autorRole,
      conteudo,
      criadoEm: new Date().toISOString()
    };
    setComentarios(prev => [...prev, coment]);
    fetch('/api/comentarios', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(coment)
    }).catch(err => console.error(err));

    // History Log
    const hist: Historico = {
      id: 'h_' + Date.now(),
      demandaId,
      usuarioNome: autorNome,
      acao: 'Adicionou um comentário',
      detalhes: conteudo.length > 50 ? conteudo.slice(0, 50) + '...' : conteudo,
      tipo: 'comentario',
      criadoEm: new Date().toISOString()
    };
    setHistoricos(prev => [hist, ...prev]);
    fetch('/api/historicos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(hist)
    }).catch(err => console.error(err));
  };

  const processarAprovacao = (
    demandaId: string, 
    aprovacaoId: string, 
    status: 'Aprovado' | 'Ajuste Solicitado' | 'Reprovado', 
    observacao: string,
    usuarioNome: string
  ) => {
    setAprovacoes(prev => prev.map(a => {
      if (a.id === aprovacaoId) {
        const updated = {
          ...a,
          status,
          usuarioNome,
          dataHora: new Date().toISOString(),
          ipAddress: '189.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          observacao
        };
        fetch(`/api/aprovacoes/${aprovacaoId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        }).catch(err => console.error(err));
        return updated;
      }
      return a;
    }));

    // Log in History
    const hist: Historico = {
      id: 'h_' + Date.now(),
      demandaId,
      usuarioNome,
      acao: status === 'Aprovado' ? 'Aprovou a arte' : status === 'Reprovado' ? 'Reprovou a arte' : 'Solicitou ajustes',
      detalhes: observacao ? `Observação: "${observacao}"` : 'Nenhuma observação informada',
      tipo: 'aprovacao',
      criadoEm: new Date().toISOString()
    };
    setHistoricos(prev => [hist, ...prev]);
    fetch('/api/historicos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(hist)
    }).catch(err => console.error(err));

    // Automatic Kanban movements and notifications based on Automations
    let targetStatus: StatusDemanda | null = null;
    if (status === 'Aprovado') {
      targetStatus = 'Agendado';
    } else if (status === 'Ajuste Solicitado' || status === 'Reprovado') {
      targetStatus = 'Produção';
    }

    if (targetStatus) {
      moveDemanda(demandaId, targetStatus, 'Sistema (Automação)');
    }

    // Trigger success triggers if active
    if (status === 'Aprovado') {
      const activeClient = clientes.find(c => c.id === (demandas.find(d => d.id === demandaId)?.clienteId));
      if (activeClient) {
        // Increment approval counts
        const updatedCli = {
          ...activeClient,
          aprovacoesContadas: activeClient.aprovacoesContadas + 1,
          tempoMedioResposta: Math.max(1, +(activeClient.tempoMedioResposta * 0.95).toFixed(1))
        };
        setClientes(prev => prev.map(c => c.id === activeClient.id ? updatedCli : c));
        fetch(`/api/clientes/${activeClient.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updatedCli)
        }).catch(err => console.error(err));

        // Create success notification log
        const alertLog = `Automação executada: Notificado Designer Lucas Medeiros sobre aprovação de João Silva (${activeClient.nomeFantasia}). Whatsapp de confirmação disparado.`;
        setAiLogs(prev => [alertLog, ...prev]);
      }
    }
  };

  // WhatsApp natively decoupled message sender and simulated AI receiver
  const enviarMensagemWhatsApp = (clienteId: string, conteudo: string, direcao: 'entrada' | 'saida') => {
    const msg: MensagemWhatsapp = {
      id: 'w_' + Date.now(),
      clienteId,
      direcao,
      conteudo,
      processadaPorIA: false,
      criadoEm: new Date().toISOString()
    };

    setMensagensWhatsapp(prev => [...prev, msg]);
    fetch('/api/mensagens-whatsapp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(msg)
    }).catch(err => console.error(err));

    // Handle Client incoming message -> TRIGGERS CONVERSATIONAL AI ASSISTANT
    if (direcao === 'entrada') {
      simularInterpretacaoIA(clienteId, msg);
    }
  };

  // AI Assistant Engine
  const simularInterpretacaoIA = (clienteId: string, mensagem: MensagemWhatsapp) => {
    const textLower = mensagem.conteudo.toLowerCase();
    const clienteObj = clientes.find(c => c.id === clienteId);
    if (!clienteObj) return;

    // AI thinking timeout for hyper-premium visual loading states
    setTimeout(() => {
      let resposta = '';
      let logAi = '';
      let intencao: any = 'pergunta';

      // Find relevant demands for this client to see what we are acting on
      const demandasCliente = demandas.filter(d => d.clienteId === clienteId && d.status !== 'Concluído');
      const activeDemanda = demandasCliente[0]; // Guess first active card

      if (textLower.includes('aprovado') || textLower.includes('aprovar') || textLower.includes('aprovado.')) {
        intencao = 'aprovar';
        
        if (activeDemanda) {
          resposta = `Olá ${clienteObj.nomeFantasia}! Recebi seu retorno e *Aprovado*! 🚀\n\nJá registrei a aprovação no sistema e movi a demanda *"${activeDemanda.titulo}"* para a etapa de agendamento de publicação. A agência foi notificada!`;
          logAi = `IA interpretou "Aprovado" do cliente no Whatsapp. Ações:\n1. Aprovou demanda "${activeDemanda.titulo}" (ID: ${activeDemanda.id})\n2. Moveu Kanban para "Agendado"\n3. Registrou histórico.`;
          
          // Update database models
          moveDemanda(activeDemanda.id, 'Agendado', `IA Whatsapp (${clienteObj.nomeFantasia})`);
          // Find pending approval for this demand and mark approved
          const pAprov = aprovacoes.find(a => a.demandaId === activeDemanda.id && a.status === 'Pendente');
          if (pAprov) {
            processarAprovacao(activeDemanda.id, pAprov.id, 'Aprovado', 'Aprovado automaticamente por mensagem de WhatsApp via IA', `WhatsApp: ${clienteObj.nomeFantasia}`);
          }
        } else {
          resposta = `Olá! Recebi seu retorno, mas não localizei nenhuma demanda pendente de aprovação no momento. Gostaria de ver a lista das suas demandas?`;
        }

      } else if (textLower.includes('trocar') || textLower.includes('ajuste') || textLower.includes('mudar') || textLower.includes('alterar') || textLower.includes('correto é')) {
        intencao = 'ajuste';

        if (activeDemanda) {
          resposta = `Entendido! Registrei sua solicitação de ajuste para a demanda *"${activeDemanda.titulo}"*. 🛠️\n\nEnviei o seguinte comentário ao designer responsável:\n_"${mensagem.conteudo}"_\n\nO status do cartão foi movido de volta para a fila de Produção para execução imediata.`;
          logAi = `IA interpretou solicitação de ajuste: "${mensagem.conteudo}". Ações:\n1. Registrou comentário na demanda "${activeDemanda.titulo}"\n2. Moveu Kanban de volta para "Produção"\n3. Notificou o designer Lucas Medeiros.`;
          
          // Comments and Kanban movement
          moveDemanda(activeDemanda.id, 'Produção', `IA Whatsapp (${clienteObj.nomeFantasia})`);
          addComentario(activeDemanda.id, `[Ajuste via WhatsApp] ${mensagem.conteudo}`, { nome: `WhatsApp: ${clienteObj.nomeFantasia}`, role: 'cliente' });
          
          // Mark approval as adjustment requested
          const pAprov = aprovacoes.find(a => a.demandaId === activeDemanda.id && a.status === 'Pendente');
          if (pAprov) {
            const updatedAp = { ...pAprov, status: 'Ajuste Solicitado' as any, observacao: mensagem.conteudo, usuarioNome: clienteObj.nomeFantasia };
            setAprovacoes(prev => prev.map(a => a.id === pAprov.id ? updatedAp : a));
            fetch(`/api/aprovacoes/${pAprov.id}`, {
              method: 'PUT',
              headers: getHeaders(),
              body: JSON.stringify(updatedAp)
            }).catch(err => console.error(err));
          }
        } else {
          resposta = `Entendido! Deseja solicitar um ajuste? Por favor, me informe qual o título ou o link do arquivo para que eu possa encaminhar à equipe de criação.`;
        }

      } else if (textLower.includes('quais') || textLower.includes('pendentes') || textLower.includes('lista') || textLower.includes('demanda') || textLower.includes('status')) {
        intencao = 'pergunta';

        if (demandasCliente.length > 0) {
          const listStr = demandasCliente.map((d, i) => `${i+1}. *${d.titulo}* [Status: _${d.status}_] - Prazo: ${new Date(d.prazo).toLocaleDateString('pt-BR')}`).join('\n');
          resposta = `Olá! Atualmente, você tem *${demandasCliente.length} demandas ativas*:\n\n${listStr}\n\nSe precisar visualizar alguma arte, me avise ou acesse sua central de aprovações.`;
          logAi = `IA respondeu sobre demandas pendentes do cliente (${clienteObj.nomeFantasia}). Consultou o banco MySQL simulated e gerou resumo formatado.`;
        } else {
          resposta = `Olá! Não há nenhuma demanda pendente ou em andamento para a sua empresa no momento. Tudo em dia! 🎉`;
          logAi = `IA informou ao cliente que não existem demandas pendentes.`;
        }

      } else if (textLower.includes('envie') || textLower.includes('arte') || textLower.includes('enviar') || textLower.includes('link')) {
        intencao = 'pergunta';

        if (activeDemanda) {
          const link = `https://flowai.com/aprovacao/${activeDemanda.id}`;
          resposta = `Com certeza! Aqui está o link da sua central de aprovação da demanda *"${activeDemanda.titulo}"*:\n\n🔗 *${link}*\n\nNesta página você pode ver a imagem/vídeo em alta resolução e aprovar em um clique!`;
          logAi = `IA re-enviou link da central de aprovações da demanda "${activeDemanda.titulo}" (ID: ${activeDemanda.id}).`;
        } else {
          resposta = `Olá! Não encontrei nenhuma demanda recente pendente de envio. Pode especificar qual projeto gostaria de visualizar?`;
        }

      } else {
        resposta = `Olá ${clienteObj.nomeFantasia}! Sou o assistente inteligente da agência. 🤖\n\nPosso te ajudar a:\n✅ *Aprovar* artes (basta dizer "Aprovado")\n✍️ *Pedir Ajustes* (ex: "Troque o preço para R$ 19,99")\n📊 *Listar Demandas* pendentes\n🔗 *Reenviar links* de aprovação.`;
        logAi = `IA respondeu com ajuda interativa para texto não mapeado: "${mensagem.conteudo}"`;
      }

      // Add AI reply message to Whatsapp list
      const msgReply: MensagemWhatsapp = {
        id: 'w_' + Date.now() + '_ai',
        clienteId,
        direcao: 'saida',
        conteudo: resposta,
        processadaPorIA: true,
        intencaoIA: intencao,
        criadoEm: new Date().toISOString()
      };
      setMensagensWhatsapp(prev => [...prev, msgReply]);
      fetch('/api/mensagens-whatsapp', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(msgReply)
      }).catch(err => console.error(err));

      if (logAi) {
        setAiLogs(prev => [logAi, ...prev]);
        
        // Push a systems history record that the AI processed a whatsapp message
        if (activeDemanda) {
          const hist: Historico = {
            id: 'h_ai_' + Date.now(),
            demandaId: activeDemanda.id,
            usuarioNome: 'Flow AI WhatsApp Sênior',
            acao: 'IA Interpretou WhatsApp',
            detalhes: `Mensagem: "${mensagem.conteudo}". Ação: ${intencao.toUpperCase()}`,
            tipo: 'ia',
            criadoEm: new Date().toISOString()
          };
          setHistoricos(prev => [hist, ...prev]);
          fetch('/api/historicos', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(hist)
          }).catch(err => console.error(err));
        }
      }
    }, 1200);
  };

  const addCliente = (newCli: Omit<Cliente, 'id' | 'nivelEngajamento' | 'tempoMedioResposta' | 'atrasosContados' | 'aprovacoesContadas'>) => {
    const cli: Cliente = {
      ...newCli,
      id: 'c' + (clientes.length + 1) + '_' + Date.now().toString().slice(-4),
      nivelEngajamento: 'excelente',
      tempoMedioResposta: 0,
      atrasosContados: 0,
      aprovacoesContadas: 0
    };
    setClientes(prev => [...prev, cli]);
    fetch('/api/clientes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cli)
    }).catch(err => console.error(err));
  };

  const updateCliente = (updated: Cliente) => {
    setClientes(prev => prev.map(c => c.id === updated.id ? updated : c));
    fetch(`/api/clientes/${updated.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    }).catch(err => console.error(err));
  };

  const addContato = async (contato: Contato) => {
    setContatos(prev => [...prev, contato]);
    try {
      const response = await fetch('/api/contatos', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contato)
      });
      if (!response.ok) {
        const errData = await response.json();
        console.error('[DataContext] Erro ao salvar contato no MariaDB:', errData);
        alert('Erro ao salvar contato no banco de dados: ' + (errData.error || response.statusText));
      }
    } catch (err) {
      console.error('[DataContext] Erro de rede ao salvar contato:', err);
      alert('Erro de rede ao salvar contato.');
    }
  };

  const updateContato = (updated: Contato) => {
    setContatos(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    fetch(`/api/contatos/${updated.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    }).catch(err => console.error(err));

    if (currentUsuario && currentUsuario.id === updated.id) {
      setCurrentUsuario({
        ...currentUsuario,
        nome: updated.nome,
        email: updated.email,
        telefone: updated.telefone,
        whatsapp: updated.whatsapp,
        cargo: updated.cargo,
        fotoUrl: updated.fotoUrl
      });
    }
  };

  const updateUsuario = (updated: Usuario) => {
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
    fetch(`/api/usuarios/${updated.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    }).catch(err => console.error(err));

    if (currentUsuario && currentUsuario.id === updated.id) {
      setCurrentUsuario(updated);
    }
  };

  const toggleAutomacao = (id: string) => {
    setAutomacoes(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ativa: !a.ativa };
        fetch(`/api/automacoes/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        }).catch(err => console.error(err));
        return updated;
      }
      return a;
    }));
  };

  const simularPrazoVencido = (demandaId: string) => {
    const dem = demandas.find(d => d.id === demandaId);
    if (!dem) return;
    
    // Mark SLA as estourado
    const updatedDem = { ...dem, slaEstourado: true };
    setDemandas(prev => prev.map(d => d.id === demandaId ? updatedDem : d));
    fetch(`/api/demandas/${demandaId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedDem)
    }).catch(err => console.error(err));

    // Get client contact priorities
    const clienteContatos = contatos.filter(c => c.clienteId === dem.clienteId).sort((a, b) => a.prioridadeEscalonamento - b.prioridadeEscalonamento);
    const cli = clientes.find(c => c.id === dem.clienteId);

    // Create system logs
    const log1 = `[Automação] Prazo VENCIDO da demanda "${dem.titulo}". Enviando cobrança no WhatsApp automático para ${cli?.nomeFantasia}...`;
    const log2 = `[Escalonamento] Nenhuma resposta em 24h. Alerta disparado para o responsável: Carla Neves (Prioridade 1 - Marketing).`;
    const log3 = `[Escalonamento] Alerta escalado para o Gerente: Roberto Alves em 48h.`;

    setAiLogs(prev => [log3, log2, log1, ...prev]);

    // Send automatic WhatsApp message to the customer
    if (cli) {
      const activeContact = clienteContatos[0];
      const cobranca = `Olá ${activeContact ? activeContact.nome : 'João'}. Identificamos que o prazo para aprovação da demanda *"${dem.titulo}"* venceu. Precisamos da sua aprovação ou ajustes o quanto antes para evitarmos atrasos no cronograma operacional. Abraço!`;
      enviarMensagemWhatsApp(dem.clienteId, cobranca, 'saida');

      // Update client stats
      const updatedCli = {
        ...cli,
        atrasosContados: cli.atrasosContados + 1,
        nivelEngajamento: 'critico' as any
      };
      setClientes(prev => prev.map(c => c.id === dem.clienteId ? updatedCli : c));
      fetch(`/api/clientes/${cli.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedCli)
      }).catch(err => console.error(err));
    }
  };

  const addItemPlanejamento = (item: Omit<ItemPlanejamento, 'id'>) => {
    const newItem: ItemPlanejamento = {
      ...item,
      id: 'pl_' + Date.now().toString().slice(-6)
    };
    setItensPlanejamento(prev => [...prev, newItem]);
    fetch('/api/itens-planejamento', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newItem)
    }).catch(err => console.error(err));
  };

  const updateItemPlanejamento = (updated: ItemPlanejamento) => {
    setItensPlanejamento(prev => prev.map(item => item.id === updated.id ? updated : item));
    fetch(`/api/itens-planejamento/${updated.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updated)
    }).catch(err => console.error(err));
  };

  const deleteItemPlanejamento = (id: string) => {
    setItensPlanejamento(prev => prev.filter(item => item.id !== id));
    fetch(`/api/itens-planejamento/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).catch(err => console.error(err));
  };

  const converterPlanejamentoEmDemanda = (id: string) => {
    const planningItem = itensPlanejamento.find(item => item.id === id);
    if (!planningItem) return;
    if (planningItem.demandaGeradaId) {
      alert('Esta demanda já foi gerada no Kanban.');
      return;
    }

    const demandId = 'd_' + Date.now().toString().slice(-6);
    
    // Add demand
    const newDemand: Demanda = {
      id: demandId,
      clienteId: planningItem.clienteId,
      titulo: planningItem.titulo,
      descricao: planningItem.descricao,
      categoria: planningItem.categoria,
      prioridade: planningItem.prioridade,
      responsavelId: planningItem.responsavelId,
      prazo: planningItem.dataPostagem + 'T18:00:00Z',
      status: 'Solicitado',
      criadoEm: new Date().toISOString(),
      anexos: [],
      slaEstourado: false,
      aprovadoresIds: planningItem.aprovadoresIds
    };

    setDemandas(prev => [...prev, newDemand]);
    fetch('/api/demandas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newDemand)
    }).catch(err => console.error(err));

    // Link demand in planning list
    const updatedPlanning = { ...planningItem, demandaGeradaId: demandId };
    setItensPlanejamento(prev => prev.map(item => item.id === id ? updatedPlanning : item));
    fetch(`/api/itens-planejamento/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedPlanning)
    }).catch(err => console.error(err));

    // Log history
    const newHistory: Historico = {
      id: 'h_' + Date.now(),
      demandaId: demandId,
      usuarioNome: currentUsuario.nome,
      acao: 'Gerada a partir do Planejador',
      detalhes: `Demanda convertida a partir do planejamento mensal de marketing (Canal: ${planningItem.canal}).`,
      tipo: 'ia',
      criadoEm: new Date().toISOString()
    };
    setHistoricos(prev => [...prev, newHistory]);
    fetch('/api/historicos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newHistory)
    }).catch(err => console.error(err));
  };

  return (
    <DataContext.Provider value={{
      usuarios,
      clientes,
      contatos,
      demandas,
      comentarios,
      historicos,
      aprovacoes,
      mensagensWhatsapp,
      automacoes,
      currentUsuario,
      setCurrentUsuario,
      isLoggedIn,
      setIsLoggedIn,
      activeView,
      setActiveView,
      selectedCalendarClientId,
      setSelectedCalendarClientId,
      selectedApprovalDemandId,
      setSelectedApprovalDemandId,
      itensPlanejamento,
      addItemPlanejamento,
      updateItemPlanejamento,
      deleteItemPlanejamento,
      converterPlanejamentoEmDemanda,
      addDemanda,
      updateDemanda,
      moveDemanda,
      addComentario,
      processarAprovacao,
      enviarMensagemWhatsApp,
      addCliente,
      updateCliente,
      updateContato,
      addContato,
      updateUsuario,
      toggleAutomacao,
      simularPrazoVencido,
      resetDatabase,
      addUsuario,
      regenerarToken,
      aiLogs
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData deve ser usado com um DataProvider');
  return context;
};
