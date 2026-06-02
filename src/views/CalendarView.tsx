import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Demanda, CategoriaDemanda, PrioridadeDemanda, StatusDemanda } from '../types';

/**
 * @component CalendarView
 * @description Calendário de Planejamento de Marketing 2026
 * 
 * Permite agendar e planejar criativos visualmente através de visões mensais, semanais e diárias.
 * Suporta o carregamento reativo de calendários de datas comemorativas via import de arquivos ICS 2026.
 * Exibe miniaturas de alta resolução das peças diretamente nos cards.
 * Contatos do cliente acessam em modo somente leitura com opção de ir diretamente para o Portal de Aprovação.
 */
const getSegmentBackground = (segmento?: string) => {
  if (!segmento) return '/bg_tecnologia.png';
  const seg = segmento.toLowerCase();
  if (seg.includes('alimentaç') || seg.includes('gastronom')) {
    return '/bg_alimentacao.png';
  }
  if (seg.includes('moda') || seg.includes('vestuár') || seg.includes('acessór')) {
    return '/bg_moda.png';
  }
  if (seg.includes('tecnolog') || seg.includes('softwar') || seg.includes('startup')) {
    return '/bg_tecnologia.png';
  }
  if (seg.includes('saúd') || seg.includes('clínic') || seg.includes('odontolog')) {
    return '/bg_saude.png';
  }
  if (seg.includes('imobiliár') || seg.includes('imóve') || seg.includes('construç') || seg.includes('apartament')) {
    return '/bg_imobiliario.png';
  }
  return '/bg_tecnologia.png';
};

export const CalendarView: React.FC = () => {
  const { 
    demandas, 
    clientes, 
    contatos,
    usuarios,
    addDemanda, 
    updateDemanda, 
    enviarMensagemWhatsApp,
    currentUsuario,
    selectedCalendarClientId, 
    setSelectedCalendarClientId,
    comentarios,
    addComentario,
    setActiveView,
    setSelectedApprovalDemandId
  } = useData();

  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingDemanda, setEditingDemanda] = useState<any>(null);

  // Form States
  const [demandaTitulo, setDemandaTitulo] = useState('');
  const [demandaDescricao, setDemandaDescricao] = useState('');
  const [demandaCategoria, setDemandaCategoria] = useState<string>('Rede Social');
  const [demandaPrioridade, setDemandaPrioridade] = useState<string>('Média');
  const [demandaPrazo, setDemandaPrazo] = useState('');
  const [demandaResponsavel, setDemandaResponsavel] = useState('u3'); // Lucas Medeiros
  const [demandaStatus, setDemandaStatus] = useState<string>('Solicitado');
  const [demandaClienteId, setDemandaClienteId] = useState('');
  const [demandaAnexoUrl, setDemandaAnexoUrl] = useState('');

  // Auto-lock company selection for client contacts
  React.useEffect(() => {
    if (currentUsuario.clienteId) {
      setSelectedCalendarClientId(currentUsuario.clienteId);
    }
  }, [currentUsuario.clienteId, setSelectedCalendarClientId]);

  // Approvers & WhatsApp states
  const [aprovadoresIds, setAprovadoresIds] = useState<string[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [shareWhatsapp, setShareWhatsapp] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDemand, setShareDemand] = useState<Demanda | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'nova' | 'lembrete' | 'urgencia' | 'agradecimento'>('nova');

  const generateTemplate = (type: 'nova' | 'lembrete' | 'urgencia' | 'agradecimento', dem: Demanda) => {
    const clientObj = clientes.find(c => c.id === dem.clienteId);
    const activeContacts = contatos.filter(co => (dem.aprovadoresIds || []).includes(co.id));
    const approverNames = activeContacts.map(co => co.nome);
    const dateStr = new Date(dem.prazo).toLocaleDateString('pt-BR');
    const approverList = approverNames.length > 0 ? approverNames.map(name => `@${name}`).join(', ') : 'Qualquer contato habilitado';
    const url = `https://flowai.com/aprovacao/${dem.id}`;

    switch (type) {
      case 'nova':
        return `📢 *NOVA DEMANDA DE MARKETING OPERACIONAL* 📢\n\n*Cliente:* ${clientObj?.nomeFantasia}\n*Título:* ${dem.titulo}\n*Categoria:* ${dem.categoria}\n*Prioridade:* ${dem.prioridade}\n*Prazo Limite:* ${dateStr}\n\n*Aprovador(es) Notificado(s):* ${approverList}\n\n🔗 *Link para aprovar em um clique:* ${url}\n\n_Por favor, clique no link ou responda a esta mensagem dizendo "Aprovado" ou detalhando os ajustes necessários. Obrigado!_`;
      case 'lembrete':
        return `⏳ *LEMBRETE: AGUARDANDO APROVAÇÃO* ⏳\n\nOlá equipe *${clientObj?.nomeFantasia}*! Passando para lembrar que a demanda *"${dem.titulo}"* ainda está aguardando sua revisão e liberação final.\n\n*Aprovador(es):* ${approverList}\n*Prazo planejado para veiculação:* ${dateStr}\n\n⚠️ *A importância da sua liberação:* Para mantermos o cronograma de postagens em dia e evitarmos qualquer atraso na entrega das suas campanhas, solicitamos sua avaliação assim que possível.\n\n🔗 *Acesse o portal e aprove em 1 clique:* ${url}\n\n_Qualquer dúvida ou ajuste necessário, basta responder aqui ou interagir pelo portal!_`;
      case 'urgencia':
        return `🚨 *ALERTA URGENTE: RISCO DE ATRASO* 🚨\n\nAtenção *${clientObj?.nomeFantasia}* / ${approverList}!\n\nA demanda *"${dem.titulo}"* atingiu o limite do prazo de início da produção física/digital. Sem a aprovação imediata deste material, há um *risco crítico de atraso* na veiculação da sua campanha.\n\n*Prazo Limite de Publicação:* ${dateStr}\n\n👉 *Por favor, libere a arte agora:* ${url}\n\n_Sua aprovação imediata garante que nossa equipe consiga finalizar o agendamento nas redes ou envio para gráfica em tempo hábil._`;
      case 'agradecimento':
        return `🤝 *AGRADECIMENTO: DEMANDA APROVADA!* 🤝\n\nExcelente notícia, equipe *${clientObj?.nomeFantasia}*!\n\nA demanda *"${dem.titulo}"* foi aprovada com sucesso e liberada por ${approverList}.\n\n*Próximos passos:* Nosso time operacional já foi notificado. A peça está sendo direcionada para agendamento nas mídias sociais ou envio para produção gráfica, conforme planejado.\n\nObrigado pela parceria e agilidade na liberação! Juntos mantemos a consistência e qualidade do seu marketing! 🚀`;
      default:
        return '';
    }
  };

  // Basic monthly navigation simulation
  const currentMonthName = 'Junho 2026';
  
  // Simulated dates for June 2026 (June 1st is a Monday)
  const daysInJune = Array.from({ length: 30 }, (_, i) => i + 1);

  // Filter demands based on active selections
  const getDemandsForDay = (day: number) => {
    return demandas.filter(d => {
      const dDate = new Date(d.prazo);
      const dayMatches = dDate.getMonth() === 5 && dDate.getDate() === day; // June
      if (!dayMatches) return false;
      if (selectedCalendarClientId) {
        return d.clienteId === selectedCalendarClientId;
      }
      return true;
    });
  };

  // Get ICS suggestions for the selected client on specific June 2026 dates
  const getSuggestionsForDay = (day: number) => {
    if (!selectedCalendarClientId) return [];
    const client = clientes.find(c => c.id === selectedCalendarClientId);
    if (!client || !client.calendarioIcs) return [];

    const ics = client.calendarioIcs;
    if (ics === 'Varejo_e_Alimentos_2026.ics') {
      if (day === 12) {
        return [{
          title: 'Dia dos Namorados - Ofertas Especiais',
          description: 'Campanha de ofertas românticas e combos especiais de Dia dos Namorados.',
          category: 'Rede Social' as CategoriaDemanda,
          priority: 'Alta' as PrioridadeDemanda
        }];
      }
      if (day === 24) {
        return [{
          title: 'Festa Junina - Promoções de São João',
          description: 'Arraiá de descontos em quitutes juninos e comidas típicas de milho.',
          category: 'Campanha' as CategoriaDemanda,
          priority: 'Média' as PrioridadeDemanda
        }];
      }
    } else if (ics === 'Gastronomia_e_Restaurantes_2026.ics') {
      if (day === 12) {
        return [{
          title: 'Dia dos Namorados - Menu Especial Casal',
          description: 'Divulgar vídeo promocional do cardápio especial de namorados e reservas antecipadas.',
          category: 'Vídeo' as CategoriaDemanda,
          priority: 'Alta' as PrioridadeDemanda
        }];
      }
      if (day === 28) {
        return [{
          title: 'Dia Internacional do Orgulho - Ação Diversidade',
          description: 'Post institucional e drinks coloridos especiais no final de semana.',
          category: 'Rede Social' as CategoriaDemanda,
          priority: 'Média' as PrioridadeDemanda
        }];
      }
    } else if (ics === 'Estetica_e_Saude_2026.ics') {
      if (day === 12) {
        return [{
          title: 'Dia dos Namorados - Spa Day Casal',
          description: 'Promoção de pacotes relaxantes especiais para casais com massagem facial inclusa.',
          category: 'Campanha' as CategoriaDemanda,
          priority: 'Alta' as PrioridadeDemanda
        }];
      }
      if (day === 21) {
        return [{
          title: 'Chegada do Inverno - Tratamentos Faciais',
          description: 'Promoção de rejuvenescimento corporal e hidratação profunda no frio.',
          category: 'Encarte' as CategoriaDemanda,
          priority: 'Média' as PrioridadeDemanda
        }];
      }
    }
    return [];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setDemandaAnexoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Click date cell to create demand
  const handleCellClick = (day: number) => {
    if (currentUsuario.clienteId) return; // Client users cannot create demands!
    setModalMode('create');
    setEditingDemanda(null);
    setDemandaTitulo('');
    setDemandaDescricao('');
    setDemandaCategoria('Rede Social');
    setDemandaPrioridade('Média');
    setDemandaPrazo(`2026-06-${day < 10 ? '0' + day : day}`);
    setDemandaResponsavel(currentUsuario.id || 'u3');
    setDemandaStatus('Solicitado');
    setDemandaClienteId(selectedCalendarClientId || (clientes[0]?.id || ''));
    setAprovadoresIds([]);
    setShareWhatsapp(true);
    setDemandaAnexoUrl('');
    setShowModal(true);
  };

  // Click suggestion to prefill creation
  const handleSuggestionClick = (e: React.MouseEvent, suggestion: any, day: number) => {
    e.stopPropagation();
    if (currentUsuario.clienteId) return; // Client users cannot create demands!
    setModalMode('create');
    setEditingDemanda(null);
    setDemandaTitulo(suggestion.title);
    setDemandaDescricao(suggestion.description);
    setDemandaCategoria(suggestion.category);
    setDemandaPrioridade(suggestion.priority);
    setDemandaPrazo(`2026-06-${day < 10 ? '0' + day : day}`);
    setDemandaResponsavel(currentUsuario.id || 'u3');
    setDemandaStatus('Solicitado');
    setDemandaClienteId(selectedCalendarClientId || (clientes[0]?.id || ''));
    setAprovadoresIds([]);
    setShareWhatsapp(true);
    setDemandaAnexoUrl('');
    setShowModal(true);
  };

  // Click active demand to edit
  const handleDemandClick = (e: React.MouseEvent, demand: Demanda) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditingDemanda(demand);
    setDemandaTitulo(demand.titulo);
    setDemandaDescricao(demand.descricao);
    setDemandaCategoria(demand.categoria);
    setDemandaPrioridade(demand.prioridade);
    setDemandaPrazo(demand.prazo.split('T')[0]);
    setDemandaResponsavel(demand.responsavelId);
    setDemandaStatus(demand.status);
    setDemandaClienteId(demand.clienteId);
    setAprovadoresIds(demand.aprovadoresIds || []);
    setDemandaAnexoUrl(demand.anexos?.[0] || '');
    setShowModal(true);
  };

  // Save changes
  const handleSaveDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUsuario.clienteId) return; // Client users cannot create/edit demands!
    if (!demandaTitulo || !demandaPrazo || !demandaClienteId) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (modalMode === 'create') {
      const targetId = 'd' + (demandas.length + 1);
      addDemanda({
        clienteId: demandaClienteId,
        titulo: demandaTitulo,
        descricao: demandaDescricao,
        categoria: demandaCategoria as CategoriaDemanda,
        responsavelId: demandaResponsavel,
        prioridade: demandaPrioridade as PrioridadeDemanda,
        prazo: `${demandaPrazo}T18:00:00Z`,
        status: demandaStatus as StatusDemanda,
        anexos: demandaAnexoUrl ? [demandaAnexoUrl] : [],
        aprovadoresIds: aprovadoresIds
      });

      // SIMULATED OUTBOUND WHATSAPP NOTIFICATION
      if (shareWhatsapp) {
        const clientObj = clientes.find(c => c.id === demandaClienteId);
        const activeContacts = contatos.filter(co => aprovadoresIds.includes(co.id));
        const approverNames = activeContacts.map(co => co.nome);
        const dateStr = new Date(`${demandaPrazo}T18:00:00Z`).toLocaleDateString('pt-BR');
        const approverList = approverNames.length > 0 ? approverNames.map(name => `@${name}`).join(', ') : 'Qualquer contato habilitado';
        
        const shareMsg = `📢 *NOVA DEMANDA DE MARKETING OPERACIONAL* 📢\n\n*Cliente:* ${clientObj?.nomeFantasia}\n*Título:* ${demandaTitulo}\n*Categoria:* ${demandaCategoria}\n*Prioridade:* ${demandaPrioridade}\n*Prazo Limite:* ${dateStr}\n\n*Aprovador(es) Notificado(s):* ${approverList}\n\n🔗 *Link para aprovar em um clique:* https://flowai.com/aprovacao/${targetId}\n\n_Por favor, clique no link ou responda a esta mensagem dizendo "Aprovado" ou detalhando os ajustes necessários. Obrigado!_`;

        enviarMensagemWhatsApp(demandaClienteId, shareMsg, 'saida');
      }
    } else if (modalMode === 'edit' && editingDemanda) {
      updateDemanda({
        ...editingDemanda,
        clienteId: demandaClienteId,
        titulo: demandaTitulo,
        descricao: demandaDescricao,
        categoria: demandaCategoria as CategoriaDemanda,
        responsavelId: demandaResponsavel,
        prioridade: demandaPrioridade as PrioridadeDemanda,
        prazo: `${demandaPrazo}T18:00:00Z`,
        status: demandaStatus as StatusDemanda,
        anexos: demandaAnexoUrl ? [demandaAnexoUrl] : [],
        aprovadoresIds: aprovadoresIds
      });
    }

    setShowModal(false);
  };

  const triggerShareModal = (dem: Demanda) => {
    setSelectedTemplateType('nova');
    const msg = generateTemplate('nova', dem);
    setShareDemand(dem);
    setShareMessage(msg);
    setShowShareModal(true);
  };

  const handleSendManualWhatsappShare = () => {
    if (!shareDemand) return;
    enviarMensagemWhatsApp(shareDemand.clienteId, shareMessage, 'saida');
    setShowShareModal(false);
    setShareDemand(null);
    alert('Demanda compartilhada no WhatsApp da empresa!');
  };

  const activeClient = clientes.find(c => c.id === selectedCalendarClientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Calendar Header Banner */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Calendário de Marketing</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Cronograma integrado. Clique nas datas para programar e gerenciar demandas operacionais.
          </p>
        </div>

        {/* View mode toggle switcher */}
        <div style={{
          backgroundColor: '#1E1E1E',
          border: '1px solid #2A2A2A',
          borderRadius: '8px',
          padding: '4px',
          display: 'flex',
          gap: '4px'
        }}>
          {['monthly', 'weekly', 'daily'].map((mode) => {
            const label = mode === 'monthly' ? 'Mensal' : mode === 'weekly' ? 'Semanal' : 'Diário';
            const isActive = viewMode === mode;
            return (
              <button 
                key={mode}
                onClick={() => setViewMode(mode as any)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--gold-primary)' : 'transparent',
                  color: isActive ? '#000' : '#B5B5B5',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERS SELECTOR ROW */}
      <div className="card-premium" style={{ 
        padding: '12px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {currentUsuario.clienteId ? (
          <div style={{ fontSize: '0.85rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-building" style={{ color: 'var(--gold-primary)' }}></i>
            <span>Empresa: <strong>{clientes.find(c => c.id === currentUsuario.clienteId)?.nomeFantasia}</strong></span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B5B5B5' }}>
              <i className="fas fa-filter" style={{ marginRight: '6px' }}></i> Filtrar Empresa:
            </label>
            <select 
              value={selectedCalendarClientId} 
              onChange={(e) => setSelectedCalendarClientId(e.target.value)}
              style={{
                backgroundColor: '#1E1E1E',
                border: '1px solid #2A2A2A',
                color: '#FFF',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Visualizar Todas as Empresas</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>
                  {cli.nomeFantasia}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeClient && activeClient.calendarioIcs && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.75rem',
            backgroundColor: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            padding: '6px 12px',
            borderRadius: '20px',
            color: 'var(--gold-primary)'
          }}>
            <i className="fas fa-calendar-check"></i>
            <span>Calendário Vinculado: <strong>{activeClient.calendarioIcs}</strong> (ICS 💡)</span>
          </div>
        )}
      </div>

      {/* CUSTOMIZED DYNAMIC SEGMENT HEADER BANNER */}
      {activeClient && (
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundImage: `url(${getSegmentBackground(activeClient.segmento)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '160px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '28px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Dark Glass Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(13,13,13,0.92) 30%, rgba(13,13,13,0.5) 100%)',
            zIndex: 1
          }} />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                {activeClient.logoUrl ? (
                  <img src={activeClient.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    {activeClient.nomeFantasia.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'var(--gold-primary)',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  {activeClient.segmento || 'Segmento Geral'}
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {activeClient.nomeFantasia}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#B5B5B5', margin: '6px 0 0 0' }}>
                  {activeClient.razaoSocial} &nbsp;•&nbsp; CNPJ: {activeClient.cnpj}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{
                fontSize: '0.7rem',
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: '6px',
                backdropFilter: 'blur(5px)'
              }}>
                Métricas da Conta
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>Tempo médio de resposta: <strong style={{ color: 'var(--gold-primary)' }}>{activeClient.tempoMedioResposta || 4}h</strong></span>
                <span style={{ color: '#444' }}>|</span>
                <span>Taxa de aprovação: <strong style={{ color: '#35D07F' }}>{((activeClient.aprovacoesContadas || 0) * 10) || 90}%</strong></span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Calendar Card */}
      <div className="card-premium" style={{ padding: '24px' }}>
        
        {/* Navigation & Month title */}
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--gold-primary)' }}>
            <i className="far fa-calendar-alt"></i>
            {currentMonthName}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <i className="fas fa-chevron-left"></i> Anterior
            </button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Hoje
            </button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Próximo <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* MONTHLY VIEW GRID */}
        {viewMode === 'monthly' && (
          <div>
            {/* Weekdays Header */}
            <div className="calendar-grid">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(w => (
                <div key={w} className="calendar-header-cell">{w}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="calendar-grid">
              {daysInJune.map(day => {
                const dayDemands = getDemandsForDay(day);
                const daySuggestions = getSuggestionsForDay(day);
                return (
                  <div 
                    key={day} 
                    className="calendar-cell"
                    onClick={() => handleCellClick(day)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="calendar-cell-num">{day}</span>
                    
                    {/* Event and Suggestions lists */}
                    <div style={{ flex: 1, overflowY: 'auto', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Active Demands */}
                      {dayDemands.map(d => {
                        const cli = clientes.find(c => c.id === d.clienteId);
                        const statusColor = 
                          d.status === 'Concluído' ? '#35D07F' :
                          d.status === 'Aprovação' ? 'var(--gold-primary)' :
                          d.status === 'Produção' ? '#00c3ff' : '#9b5de5';

                        return (
                          <div 
                            key={d.id} 
                            className="calendar-event"
                            onClick={(e) => handleDemandClick(e, d)}
                            title={`${d.titulo} (${cli?.nomeFantasia}) - Status: ${d.status}`}
                            style={{
                              borderLeftColor: statusColor,
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div><strong>{cli?.nomeFantasia.split(' ')[0]}:</strong> {d.titulo}</div>
                            {d.anexos && d.anexos.length > 0 && d.anexos[0] && (
                              <img 
                                src={d.anexos[0]} 
                                alt="Miniatura" 
                                style={{ 
                                  width: '100%', 
                                  height: '72px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  marginTop: '4px'
                                }} 
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* ICS Suggested dates */}
                      {daySuggestions.map((sug, idx) => (
                        <div
                          key={`sug-${idx}`}
                          onClick={(e) => handleSuggestionClick(e, sug, day)}
                          title={`💡 SUGESTÃO ICS: ${sug.title}\nClique para transformar em demanda.`}
                          style={{
                            fontSize: '0.65rem',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px dashed var(--gold-primary)',
                            backgroundColor: 'rgba(58, 134, 255, 0.03)',
                            color: 'var(--gold-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            lineHeight: '1.2'
                          }}
                        >
                          <i className="far fa-lightbulb" style={{ flexShrink: 0 }}></i>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sug.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEKLY VIEW GRID (SIMULATION) */}
        {viewMode === 'weekly' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '12px'
            }}>
              {['Segunda (01/06)', 'Terça (02/06)', 'Quarta (03/06)', 'Quinta (04/06)', 'Sexta (05/06)', 'Sábado (06/06)', 'Domingo (07/06)'].map((weekday, i) => {
                const dayNum = i + 1;
                const dayDemands = getDemandsForDay(dayNum);
                const daySuggestions = getSuggestionsForDay(dayNum);
                return (
                  <div 
                    key={weekday} 
                    className="card-premium" 
                    onClick={() => handleCellClick(dayNum)}
                    style={{ 
                      backgroundColor: '#2A2A2A', 
                      padding: '16px', 
                      minHeight: '320px',
                      cursor: 'pointer' 
                    }}
                  >
                    <strong style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', display: 'block', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '6px' }}>
                      {weekday}
                    </strong>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Demands */}
                      {dayDemands.map(d => {
                        const cli = clientes.find(c => c.id === d.clienteId);
                        return (
                          <div 
                            key={d.id} 
                            onClick={(e) => handleDemandClick(e, d)}
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderRadius: '4px',
                              padding: '8px',
                              borderLeft: '3px solid var(--gold-primary)',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', display: 'block' }}>
                              {cli?.nomeFantasia}
                            </span>
                            <span style={{ fontWeight: 600, display: 'block', margin: '4px 0', color: '#fff' }}>{d.titulo}</span>
                            <span style={{ fontSize: '0.65rem', color: '#35D07F', display: 'block', marginBottom: '4px' }}>Status: {d.status}</span>
                            {d.anexos && d.anexos.length > 0 && d.anexos[0] && (
                              <img 
                                src={d.anexos[0]} 
                                alt="Miniatura" 
                                style={{ 
                                  width: '100%', 
                                  height: '72px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  marginTop: '4px'
                                }} 
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Suggestions */}
                      {daySuggestions.map((sug, idx) => (
                        <div
                          key={`sug-wk-${idx}`}
                          onClick={(e) => handleSuggestionClick(e, sug, dayNum)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px dashed var(--gold-primary)',
                            backgroundColor: 'rgba(58, 134, 255, 0.03)',
                            color: 'var(--gold-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <i className="far fa-lightbulb"></i> Sugestão ICS
                          </span>
                          <span style={{ fontWeight: 600 }}>{sug.title}</span>
                        </div>
                      ))}

                      {dayDemands.length === 0 && daySuggestions.length === 0 && (
                        <div style={{ color: '#666', fontSize: '0.7rem', textAlign: 'center', marginTop: '20px' }}>
                          Sem atividades planejadas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DAILY VIEW (SIMULATION) */}
        {viewMode === 'daily' && (
          <div className="card-premium" style={{ backgroundColor: '#2A2A2A', padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-primary)', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              Segunda-feira, 01 de Junho de 2026
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Active demands */}
              {getDemandsForDay(1).map(d => {
                const cli = clientes.find(c => c.id === d.clienteId);
                return (
                  <div 
                    key={d.id} 
                    onClick={(e) => handleDemandClick(e, d)}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      padding: '16px',
                      borderLeft: '4px solid var(--gold-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {d.anexos && d.anexos.length > 0 && d.anexos[0] && (
                        <img 
                          src={d.anexos[0]} 
                          alt="Miniatura" 
                          style={{ 
                            width: '72px', 
                            height: '72px', 
                            objectFit: 'cover', 
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            flexShrink: 0
                          }} 
                        />
                      )}
                      <div>
                        <span className="badge-custom badge-media" style={{ marginBottom: '6px' }}>{d.categoria}</span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{d.titulo}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#B5B5B5', marginTop: '4px' }}>{d.descricao}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#B5B5B5' }}>
                        Cliente: <strong>{cli?.nomeFantasia}</strong>
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#35D07F', marginTop: '4px' }}>
                        Status: {d.status}
                      </div>
                    </div>
                  </div>
                );
              })}

              {getDemandsForDay(1).length === 0 && (
                <div style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
                  Zero prazos operacionais programados para o dia de hoje.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CREATE & EDIT DEMAND MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="card-premium" style={{
            width: '95%',
            maxWidth: modalMode === 'edit' && editingDemanda ? '920px' : '550px',
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--gold-primary)',
            boxShadow: 'var(--shadow-gold-hover)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--gold-primary)' }}>
                <i className={modalMode === 'create' ? 'fas fa-plus' : 'fas fa-pen-to-square'} style={{ marginRight: '8px' }}></i>
                {modalMode === 'create' ? 'Programar Nova Demanda' : currentUsuario.clienteId ? 'Detalhes da Demanda' : 'Editar Demanda Planejada'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {modalMode === 'edit' && editingDemanda ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 0.9fr',
                gap: '32px',
                alignItems: 'start'
              }}>
                
                {/* Left Column: Form Details */}
                <form onSubmit={handleSaveDemanda} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Empresa / Cliente
                    </label>
                    <select 
                      value={demandaClienteId} 
                      onChange={(e) => setDemandaClienteId(e.target.value)}
                      className="input-premium"
                      required
                      disabled
                    >
                      <option value="">Selecione a empresa</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.razaoSocial}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Título da Demanda *
                    </label>
                    <input 
                      type="text" 
                      value={demandaTitulo} 
                      onChange={(e) => setDemandaTitulo(e.target.value)} 
                      className="input-premium" 
                      required 
                      disabled={!!currentUsuario.clienteId}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                        Categoria
                      </label>
                      <select 
                        value={demandaCategoria} 
                        onChange={(e) => setDemandaCategoria(e.target.value as CategoriaDemanda)}
                        className="input-premium"
                        disabled={!!currentUsuario.clienteId}
                      >
                        <option value="Encarte">Encarte</option>
                        <option value="Rede Social">Rede Social</option>
                        <option value="Campanha">Campanha</option>
                        <option value="Vídeo">Vídeo</option>
                        <option value="Impressos">Impressos</option>
                        <option value="Site">Site</option>
                        <option value="Promoção">Promoção</option>
                        <option value="Evento">Evento</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                        Prioridade
                      </label>
                      <select 
                        value={demandaPrioridade} 
                        onChange={(e) => setDemandaPrioridade(e.target.value as PrioridadeDemanda)}
                        className="input-premium"
                        disabled={!!currentUsuario.clienteId}
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                        Prazo Limite *
                      </label>
                      <input 
                        type="date" 
                        value={demandaPrazo} 
                        onChange={(e) => setDemandaPrazo(e.target.value)} 
                        className="input-premium" 
                        required
                        disabled={!!currentUsuario.clienteId}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                        Responsável Técnico
                      </label>
                      <select 
                        value={demandaResponsavel} 
                        onChange={(e) => setDemandaResponsavel(e.target.value)}
                        className="input-premium"
                        disabled={!!currentUsuario.clienteId}
                      >
                        {usuarios.filter(u => ['agencia', 'gestor', 'designer', 'colaborador', 'superadmin'].includes(u.role)).map(u => (
                          <option key={u.id} value={u.id}>{u.nome} ({u.cargo || u.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                        Status Operacional
                      </label>
                      <select 
                        value={demandaStatus} 
                        onChange={(e) => setDemandaStatus(e.target.value as StatusDemanda)}
                        className="input-premium"
                        disabled={!!currentUsuario.clienteId}
                      >
                        <option value="Solicitado">Solicitado</option>
                        <option value="Aguardando Cliente">Aguardando Cliente</option>
                        <option value="Produção">Produção</option>
                        <option value="Aprovação">Aprovação</option>
                        <option value="Agendado">Agendado</option>
                        <option value="Publicado">Publicado</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Descrição e Links Operacionais
                    </label>
                    <textarea 
                      value={demandaDescricao} 
                      onChange={(e) => setDemandaDescricao(e.target.value)} 
                      className="input-premium" 
                      rows={2}
                      disabled={!!currentUsuario.clienteId}
                    />
                  </div>

                  {/* Dual image uploader & selector widget */}
                  <div style={{
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: '#252525',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5' }}>
                      Arte do Encarte / Imagem (Anexo)
                    </label>
                    
                    {!currentUsuario.clienteId ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label style={{
                          border: '1px dashed var(--gold-primary)',
                          backgroundColor: 'rgba(212, 175, 55, 0.03)',
                          padding: '10px',
                          borderRadius: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          gap: '4px',
                          textAlign: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.03)'}
                        >
                          <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', fontSize: '1.1rem' }}></i>
                          <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>Subir Imagem</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                          />
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.6rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira o Link:</span>
                          <input 
                            type="text" 
                            value={demandaAnexoUrl} 
                            onChange={(e) => setDemandaAnexoUrl(e.target.value)} 
                            className="input-premium" 
                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                            placeholder="https://exemplo.com/imagem.png"
                          />
                        </div>
                      </div>
                    ) : (
                      demandaAnexoUrl ? null : <div style={{ fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>Nenhum anexo adicionado a esta demanda.</div>
                    )}

                    {demandaAnexoUrl && (
                      <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img 
                          src={demandaAnexoUrl} 
                          alt="Prévia da Arte" 
                          style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }} 
                        />
                        {!currentUsuario.clienteId && (
                          <button
                            type="button"
                            onClick={() => setDemandaAnexoUrl('')}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              border: 'none',
                              borderRadius: '50%',
                              color: '#ff4d4d',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem'
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Designated approver contacts checkbox grid */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Aprovadores Designados do Cliente *
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px 10px',
                      backgroundColor: '#252525',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {contatos.filter(co => co.clienteId === demandaClienteId).map((cont) => {
                        const isChecked = aprovadoresIds.includes(cont.id);
                        return (
                          <label key={cont.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: isChecked ? '#fff' : '#B5B5B5',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setAprovadoresIds(aprovadoresIds.filter(id => id !== cont.id));
                                } else {
                                  setAprovadoresIds([...aprovadoresIds, cont.id]);
                                }
                              }}
                              disabled={!!currentUsuario.clienteId}
                              style={{
                                accentColor: 'var(--gold-primary)',
                                cursor: 'pointer',
                                width: '14px',
                                height: '14px'
                              }}
                            />
                            {cont.nome} ({cont.cargo})
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    {/* Share manually button */}
                    {!currentUsuario.clienteId ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => triggerShareModal(editingDemanda)}
                        style={{ borderColor: '#25D366', color: '#25D366', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.8rem' }}
                      >
                        <i className="fab fa-whatsapp"></i> Notificar no WhatsApp
                      </button>
                    ) : <div />}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {currentUsuario.clienteId && (editingDemanda.status === 'Aprovação' || editingDemanda.status === 'Aguardando Cliente') && (
                        <button
                          type="button"
                          className="btn-gold"
                          onClick={() => {
                            setSelectedApprovalDemandId(editingDemanda.id);
                            setActiveView('approval');
                            setShowModal(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            backgroundColor: '#FFAA00',
                            borderColor: '#FFAA00',
                            color: '#000',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fas fa-check-double"></i> Analisar e Aprovar Arte
                        </button>
                      )}

                      <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setShowModal(false)}>
                        {currentUsuario.clienteId ? 'Fechar' : 'Cancelar'}
                      </button>
                      {!currentUsuario.clienteId && (
                        <button type="submit" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.8rem' }}>
                          <i className="fas fa-floppy-disk"></i> Salvar Alterações
                        </button>
                      )}
                    </div>
                  </div>

                </form>

                {/* Right Column: Comments (ANY user can read & add comments!) */}
                <div style={{
                  borderLeft: '1px solid #2A2A2A',
                  paddingLeft: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: '100%'
                }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--gold-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-comments"></i> Observações & Notas
                  </h3>
                  
                  {/* Scrollable feed */}
                  <div style={{
                    flex: 1,
                    maxHeight: '380px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    paddingRight: '6px'
                  }}>
                    {comentarios.filter(c => c.demandaId === editingDemanda.id).map(c => (
                      <div key={c.id} style={{
                        backgroundColor: '#252525',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        <div className="flex-between" style={{ marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
                            {c.usuarioNome}
                          </span>
                          <span style={{
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            color: c.usuarioRole === 'agencia' || c.usuarioRole === 'gestor' ? 'var(--gold-primary)' : c.usuarioRole === 'designer' ? '#00c3ff' : '#35D07F',
                            textTransform: 'uppercase',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '1px 4px',
                            borderRadius: '3px'
                          }}>
                            {c.usuarioRole}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#E0E0E0', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {c.conteudo}
                        </p>
                        <span style={{ fontSize: '0.6rem', color: '#666', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                          {new Date(c.criadoEm).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}

                    {comentarios.filter(c => c.demandaId === editingDemanda.id).length === 0 && (
                      <div style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', padding: '30px 0' }}>
                        Nenhuma observação registrada nesta demanda. Seja o primeiro a comentar!
                      </div>
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #2A2A2A', paddingTop: '14px' }}>
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="input-premium"
                      rows={2}
                      placeholder="Escreva uma observação operacional..."
                      style={{ fontSize: '0.75rem', padding: '8px 12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCommentText.trim()) return;
                        addComentario(editingDemanda.id, newCommentText.trim());
                        setNewCommentText('');
                      }}
                      className="btn-gold"
                      style={{
                        fontSize: '0.75rem',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        alignSelf: 'flex-end',
                        cursor: 'pointer',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}
                    >
                      <i className="fas fa-plus"></i> Adicionar Comentário
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Create Mode (standard single column layout) */
              <form onSubmit={handleSaveDemanda} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Empresa / Cliente *
                  </label>
                  <select 
                    value={demandaClienteId} 
                    onChange={(e) => setDemandaClienteId(e.target.value)}
                    className="input-premium"
                    required
                  >
                    <option value="">Selecione a empresa</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.razaoSocial}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Título da Demanda *
                  </label>
                  <input 
                    type="text" 
                    value={demandaTitulo} 
                    onChange={(e) => setDemandaTitulo(e.target.value)} 
                    className="input-premium" 
                    required 
                    placeholder="Ex: Post de Ofertas / Vídeo de Campanha"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Categoria
                    </label>
                    <select 
                      value={demandaCategoria} 
                      onChange={(e) => setDemandaCategoria(e.target.value as CategoriaDemanda)}
                      className="input-premium"
                    >
                      <option value="Encarte">Encarte</option>
                      <option value="Rede Social">Rede Social</option>
                      <option value="Campanha">Campanha</option>
                      <option value="Vídeo">Vídeo</option>
                      <option value="Impressos">Impressos</option>
                      <option value="Site">Site</option>
                      <option value="Promoção">Promoção</option>
                      <option value="Evento">Evento</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Prioridade
                    </label>
                    <select 
                      value={demandaPrioridade} 
                      onChange={(e) => setDemandaPrioridade(e.target.value as PrioridadeDemanda)}
                      className="input-premium"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Prazo Limite *
                    </label>
                    <input 
                      type="date" 
                      value={demandaPrazo} 
                      onChange={(e) => setDemandaPrazo(e.target.value)} 
                      className="input-premium" 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Responsável Técnico
                    </label>
                    <select 
                      value={demandaResponsavel} 
                      onChange={(e) => setDemandaResponsavel(e.target.value)}
                      className="input-premium"
                    >
                      {usuarios.filter(u => ['agencia', 'gestor', 'designer', 'colaborador', 'superadmin'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>{u.nome} ({u.cargo || u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Status Operacional
                    </label>
                    <select 
                      value={demandaStatus} 
                      onChange={(e) => setDemandaStatus(e.target.value as StatusDemanda)}
                      className="input-premium"
                    >
                      <option value="Solicitado">Solicitado</option>
                      <option value="Aguardando Cliente">Aguardando Cliente</option>
                      <option value="Produção">Produção</option>
                      <option value="Aprovação">Aprovação</option>
                      <option value="Agendado">Agendado</option>
                      <option value="Publicado">Publicado</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Descrição e Links Operacionais
                  </label>
                  <textarea 
                    value={demandaDescricao} 
                    onChange={(e) => setDemandaDescricao(e.target.value)} 
                    className="input-premium" 
                    rows={2}
                    placeholder="Detalhamento operacional da demanda, copys recomendadas ou orientações..."
                  />
                </div>

                {/* Dual image uploader & selector widget */}
                <div style={{
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: '#252525',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5' }}>
                    Arte do Encarte / Imagem (Anexo Opcional)
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{
                      border: '1px dashed var(--gold-primary)',
                      backgroundColor: 'rgba(212, 175, 55, 0.03)',
                      padding: '10px',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      gap: '4px',
                      textAlign: 'center',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.03)'}
                    >
                      <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', fontSize: '1.1rem' }}></i>
                      <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>Subir Imagem</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.6rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira o Link:</span>
                      <input 
                        type="text" 
                        value={demandaAnexoUrl} 
                        onChange={(e) => setDemandaAnexoUrl(e.target.value)} 
                        className="input-premium" 
                        style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                        placeholder="https://exemplo.com/imagem.png"
                      />
                    </div>
                  </div>

                  {demandaAnexoUrl && (
                    <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <img 
                        src={demandaAnexoUrl} 
                        alt="Prévia da Arte" 
                        style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setDemandaAnexoUrl('')}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '50%',
                          color: '#ff4d4d',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem'
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Designated approver contacts checkbox grid */}
                {demandaClienteId && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Contatos Responsáveis pela Aprovação *
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px 10px',
                      backgroundColor: '#252525',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {contatos.filter(co => co.clienteId === demandaClienteId).map((cont) => {
                        const isChecked = aprovadoresIds.includes(cont.id);
                        return (
                          <label key={cont.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            color: isChecked ? '#fff' : '#B5B5B5',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setAprovadoresIds(aprovadoresIds.filter(id => id !== cont.id));
                                } else {
                                  setAprovadoresIds([...aprovadoresIds, cont.id]);
                                }
                              }}
                              style={{
                                accentColor: 'var(--gold-primary)',
                                cursor: 'pointer',
                                width: '14px',
                                height: '14px'
                              }}
                            />
                            {cont.nome} ({cont.cargo})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Simulated Immediate WhatsApp notification checkbox */}
                {demandaClienteId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #2A2A2A', paddingTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="shareWhatsappToggle" 
                      checked={shareWhatsapp}
                      onChange={(e) => setShareWhatsapp(e.target.checked)}
                      style={{ accentColor: '#25D366', cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <label htmlFor="shareWhatsappToggle" style={{ fontSize: '0.75rem', color: '#25D366', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fab fa-whatsapp"></i> Notificar no WhatsApp do Cliente
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px', gap: '12px' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.8rem' }}>
                    <i className="fas fa-floppy-disk"></i>
                    Agendar no Calendário
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP MANUAL SHARE MODAL */}
      {showShareModal && shareDemand && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div className="card-premium" style={{
            width: '90%',
            maxWidth: '550px',
            backgroundColor: '#1E1E1E',
            border: '1px solid #25D366',
            boxShadow: '0 0 25px rgba(37, 211, 102, 0.2)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fab fa-whatsapp"></i>
                WhatsApp Notification Center
              </h2>
              <button 
                onClick={() => { setShowShareModal(false); setShareDemand(null); }}
                style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#B5B5B5' }}>
                Selecione um modelo de mensagem para enviar manualmente no grupo/chat do WhatsApp ou programar via API automatizada.
              </p>

              {/* Template Selection Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#B5B5B5' }}>
                  Modelos de Mensagem (Templates)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  {[
                    { type: 'nova', label: '📢 Nova Demanda', desc: 'Briefing inicial' },
                    { type: 'lembrete', label: '⏳ Lembrete', desc: 'Aguardando' },
                    { type: 'urgencia', label: '🚨 Urgência', desc: 'Atraso crítico' },
                    { type: 'agradecimento', label: '🤝 Agradecer', desc: 'Peça aprovada' }
                  ].map((temp) => {
                    const isActive = selectedTemplateType === temp.type;
                    return (
                      <button
                        key={temp.type}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateType(temp.type as any);
                          setShareMessage(generateTemplate(temp.type as any, shareDemand));
                        }}
                        style={{
                          backgroundColor: isActive ? 'rgba(37, 211, 102, 0.1)' : '#252525',
                          border: isActive ? '1px solid #25D366' : '1px solid rgba(255, 255, 255, 0.05)',
                          color: isActive ? '#25D366' : '#B5B5B5',
                          padding: '8px 4px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          textAlign: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{temp.label}</span>
                        <span style={{ fontSize: '0.55rem', color: isActive ? '#25D366' : '#666' }}>{temp.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Edição do Conteúdo da Mensagem
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="input-premium"
                  rows={8}
                  style={{ fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: '1.4' }}
                />
              </div>

              {/* Direct Actions Container */}
              <div style={{
                borderTop: '1px solid #2A2A2A',
                paddingTop: '14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareMessage);
                    alert('Mensagem copiada com sucesso! Cole diretamente no seu WhatsApp ou WhatsApp Web.');
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', padding: '10px 0' }}
                >
                  <i className="far fa-copy"></i> Copiar Texto
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const clientPhone = clientes.find(c => c.id === shareDemand.clienteId)?.whatsapp || '';
                    const cleanPhone = clientPhone.replace(/\D/g, '');
                    const waUrl = cleanPhone 
                      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(shareMessage)}`
                      : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
                    window.open(waUrl, '_blank');
                  }}
                  style={{ borderColor: '#25D366', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', padding: '10px 0' }}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp Cliente
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const respUser = usuarios.find(u => u.id === shareDemand.responsavelId);
                    const respPhone = respUser?.whatsapp || '';
                    const cleanPhone = respPhone.replace(/\D/g, '');
                    if (!cleanPhone) {
                      alert(`O Responsável Técnico (${respUser?.nome || 'Não definido'}) não possui WhatsApp cadastrado no Painel Administrativo.`);
                      return;
                    }
                    const waUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(shareMessage)}`;
                    window.open(waUrl, '_blank');
                  }}
                  style={{ borderColor: '#FF9F43', color: '#FF9F43', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', padding: '10px 0' }}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp Resp. Técnico
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    alert('📅 AGENDAMENTO API REALIZADO!\n\nDisparo automático programado para esta demanda no WhatsApp da empresa caso o retorno não aconteça em até 12 horas.');
                  }}
                  style={{ borderColor: '#00c3ff', color: '#00c3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', padding: '10px 0' }}
                >
                  <i className="far fa-clock"></i> Agendar via API
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowShareModal(false); setShareDemand(null); }}>
                  Fechar
                </button>
                <button 
                  type="button" 
                  className="btn-gold" 
                  onClick={handleSendManualWhatsappShare}
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fas fa-paper-plane"></i> Enviar Chat Interno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

