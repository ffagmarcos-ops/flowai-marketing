import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Usuario, Cliente, Contato, Demanda, Comentario, 
  Historico, Aprovacao, MensagemWhatsapp, Automacao, RoleType, StatusDemanda
} from '../types';

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
  setIsLoggedIn: (loggedIn: boolean) => void;
  // Shared navigation & selection
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCalendarClientId: string;
  setSelectedCalendarClientId: (id: string) => void;
  selectedApprovalDemandId: string;
  setSelectedApprovalDemandId: (id: string) => void;
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
  updateUsuario: (usuario: Usuario) => void;
  toggleAutomacao: (id: string) => void;
  simularPrazoVencido: (demandaId: string) => void;
  resetDatabase: () => void;
  aiLogs: string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Core Mock Data
const DEFAULT_USUARIOS: Usuario[] = [
  { id: 'u1', nome: 'Ricardo Aguiar', email: 'ricardo@flowai.com.br', telefone: '(11) 98888-1111', whatsapp: '(11) 98888-1111', cargo: 'Diretor de Operações', role: 'agencia', agenciaId: 'ag1' },
  { id: 'u2', nome: 'Bárbara Costa', email: 'barbara@flowai.com.br', telefone: '(11) 97777-2222', whatsapp: '(11) 97777-2222', cargo: 'Gestora de Contas', role: 'gestor', agenciaId: 'ag1' },
  { id: 'u3', nome: 'Lucas Medeiros', email: 'lucas@flowai.com.br', telefone: '(11) 96666-3333', whatsapp: '(11) 96666-3333', cargo: 'Designer Sênior', role: 'designer', agenciaId: 'ag1' },
  { id: 'u4', nome: 'João Silva', email: 'joao@supermercadobom.com.br', telefone: '(11) 95555-4444', whatsapp: '(11) 95555-4444', cargo: 'Diretor Proprietário', role: 'cliente', agenciaId: 'ag1', clienteId: 'c1' },
  { id: 'u5', nome: 'Carla Neves', email: 'carla@supermercadobom.com.br', telefone: '(11) 94444-5555', whatsapp: '(11) 94444-5555', cargo: 'Gerente de Marketing', role: 'colaborador', agenciaId: 'ag1', clienteId: 'c1' },
  { id: 'u6', nome: 'Mateus Castro', email: 'mateus@hamburgueriagourmet.com', telefone: '(11) 93333-6666', whatsapp: '(11) 93333-6666', cargo: 'Fundador', role: 'cliente', agenciaId: 'ag1', clienteId: 'c2' },
  // Master login user (hidden password)
  { id: 'master1', nome: 'M.O publicidade', email: 'master@flowai.com', telefone: '', whatsapp: '', cargo: 'Master Admin', role: 'agencia', agenciaId: 'ag1', password: 'after2026' }
];

const DEFAULT_CLIENTES: Cliente[] = [
  { id: 'c1', agenciaId: 'ag1', razaoSocial: 'Supermercado Bom Preço Ltda', nomeFantasia: 'Supermercado Bom Preço', cnpj: '12.345.678/0001-90', segmento: 'Varejo / Alimentos', endereco: 'Av. Paulista, 1000 - São Paulo/SP', telefones: '(11) 3222-1000', whatsapp: '(11) 95555-4444', email: 'contato@supermercadobom.com.br', nivelEngajamento: 'excelente', tempoMedioResposta: 1.8, atrasosContados: 1, aprovacoesContadas: 24, calendarioIcs: 'Varejo_e_Alimentos_2026.ics' },
  { id: 'c2', agenciaId: 'ag1', razaoSocial: 'Hamburgueria Premium & Grill', nomeFantasia: 'Burger Premium', cnpj: '98.765.432/0001-21', segmento: 'Restaurante / Alimentação', endereco: 'Rua Augusta, 500 - São Paulo/SP', telefones: '(11) 3111-2000', whatsapp: '(11) 93333-6666', email: 'mateus@burgerpremium.com', nivelEngajamento: 'regular', tempoMedioResposta: 14.5, atrasosContados: 4, aprovacoesContadas: 12, calendarioIcs: 'Gastronomia_e_Restaurantes_2026.ics' },
  { id: 'c3', agenciaId: 'ag1', razaoSocial: 'Clínica de Estética Vitalize', nomeFantasia: 'Estética Vitalize', cnpj: '45.678.123/0001-50', segmento: 'Saúde / Beleza', endereco: 'Alameda Lorena, 1200 - Jardins - São Paulo/SP', telefones: '(11) 3555-8888', whatsapp: '(11) 92222-7777', email: 'vitalize@esteticavitalize.com.br', nivelEngajamento: 'critico', tempoMedioResposta: 38.2, atrasosContados: 9, aprovacoesContadas: 5, calendarioIcs: 'Estetica_e_Saude_2026.ics' }
];

const DEFAULT_CONTATOS: Contato[] = [
  { id: 'co1', clienteId: 'c1', nome: 'João Silva', cargo: 'Proprietário', telefone: '(11) 95555-4444', whatsapp: '(11) 95555-4444', email: 'joao@supermercadobom.com.br', prioridadeEscalonamento: 3, acessos: ['Aprovações de Criativos', 'Relatórios & Metas SLA'] },
  { id: 'co2', clienteId: 'c1', nome: 'Carla Neves', cargo: 'Gerente de Marketing', telefone: '(11) 94444-5555', whatsapp: '(11) 94444-5555', email: 'carla@supermercadobom.com.br', prioridadeEscalonamento: 1, acessos: ['Aprovações de Criativos', 'Central de WhatsApp'] },
  { id: 'co3', clienteId: 'c1', nome: 'Roberto Alves', cargo: 'Gerente Financeiro', telefone: '(11) 99888-0099', whatsapp: '(11) 99888-0099', email: 'roberto@supermercadobom.com.br', prioridadeEscalonamento: 2, acessos: ['Relatórios & Metas SLA'] },
  { id: 'co4', clienteId: 'c2', nome: 'Mateus Castro', cargo: 'Proprietário', telefone: '(11) 93333-6666', whatsapp: '(11) 93333-6666', email: 'mateus@burgerpremium.com', prioridadeEscalonamento: 1, acessos: ['Aprovações de Criativos', 'Fluxo de Trabalho Inteligente'] }
];

const DEFAULT_DEMANDAS: Demanda[] = [
  { id: 'd1', clienteId: 'c1', titulo: 'Encarte de Ofertas da Semana', descricao: 'Criação do folheto semanal contendo as ofertas de mercearia, hortifrúti e açougue.', categoria: 'Encarte', responsavelId: 'u3', prioridade: 'Urgente', prazo: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + 'T12:00:00Z', status: 'Aprovação', criadoEm: new Date(Date.now() - 86400000 * 2).toISOString(), anexos: [], slaEstourado: false, aprovadoresIds: ['co1', 'co2'] },
  { id: 'd2', clienteId: 'c1', titulo: 'Post: Combate ao Desperdício de Alimentos', descricao: 'Card informativo para redes sociais sobre dicas para conservação de legumes e frutas.', categoria: 'Rede Social', responsavelId: 'u3', prioridade: 'Média', prazo: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0] + 'T18:00:00Z', status: 'Produção', criadoEm: new Date(Date.now() - 86400000).toISOString(), anexos: [], slaEstourado: false, aprovadoresIds: ['co2'] },
  { id: 'd3', clienteId: 'c2', titulo: 'Roteiro de Reels - Festival do Cheddar', descricao: 'Desenvolvimento do roteiro e edição básica para publicação no Instagram promovendo o novo Smash Cheddar Duplo.', categoria: 'Vídeo', responsavelId: 'u3', prioridade: 'Alta', prazo: new Date(Date.now() - 86400000).toISOString(), status: 'Aguardando Cliente', criadoEm: new Date(Date.now() - 86400000 * 5).toISOString(), anexos: [], slaEstourado: true, aprovadoresIds: ['co4'] },
  { id: 'd4', clienteId: 'c3', titulo: 'Campanha de Inverno - Estética Corporal', descricao: 'Design de artes e redação de anúncios patrocinados para tratamentos corporais com foco no inverno.', categoria: 'Campanha', responsavelId: 'u2', prioridade: 'Alta', prazo: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0] + 'T18:00:00Z', status: 'Solicitado', criadoEm: new Date(Date.now()).toISOString(), anexos: [], slaEstourado: false, aprovadoresIds: [] },
  { id: 'd5', clienteId: 'c1', titulo: 'Arte Sacola Ecológica', descricao: 'Layout para impressão de sacolas retornáveis ecológicas com o novo logo da rede.', categoria: 'Impressos', responsavelId: 'u3', prioridade: 'Baixa', prazo: new Date(Date.now() + 86400000 * 10).toISOString(), status: 'Concluído', criadoEm: new Date(Date.now() - 86400000 * 15).toISOString(), anexos: [], slaEstourado: false, aprovadoresIds: ['co1'] }
];

const DEFAULT_APROVACOES: Aprovacao[] = [
  { id: 'ap1', demandaId: 'd1', arquivoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80', arquivoNome: 'encarte_ofertas_final.jpg', arquivoTipo: 'image', status: 'Pendente' },
  { id: 'ap2', demandaId: 'd3', arquivoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', arquivoNome: 'reels_cheddar_promo.mp4', arquivoTipo: 'video', status: 'Ajuste Solicitado', usuarioNome: 'Mateus Castro', dataHora: new Date(Date.now() - 86400000 * 2).toISOString(), ipAddress: '177.45.190.12', observacao: 'Pode trocar a foto do Smash Burger? Usar o que tem mais cheddar derretido na lateral por favor.' },
  { id: 'ap3', demandaId: 'd5', arquivoUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800&auto=format&fit=crop&q=80', arquivoNome: 'sacola_eco_layout.png', arquivoTipo: 'image', status: 'Aprovado', usuarioNome: 'João Silva', dataHora: new Date(Date.now() - 86400000 * 14).toISOString(), ipAddress: '200.123.4.15', observacao: 'Ficou ótimo. Aprovado para envio à gráfica.' }
];

const DEFAULT_COMENTARIOS: Comentario[] = [
  { id: 'c_m1', demandaId: 'd1', usuarioId: 'u3', usuarioNome: 'Lucas Medeiros', usuarioRole: 'designer', conteudo: 'Subi o encarte com as ofertas atualizadas enviadas pelo Whatsapp. @Carla Neves por favor verifique o preço do arroz de 5kg se está correto.', criadoEm: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c_m2', demandaId: 'd3', usuarioId: 'u3', usuarioNome: 'Lucas Medeiros', usuarioRole: 'designer', conteudo: 'Primeira versão do roteiro de Reels adicionada para aprovação do cliente.', criadoEm: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'c_m3', demandaId: 'd3', usuarioId: 'u6', usuarioNome: 'Mateus Castro', usuarioRole: 'cliente', conteudo: 'A edição está boa, mas precisamos dar mais destaque ao queijo derretido no início da gravação.', criadoEm: new Date(Date.now() - 86400000 * 2).toISOString() }
];

const DEFAULT_HISTORICOS: Historico[] = [
  { id: 'h1', demandaId: 'd1', usuarioNome: 'Lucas Medeiros', acao: 'Criou o anexo de aprovação', detalhes: 'Encarte de ofertas adicionado para análise', tipo: 'aprovacao', criadoEm: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h2', demandaId: 'd1', usuarioNome: 'Lucas Medeiros', acao: 'Alterou o status', detalhes: 'Alterado de Produção para Aprovação', tipo: 'status', criadoEm: new Date(Date.now() - 86400000).toISOString() },
  { id: 'h3', demandaId: 'd3', usuarioNome: 'Mateus Castro', acao: 'Solicitou Ajustes pelo Portal', detalhes: 'Observação: Pode trocar a foto do Smash Burger...', tipo: 'aprovacao', criadoEm: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'h4', demandaId: 'd3', usuarioNome: 'Sistema', acao: 'Alterou o status automaticamente', detalhes: 'Status alterado de Aprovação para Aguardando Cliente', tipo: 'status', criadoEm: new Date(Date.now() - 86400000 * 2).toISOString() }
];

const DEFAULT_WHATSAPP: MensagemWhatsapp[] = [
  { id: 'w1', clienteId: 'c1', direcao: 'saida', conteudo: 'Olá João! Estamos aguardando seu retorno referente ao encarte de ofertas desta semana. Para mantermos o cronograma, precisamos da aprovação até às 12h. Acesse o link: https://flowai.com/c1/d1', processadaPorIA: false, criadoEm: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'w2', clienteId: 'c1', direcao: 'entrada', conteudo: 'Vou dar uma olhada e te aviso.', processadaPorIA: true, intencaoIA: 'pergunta', criadoEm: new Date(Date.now() - 86400000 * 3 + 60000).toISOString() },
  { id: 'w3', clienteId: 'c1', direcao: 'saida', conteudo: 'Perfeito, aguardo o retorno. Obrigado!', processadaPorIA: false, criadoEm: new Date(Date.now() - 86400000 * 3 + 120000).toISOString() },
  { id: 'w4', clienteId: 'c2', direcao: 'entrada', conteudo: 'Quais demandas estão pendentes?', processadaPorIA: true, intencaoIA: 'pergunta', criadoEm: new Date(Date.now() - 86400000).toISOString() },
  { id: 'w5', clienteId: 'c2', direcao: 'saida', conteudo: 'Olá Mateus! Atualmente temos pendente: Roteiro de Reels - Festival do Cheddar (Aguardando seu retorno). Acesse no link: https://flowai.com/c2/d3', processadaPorIA: true, criadoEm: new Date(Date.now() - 86400000 + 30000).toISOString() }
];

const DEFAULT_AUTOMACOES: Automacao[] = [
  { id: 'au1', agenciaId: 'ag1', evento: 'aprovacao', acao: 'notificar_designer', ativa: true },
  { id: 'au2', agenciaId: 'ag1', evento: 'aprovacao', acao: 'atualizar_kanban', ativa: true },
  { id: 'au3', agenciaId: 'ag1', evento: 'aprovacao', acao: 'enviar_confirmacao', ativa: true },
  { id: 'au4', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'cobrar_whatsapp', ativa: true },
  { id: 'au5', agenciaId: 'ag1', evento: 'prazo_vencido', acao: 'escalonar_responsaveis', ativa: true }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUsuario, setCurrentUsuario] = useState<Usuario>(() => {
    const saved = localStorage.getItem('mf_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USUARIOS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('mf_is_logged_in');
    return saved === 'true';
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('mf_usuarios');
    return saved ? JSON.parse(saved) : DEFAULT_USUARIOS;
  });
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('mf_clientes');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTES;
  });
  const [contatos, setContatos] = useState<Contato[]>(() => {
    const saved = localStorage.getItem('mf_contatos');
    return saved ? JSON.parse(saved) : DEFAULT_CONTATOS;
  });
  const [demandas, setDemandas] = useState<Demanda[]>(() => {
    const saved = localStorage.getItem('mf_demandas');
    return saved ? JSON.parse(saved) : DEFAULT_DEMANDAS;
  });
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>(() => {
    const saved = localStorage.getItem('mf_aprovacoes');
    return saved ? JSON.parse(saved) : DEFAULT_APROVACOES;
  });
  const [comentarios, setComentarios] = useState<Comentario[]>(() => {
    const saved = localStorage.getItem('mf_comentarios');
    return saved ? JSON.parse(saved) : DEFAULT_COMENTARIOS;
  });
  const [historicos, setHistoricos] = useState<Historico[]>(() => {
    const saved = localStorage.getItem('mf_historicos');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORICOS;
  });
  const [mensagensWhatsapp, setMensagensWhatsapp] = useState<MensagemWhatsapp[]>(() => {
    const saved = localStorage.getItem('mf_whatsapp');
    return saved ? JSON.parse(saved) : DEFAULT_WHATSAPP;
  });
  const [automacoes, setAutomacoes] = useState<Automacao[]>(() => {
    const saved = localStorage.getItem('mf_automacoes');
    return saved ? JSON.parse(saved) : DEFAULT_AUTOMACOES;
  });
  const [aiLogs, setAiLogs] = useState<string[]>([]);

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

  // Sync to localStorage
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

  useEffect(() => {
    localStorage.setItem('mf_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem('mf_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('mf_contatos', JSON.stringify(contatos));
  }, [contatos]);

  useEffect(() => {
    localStorage.setItem('mf_demandas', JSON.stringify(demandas));
  }, [demandas]);

  useEffect(() => {
    localStorage.setItem('mf_aprovacoes', JSON.stringify(aprovacoes));
  }, [aprovacoes]);

  useEffect(() => {
    localStorage.setItem('mf_comentarios', JSON.stringify(comentarios));
  }, [comentarios]);

  useEffect(() => {
    localStorage.setItem('mf_historicos', JSON.stringify(historicos));
  }, [historicos]);

  useEffect(() => {
    localStorage.setItem('mf_whatsapp', JSON.stringify(mensagensWhatsapp));
  }, [mensagensWhatsapp]);

  useEffect(() => {
    localStorage.setItem('mf_automacoes', JSON.stringify(automacoes));
  }, [automacoes]);

  const resetDatabase = () => {
    setUsuarios(DEFAULT_USUARIOS);
    setClientes(DEFAULT_CLIENTES);
    setContatos(DEFAULT_CONTATOS);
    setDemandas(DEFAULT_DEMANDAS);
    setAprovacoes(DEFAULT_APROVACOES);
    setComentarios(DEFAULT_COMENTARIOS);
    setHistoricos(DEFAULT_HISTORICOS);
    setMensagensWhatsapp(DEFAULT_WHATSAPP);
    setAutomacoes(DEFAULT_AUTOMACOES);
    setAiLogs([]);
    setCurrentUsuario(DEFAULT_USUARIOS[0]);
    setIsLoggedIn(false);
    localStorage.clear();
  };

  // ACTIONS
  const addDemanda = (newDem: Omit<Demanda, 'id' | 'criadoEm' | 'slaEstourado'>) => {
    const dem: Demanda = {
      ...newDem,
      id: 'd' + (demandas.length + 1),
      criadoEm: new Date().toISOString(),
      slaEstourado: false
    };
    setDemandas(prev => [dem, ...prev]);

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
    }
  };

  const updateDemanda = (updated: Demanda) => {
    setDemandas(prev => prev.map(d => d.id === updated.id ? updated : d));
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
        return { ...d, status: nextStatus };
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
        return {
          ...a,
          status,
          usuarioNome,
          dataHora: new Date().toISOString(),
          ipAddress: '189.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          observacao
        };
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

    // Automatic Kanban movements and notifications based on Automations
    let targetStatus: StatusDemanda | null = null;
    if (status === 'Aprovado') {
      targetStatus = 'Agendado';
    } else if (status === 'Ajuste Solicitado' || status === 'Reprovado') {
      targetStatus = 'Produção';
    }

    if (targetStatus) {
      setDemandas(prev => prev.map(d => {
        if (d.id === demandaId) {
          const automatedHist: Historico = {
            id: 'h_auto_' + Date.now(),
            demandaId,
            usuarioNome: 'Sistema (Automação)',
            acao: 'Atualizou Kanban por aprovação',
            detalhes: `Status alterado de "${d.status}" para "${targetStatus}"`,
            tipo: 'status',
            criadoEm: new Date().toISOString()
          };
          setHistoricos(h => [automatedHist, ...h]);
          return { ...d, status: targetStatus! };
        }
        return d;
      }));
    }

    // Trigger success triggers if active
    if (status === 'Aprovado') {
      const activeClient = clientes.find(c => c.id === (demandas.find(d => d.id === demandaId)?.clienteId));
      if (activeClient) {
        // Increment approval counts
        setClientes(prev => prev.map(c => c.id === activeClient.id ? {
          ...c,
          aprovacoesContadas: c.aprovacoesContadas + 1,
          tempoMedioResposta: Math.max(1, +(c.tempoMedioResposta * 0.95).toFixed(1)) // SLA improves on quick approvals
        } : c));

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
            setAprovacoes(prev => prev.map(a => a.id === pAprov.id ? { ...a, status: 'Ajuste Solicitado', observacao: mensagem.conteudo, usuarioNome: clienteObj.nomeFantasia } : a));
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
        // General conversational response
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
        }
      }
    }, 1200);
  };

  const addCliente = (newCli: Omit<Cliente, 'id' | 'nivelEngajamento' | 'tempoMedioResposta' | 'atrasosContados' | 'aprovacoesContadas'>) => {
    const cli: Cliente = {
      ...newCli,
      id: 'c' + (clientes.length + 1),
      nivelEngajamento: 'excelente',
      tempoMedioResposta: 0,
      atrasosContados: 0,
      aprovacoesContadas: 0
    };
    setClientes(prev => [...prev, cli]);
  };

  const updateCliente = (updated: Cliente) => {
    setClientes(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const updateContato = (updated: Contato) => {
    setContatos(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
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
    if (currentUsuario && currentUsuario.id === updated.id) {
      setCurrentUsuario(updated);
    }
  };

  const toggleAutomacao = (id: string) => {
    setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, ativa: !a.ativa } : a));
  };

  const simularPrazoVencido = (demandaId: string) => {
    const dem = demandas.find(d => d.id === demandaId);
    if (!dem) return;
    
    // Mark SLA as estourado
    setDemandas(prev => prev.map(d => d.id === demandaId ? { ...d, slaEstourado: true } : d));

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
      setClientes(prev => prev.map(c => c.id === dem.clienteId ? {
        ...c,
        atrasosContados: c.atrasosContados + 1,
        nivelEngajamento: c.atrasosContados > 3 ? 'critico' : 'regular'
      } : c));
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
      addDemanda,
      updateDemanda,
      moveDemanda,
      addComentario,
      processarAprovacao,
      enviarMensagemWhatsApp,
      addCliente,
      updateCliente,
      updateContato,
      updateUsuario,
      toggleAutomacao,
      simularPrazoVencido,
      resetDatabase,
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
