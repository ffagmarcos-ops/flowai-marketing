export type RoleType = 'superadmin' | 'agencia' | 'gestor' | 'designer' | 'cliente' | 'colaborador';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  cargo: string;
  role: RoleType;
  agenciaId: string;
  clienteId?: string; // If role is cliente or colaborador
  fotoUrl?: string;
  password?: string; // plain text for demo (should be hashed in production)
}

export interface Agencia {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  logoUrl?: string;
}

export interface Cliente {
  id: string;
  agenciaId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  segmento: string;
  endereco: string;
  telefones: string;
  whatsapp: string;
  email: string;
  nivelEngajamento: 'excelente' | 'regular' | 'critico';
  tempoMedioResposta: number; // in hours
  atrasosContados: number;
  aprovacoesContadas: number;
  calendarioIcs?: string;
  logoUrl?: string;
}

export interface Contato {
  id: string;
  clienteId: string;
  nome: string;
  cargo: string;
  telefone: string;
  whatsapp: string;
  email: string;
  prioridadeEscalonamento: number; // 1 = highest priority, 2, 3...
  acessos?: string[];
  fotoUrl?: string;
}

export type CategoriaDemanda = 'Encarte' | 'Rede Social' | 'Campanha' | 'Vídeo' | 'Impressos' | 'Site' | 'Promoção' | 'Evento' | 'Outros';
export type PrioridadeDemanda = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type StatusDemanda = 'Solicitado' | 'Aguardando Cliente' | 'Produção' | 'Aprovação' | 'Agendado' | 'Publicado' | 'Concluído';

export interface Demanda {
  id: string;
  clienteId: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaDemanda;
  responsavelId: string; // Usuario (designer / gestor)
  prioridade: PrioridadeDemanda;
  prazo: string; // ISO date string
  status: StatusDemanda;
  criadoEm: string; // ISO date string
  anexos: string[]; // urls or base64 files
  tempoUltimaRespostaCliente?: number; // hours
  slaEstourado: boolean;
  aprovadoresIds?: string[];
}

export interface Comentario {
  id: string;
  demandaId: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioRole: RoleType;
  conteudo: string;
  criadoEm: string; // ISO date string
  anexos?: string[];
}

export interface Historico {
  id: string;
  demandaId: string;
  usuarioNome: string;
  acao: string; // e.g. "Alterou status de 'Produção' para 'Aprovação'"
  detalhes: string;
  tipo: 'comentario' | 'status' | 'aprovacao' | 'whatsapp' | 'ia';
  criadoEm: string; // ISO date string;
}

export interface Aprovacao {
  id: string;
  demandaId: string;
  arquivoUrl: string;
  arquivoNome: string;
  arquivoTipo: string; // "image" | "pdf" | "video" | "docx"
  status: 'Pendente' | 'Aprovado' | 'Ajuste Solicitado' | 'Reprovado';
  usuarioNome?: string;
  dataHora?: string;
  ipAddress?: string;
  observacao?: string;
}

export interface MensagemWhatsapp {
  id: string;
  clienteId: string;
  demandaId?: string;
  direcao: 'entrada' | 'saida';
  conteudo: string;
  midiaUrl?: string;
  midiaTipo?: string;
  processadaPorIA: boolean;
  intencaoIA?: string; // "aprovar" | "ajuste" | "reprovar" | "pergunta"
  criadoEm: string; // ISO date string
}

export interface Automacao {
  id: string;
  agenciaId: string;
  evento: string; // e.g., "aprovacao" or "prazo_vencido"
  acao: string; // e.g., "notificar_designer" or "escalonar"
  ativa: boolean;
}

export interface Sla {
  id: string;
  clienteId: string;
  demandaId: string;
  tempoLimiteSLA: number; // hours
  tempoDecorrido: number; // hours
  status: 'Dentro do Prazo' | 'Atingido' | 'Estourado';
}
