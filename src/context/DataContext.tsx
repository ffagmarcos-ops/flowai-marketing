import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Usuario, Cliente, Contato, Demanda, Comentario, 
  Historico, Aprovacao, MensagemWhatsapp, Automacao, RoleType, StatusDemanda,
  ItemPlanejamento, ProjetoCronograma, EtapaCronograma
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
  
  // Cronograma de Projetos
  projetosCronograma: ProjetoCronograma[];
  etapasCronograma: EtapaCronograma[];
  addProjetoCronograma: (name: string, clientName: string, startDate: string, clienteId: string, bannerUrl?: string) => Promise<void>;
  updateProjetoCronograma: (proj: ProjetoCronograma) => Promise<void>;
  deleteProjetoCronograma: (id: string) => Promise<void>;
  updateEtapaCronograma: (projectId: string, stepId: string, percentage: number, status: 'aguardando' | 'andamento' | 'concluido', durationDays: number) => Promise<void>;
  addEtapaCustomizada: (projectId: string, name: string, description: string, durationDays: number, imageUrl?: string) => Promise<void>;
  reorderEtapasCronograma: (projectId: string, orderedStepIds: string[]) => Promise<void>;
  definirEtapaAtualCronograma: (projectId: string, stepId: string) => Promise<void>;

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
  playAlertSound: (type: 'success' | 'warning' | 'info') => void;
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
  const [projetosCronograma, setProjetosCronograma] = useState<ProjetoCronograma[]>([]);
  const [etapasCronograma, setEtapasCronograma] = useState<EtapaCronograma[]>([]);
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

  const isInitialLoad = React.useRef(true);

  const playAlertSound = (type: 'success' | 'warning' | 'info') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'success') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(523.25, ctx.currentTime, 0.12); // C5
        playTone(659.25, ctx.currentTime + 0.12, 0.25); // E5
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.35); // A3
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      console.warn('Som de alerta falhou:', e);
    }
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
        if (data.historicos) {
          setHistoricos(data.historicos.sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
        }
        if (data.aprovacoes) setAprovacoes(data.aprovacoes);
        if (data.mensagensWhatsapp) setMensagensWhatsapp(data.mensagensWhatsapp);
        if (data.automacoes && data.automacoes.length > 0) setAutomacoes(data.automacoes);
        if (data.itensPlanejamento) setItensPlanejamento(data.itensPlanejamento);
        if (data.projetos) setProjetosCronograma(data.projetos);
        if (data.etapas) setEtapasCronograma(data.etapas);
      } catch (err) {
        console.error('[DataContext] Erro ao carregar dados do MariaDB local:', err);
      }
    };
    loadData();
  }, []);

  // Offline LocalStorage Fallbacks & Sync Effects
  useEffect(() => {
    const localProjs = localStorage.getItem('mf_projetos_cronograma');
    const localEtapas = localStorage.getItem('mf_etapas_cronograma');
    if (localProjs && localProjs !== '[]') setProjetosCronograma(JSON.parse(localProjs));
    if (localEtapas && localEtapas !== '[]') setEtapasCronograma(JSON.parse(localEtapas));
  }, []);

  useEffect(() => {
    if (projetosCronograma && projetosCronograma.length > 0) {
      localStorage.setItem('mf_projetos_cronograma', JSON.stringify(projetosCronograma));
    }
  }, [projetosCronograma]);

  useEffect(() => {
    if (etapasCronograma && etapasCronograma.length > 0) {
      localStorage.setItem('mf_etapas_cronograma', JSON.stringify(etapasCronograma));
    }
  }, [etapasCronograma]);

  // Monitor initial loading for sound alerts
  useEffect(() => {
    if (historicos.length > 0) {
      const timer = setTimeout(() => {
        isInitialLoad.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [historicos]);

  // Real-time sound alert triggers when other users perform actions
  useEffect(() => {
    if (isInitialLoad.current || historicos.length === 0) return;
    const latest = historicos[0];
    
    // Check if the history action was performed by someone else (not the current user)
    const wasPerformedBySomeoneElse = latest.usuarioNome !== currentUsuario.nome;
    if (!wasPerformedBySomeoneElse) return;
    
    const createdTime = new Date(latest.criadoEm).getTime();
    const nowTime = Date.now();
    const isNew = nowTime - createdTime < 4000; // less than 4 seconds ago
    
    if (isNew) {
      if (latest.tipo === 'aprovacao') {
        if (latest.acao.includes('Aprovou')) {
          playAlertSound('success');
        } else {
          playAlertSound('warning');
        }
      } else if (latest.tipo === 'comentario') {
        playAlertSound('info');
      }
    }
  }, [historicos, currentUsuario.nome]);

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

    // If client provided a text observation during approval, register it as a Comment
    if (observacao && observacao.trim()) {
      addComentario(demandaId, `[Comentário de ${status}]: ${observacao.trim()}`, { nome: usuarioNome, role: currentUsuario.role });
    }

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

  // utility: recalculate project dates in cascading order in frontend memory
  const recalculateProjectDatesLocal = (projectId: string, currentStart: string, stepsList: EtapaCronograma[]): { updatedSteps: EtapaCronograma[], expectedDelivery: string, progress: number } => {
    const steps = [...stepsList].filter(s => s.projetoId === projectId).sort((a, b) => a.step_order - b.step_order);
    
    let currentDate = new Date(currentStart);
    let totalPerc = 0;
    
    const updatedSteps = steps.map(step => {
      // expected_date = current date + duration_days
      currentDate.setDate(currentDate.getDate() + (step.duration_days || 0));
      const expectedDateStr = currentDate.toISOString().split('T')[0];
      totalPerc += step.percentage || 0;
      return {
        ...step,
        expected_date: expectedDateStr
      };
    });
    
    const expectedDelivery = currentDate.toISOString().split('T')[0];
    const progress = steps.length > 0 ? Math.round(totalPerc / steps.length) : 0;
    
    return {
      updatedSteps,
      expectedDelivery,
      progress
    };
  };

  const addProjetoCronograma = async (name: string, clientName: string, startDate: string, clienteId: string, bannerUrl?: string) => {
    const projectId = 'proj_' + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const DEFAULT_STEPS = [
      { order: 1, name: 'Requisitos e Coleta de Dados', desc: 'Compreensão das necessidades e regras de negócio.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500' },
      { order: 2, name: 'Planejamento do Projeto', desc: 'Definição de prazos, milestones e arquitetura.', img: 'https://images.unsplash.com/photo-1507207611509-ec012433ff52?w=500' },
      { order: 3, name: 'Design UI/UX', desc: 'Prototipação das telas e fluxo de navegação.', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500' },
      { order: 4, name: 'Aprovação do Design', desc: 'Validação visual com o cliente.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500' },
      { order: 5, name: 'Estruturação e Banco de Dados', desc: 'Setup de servidores, repositórios e banco de dados.', img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500' },
      { order: 6, name: 'Desenvolvimento Backend', desc: 'Criação das APIs, lógica de servidor e segurança.', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500' },
      { order: 7, name: 'Desenvolvimento Frontend', desc: 'Construção da interface e integração com a API.', img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500' },
      { order: 8, name: 'Testes Internos (QA)', desc: 'Testes de qualidade para garantir que não existam bugs.', img: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=500' },
      { order: 9, name: 'Versão Beta para Cliente', desc: 'Disponibilização da versão Beta para o cliente validar.', img: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=500' },
      { order: 10, name: 'Ajustes Finais', desc: 'Correção de feedback gerado na versão Beta.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500' },
      { order: 11, name: 'Publicação nas Lojas', desc: 'Subida oficial do projeto para produção.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500' }
    ];

    // Build the stages list
    let tempDate = new Date(startDate);
    const initialSteps: EtapaCronograma[] = DEFAULT_STEPS.map(step => {
      tempDate.setDate(tempDate.getDate() + 15);
      const expectedDateStr = tempDate.toISOString().split('T')[0];
      return {
        id: `step_${projectId}_${step.order}`,
        projetoId: projectId,
        step_order: step.order,
        name: step.name,
        description: step.desc,
        percentage: 0,
        status: 'aguardando',
        duration_days: 15,
        expected_date: expectedDateStr,
        image_url: step.img
      };
    });

    const expectedDelivery = tempDate.toISOString().split('T')[0];

    const newProj: ProjetoCronograma = {
      id: projectId,
      clienteId,
      name,
      slug,
      client_name: clientName,
      banner_url: bannerUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000',
      start_date: startDate,
      expected_delivery: expectedDelivery,
      status: 'aguardando',
      progress: 0,
      color: '#2563EB',
      criadoEm: new Date().toISOString()
    };

    setProjetosCronograma(prev => [...prev, newProj]);
    setEtapasCronograma(prev => [...prev, ...initialSteps]);

    // Send to server
    try {
      await fetch(`/api/cronograma/projetos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProj)
      });

      for (const step of initialSteps) {
        await fetch(`/api/cronograma/projetos/${projectId}/etapas`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(step)
        });
      }
    } catch (e) {
      console.warn('Salvando projeto localmente (modo offline)');
    }
  };

  const updateProjetoCronograma = async (proj: ProjetoCronograma) => {
    setProjetosCronograma(prev => prev.map(p => p.id === proj.id ? proj : p));
    try {
      await fetch(`/api/cronograma/projetos/${proj.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(proj)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProjetoCronograma = async (id: string) => {
    setProjetosCronograma(prev => prev.filter(p => p.id !== id));
    setEtapasCronograma(prev => prev.filter(e => e.projetoId !== id));
    try {
      await fetch(`/api/cronograma/projetos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateEtapaCronograma = async (projectId: string, stepId: string, percentage: number, status: 'aguardando' | 'andamento' | 'concluido', durationDays: number) => {
    // 1. Update target step locally first
    const updatedLocalEtapas = etapasCronograma.map(e => {
      if (e.id === stepId && e.projetoId === projectId) {
        return { ...e, percentage, status, duration_days: durationDays };
      }
      return e;
    });

    // 2. Cascade dates based on new values
    const project = projetosCronograma.find(p => p.id === projectId);
    if (!project) return;

    const { updatedSteps, expectedDelivery, progress } = recalculateProjectDatesLocal(projectId, project.start_date, updatedLocalEtapas);

    // Update stages state
    setEtapasCronograma(prev => prev.map(e => {
      const match = updatedSteps.find(us => us.id === e.id);
      return match ? match : e;
    }));

    // Update project state
    const updatedProject = { ...project, progress, expected_delivery: expectedDelivery };
    setProjetosCronograma(prev => prev.map(p => p.id === projectId ? updatedProject : p));

    // 3. Save to database
    try {
      // Update target stage in API
      const targetStep = updatedSteps.find(us => us.id === stepId);
      if (targetStep) {
        await fetch(`/api/cronograma/projetos/${projectId}/etapas/${stepId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(targetStep)
        });
      }

      // Update all recalculated stages in API
      for (const step of updatedSteps) {
        if (step.id !== stepId) {
          await fetch(`/api/cronograma/projetos/${projectId}/etapas/${step.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(step)
          });
        }
      }

      // Update project progress and expected delivery in API
      await fetch(`/api/cronograma/projetos/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn('Erro de rede, cronograma atualizado localmente.');
    }
  };

  const addEtapaCustomizada = async (projectId: string, name: string, description: string, durationDays: number, imageUrl?: string) => {
    const project = projetosCronograma.find(p => p.id === projectId);
    if (!project) return;

    const projectSteps = etapasCronograma.filter(e => e.projetoId === projectId);
    const maxOrder = projectSteps.reduce((max, s) => s.step_order > max ? s.step_order : max, 0);
    const nextOrder = maxOrder + 1;

    const newStepId = 'step_custom_' + Date.now();
    const newStep: EtapaCronograma = {
      id: newStepId,
      projetoId: projectId,
      step_order: nextOrder,
      name,
      description,
      percentage: 0,
      status: 'aguardando',
      duration_days: durationDays,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500'
    };

    // Calculate cascading dates including the new stage
    const nextLocalEtapas = [...etapasCronograma, newStep];
    const { updatedSteps, expectedDelivery, progress } = recalculateProjectDatesLocal(projectId, project.start_date, nextLocalEtapas);

    // Update local state
    setEtapasCronograma(prev => {
      const filtered = prev.filter(e => e.projetoId !== projectId);
      return [...filtered, ...updatedSteps];
    });

    const updatedProject = { ...project, progress, expected_delivery: expectedDelivery };
    setProjetosCronograma(prev => prev.map(p => p.id === projectId ? updatedProject : p));

    // Save to server
    try {
      // POST the new step
      await fetch(`/api/cronograma/projetos/${projectId}/etapas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newStep)
      });

      // PUT recalculated expected_dates for all steps
      for (const step of updatedSteps) {
        await fetch(`/api/cronograma/projetos/${projectId}/etapas/${step.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(step)
        });
      }

      // PUT project updates
      await fetch(`/api/cronograma/projetos/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn('Erro de rede, adicionado localmente.');
    }
  };

  const reorderEtapasCronograma = async (projectId: string, orderedStepIds: string[]) => {
    // 1. Update locally
    const reorderedLocalEtapas = etapasCronograma.map(e => {
      if (e.projetoId === projectId) {
        const nextOrderIdx = orderedStepIds.indexOf(e.id);
        if (nextOrderIdx !== -1) {
          return { ...e, step_order: nextOrderIdx + 1 };
        }
      }
      return e;
    });

    const project = projetosCronograma.find(p => p.id === projectId);
    if (!project) return;

    // Recalculate dates based on new orders
    const { updatedSteps, expectedDelivery, progress } = recalculateProjectDatesLocal(projectId, project.start_date, reorderedLocalEtapas);

    setEtapasCronograma(prev => prev.map(e => {
      const match = updatedSteps.find(us => us.id === e.id);
      return match ? match : e;
    }));

    const updatedProject = { ...project, progress, expected_delivery: expectedDelivery };
    setProjetosCronograma(prev => prev.map(p => p.id === projectId ? updatedProject : p));

    // 2. Save to server
    try {
      await fetch(`/api/cronograma/projetos/${projectId}/etapas/reordenar`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ orderedStepIds })
      });

      // Update dates of all steps
      for (const step of updatedSteps) {
        await fetch(`/api/cronograma/projetos/${projectId}/etapas/${step.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(step)
        });
      }

      // Update project Expected Date
      await fetch(`/api/cronograma/projetos/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn('Reordenamento salvo localmente.');
    }
  };

  const definirEtapaAtualCronograma = async (projectId: string, stepId: string) => {
    // 1. Find target step
    const targetStep = etapasCronograma.find(e => e.id === stepId && e.projetoId === projectId);
    if (!targetStep) return;
    const targetOrder = targetStep.step_order;

    // 2. Perform updates locally
    const nextLocalEtapas = etapasCronograma.map(e => {
      if (e.projetoId === projectId) {
        if (e.step_order < targetOrder) {
          return { ...e, status: 'concluido' as const, percentage: 100 };
        } else if (e.id === stepId) {
          return { ...e, status: 'andamento' as const };
        } else if (e.step_order > targetOrder) {
          return { ...e, status: 'aguardando' as const, percentage: 0 };
        }
      }
      return e;
    });

    const project = projetosCronograma.find(p => p.id === projectId);
    if (!project) return;

    // Recalculate
    const { updatedSteps, expectedDelivery, progress } = recalculateProjectDatesLocal(projectId, project.start_date, nextLocalEtapas);

    setEtapasCronograma(prev => prev.map(e => {
      const match = updatedSteps.find(us => us.id === e.id);
      return match ? match : e;
    }));

    const updatedProject = { ...project, progress, expected_delivery: expectedDelivery };
    setProjetosCronograma(prev => prev.map(p => p.id === projectId ? updatedProject : p));

    // 3. Save to server
    try {
      await fetch(`/api/cronograma/projetos/${projectId}/etapas/${stepId}/atual`, {
        method: 'PUT',
        headers: getHeaders()
      });

      // Update expected dates
      for (const step of updatedSteps) {
        await fetch(`/api/cronograma/projetos/${projectId}/etapas/${step.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(step)
        });
      }

      await fetch(`/api/cronograma/projetos/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedProject)
      });
    } catch (e) {
      console.warn('Definição de etapa atual salva localmente.');
    }
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
      
      // Cronograma
      projetosCronograma,
      etapasCronograma,
      addProjetoCronograma,
      updateProjetoCronograma,
      deleteProjetoCronograma,
      updateEtapaCronograma,
      addEtapaCustomizada,
      reorderEtapasCronograma,
      definirEtapaAtualCronograma,

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
      aiLogs,
      playAlertSound
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
