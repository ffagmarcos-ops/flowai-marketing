import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { StatusDemanda, PrioridadeDemanda, CategoriaDemanda, Demanda } from '../types';

export const KanbanView: React.FC = () => {
  const { 
    demandas, 
    clientes, 
    contatos,
    usuarios,
    moveDemanda, 
    addDemanda, 
    updateDemanda, 
    enviarMensagemWhatsApp, 
    currentUsuario,
    comentarios,
    addComentario,
    aprovacoes
  } = useData();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCliente, setSelectedCliente] = useState<string>('all');

  // New Demand Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<CategoriaDemanda>('Rede Social');
  const [newPrior, setNewPrior] = useState<PrioridadeDemanda>('Média');
  const [newPrazo, setNewPrazo] = useState('');
  const [newClienteId, setNewClienteId] = useState('');
  const [newAnexoUrl, setNewAnexoUrl] = useState('');
  const [newResponsavelId, setNewResponsavelId] = useState(currentUsuario.id);

  // Edit Demand Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState<Demanda | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState<CategoriaDemanda>('Rede Social');
  const [editPrior, setEditPrior] = useState<PrioridadeDemanda>('Média');
  const [editPrazo, setEditPrazo] = useState('');
  const [editClienteId, setEditClienteId] = useState('');
  const [editAnexoUrl, setEditAnexoUrl] = useState('');
  const [editResponsavelId, setEditResponsavelId] = useState('u3');
  const [editStatus, setEditStatus] = useState<StatusDemanda>('Solicitado');
  const [newCommentText, setNewCommentText] = useState('');

  // Approvers
  const [newAprovadoresIds, setNewAprovadoresIds] = useState<string[]>([]);
  const [editAprovadoresIds, setEditAprovadoresIds] = useState<string[]>([]);

  // Manual WhatsApp Share Checkbox/Modal states
  const [newShareWhatsapp, setNewShareWhatsapp] = useState(true);
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

  // Drag and Drop active states
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const stages: StatusDemanda[] = [
    'Solicitado',
    'Aguardando Cliente',
    'Produção',
    'Aprovação',
    'Agendado',
    'Publicado',
    'Concluído'
  ];

  // Colors for headers
  const getStageHeaderStyle = (stage: StatusDemanda) => {
    switch (stage) {
      case 'Solicitado': return { borderTop: '3px solid #b5b5b5' };
      case 'Aguardando Cliente': return { borderTop: '3px solid #FFAA00' };
      case 'Produção': return { borderTop: '3px solid #00c3ff' };
      case 'Aprovação': return { borderTop: '3px solid #D4AF37' };
      case 'Agendado': return { borderTop: '3px solid #9b5de5' };
      case 'Publicado': return { borderTop: '3px solid #35D07F' };
      case 'Concluído': return { borderTop: '3px solid #2ecc71' };
      default: return {};
    }
  };

  // Filter Logic
  const filteredDemandas = demandas.filter(d => {
    if (currentUsuario.clienteId && d.clienteId !== currentUsuario.clienteId) return false;
    
    const matchSearch = d.titulo.toLowerCase().includes(search.toLowerCase()) || 
                        d.descricao.toLowerCase().includes(search.toLowerCase());
    const matchPriority = selectedPriority === 'all' || d.prioridade === selectedPriority;
    const matchCategory = selectedCategory === 'all' || d.categoria === selectedCategory;
    const matchCliente = selectedCliente === 'all' || d.clienteId === selectedCliente;
    return matchSearch && matchPriority && matchCategory && matchCliente;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isEdit) {
            setEditAnexoUrl(reader.result);
          } else {
            setNewAnexoUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggingCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: StatusDemanda) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggingCardId;
    if (cardId) {
      moveDemanda(cardId, targetStatus);
    }
    setDraggingCardId(null);
  };

  // Create Demand Submit
  const handleCreateDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClienteId || !newPrazo) {
      alert('Preencha os campos obrigatórios (Título, Cliente e Prazo)');
      return;
    }

    const targetId = 'd' + (demandas.length + 1);

    addDemanda({
      clienteId: newClienteId,
      titulo: newTitle,
      descricao: newDesc,
      categoria: newCat,
      prioridade: newPrior,
      prazo: newPrazo + 'T18:00:00Z',
      responsavelId: newResponsavelId || currentUsuario.id,
      status: 'Solicitado',
      anexos: newAnexoUrl ? [newAnexoUrl] : [],
      aprovadoresIds: newAprovadoresIds
    });

    // SIMULATED OUTBOUND WHATSAPP NOTIFICATION
    if (newShareWhatsapp) {
      const clientObj = clientes.find(c => c.id === newClienteId);
      const activeContacts = contatos.filter(co => newAprovadoresIds.includes(co.id));
      const approverNames = activeContacts.map(co => co.nome);
      const dateStr = new Date(newPrazo + 'T18:00:00Z').toLocaleDateString('pt-BR');
      const approverList = approverNames.length > 0 ? approverNames.map(name => `@${name}`).join(', ') : 'Qualquer contato habilitado';
      
      const shareMsg = `📢 *NOVA DEMANDA DE MARKETING OPERACIONAL* 📢\n\n*Cliente:* ${clientObj?.nomeFantasia}\n*Título:* ${newTitle}\n*Categoria:* ${newCat}\n*Prioridade:* ${newPrior}\n*Prazo Limite:* ${dateStr}\n\n*Aprovador(es) Notificado(s):* ${approverList}\n\n🔗 *Link para aprovar em um clique:* https://flowai.com/aprovacao/${targetId}\n\n_Por favor, clique no link ou responda a esta mensagem dizendo "Aprovado" ou detalhando os ajustes necessários. Obrigado!_`;

      enviarMensagemWhatsApp(newClienteId, shareMsg, 'saida');
    }

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewClienteId('');
    setNewPrazo('');
    setNewAnexoUrl('');
    setNewAprovadoresIds([]);
    setNewResponsavelId(currentUsuario.id);
    setNewShareWhatsapp(true);
    setShowModal(false);
  };

  // Update Demand Submit
  const handleUpdateDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUsuario.clienteId) return; // Client users cannot edit demands!
    if (!editingDemanda) return;
    if (!editTitle || !editClienteId || !editPrazo) {
      alert('Preencha os campos obrigatórios (Título, Cliente e Prazo)');
      return;
    }

    updateDemanda({
      ...editingDemanda,
      clienteId: editClienteId,
      titulo: editTitle,
      descricao: editDesc,
      categoria: editCat,
      prioridade: editPrior,
      prazo: editPrazo + 'T18:00:00Z',
      responsavelId: editResponsavelId,
      status: editStatus,
      anexos: editAnexoUrl ? [editAnexoUrl] : editingDemanda.anexos,
      aprovadoresIds: editAprovadoresIds
    });

    setShowEditModal(false);
    setEditingDemanda(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
      
      {/* Top Controls Banner */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Fluxo de Trabalho Inteligente</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>Gerencie suas demandas visualmente. Arraste e solte para atualizar etapas.</p>
        </div>
        
        {/* Only Agency users can create demands */}
        {(currentUsuario.role === 'agencia' || currentUsuario.role === 'gestor') && (
          <button className="btn-gold" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Nova Demanda
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS */}
      <div style={{
        display: 'flex',
        gap: '16px',
        backgroundColor: '#1E1E1E',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #2A2A2A',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px' }}>
          <input 
            type="text" 
            placeholder="Pesquisar demandas..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium"
            style={{ padding: '8px 16px' }}
          />
        </div>

        {/* Priority Filter */}
        <select 
          value={selectedPriority} 
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="input-premium"
          style={{ width: 'auto', minWidth: '150px', padding: '8px 12px' }}
        >
          <option value="all">Prioridade: Todas</option>
          <option value="Baixa">Baixa</option>
          <option value="Média">Média</option>
          <option value="Alta">Alta</option>
          <option value="Urgente">Urgente</option>
        </select>

        {/* Category Filter */}
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-premium"
          style={{ width: 'auto', minWidth: '160px', padding: '8px 12px' }}
        >
          <option value="all">Categoria: Todas</option>
          <option value="Encarte">Encarte</option>
          <option value="Rede Social">Rede Social</option>
          <option value="Campanha">Campanha</option>
          <option value="Vídeo">Vídeo</option>
          <option value="Impressos">Impressos</option>
          <option value="Site">Site</option>
          <option value="Promoção">Promoção</option>
          <option value="Evento">Evento</option>
        </select>

        {/* Client Filter */}
        <select 
          value={selectedCliente} 
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="input-premium"
          style={{ width: 'auto', minWidth: '180px', padding: '8px 12px' }}
        >
          <option value="all">Cliente: Todos</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(search || selectedPriority !== 'all' || selectedCategory !== 'all' || selectedCliente !== 'all') && (
          <button 
            className="btn-secondary" 
            style={{ padding: '8px 16px' }}
            onClick={() => {
              setSearch('');
              setSelectedPriority('all');
              setSelectedCategory('all');
              setSelectedCliente('all');
            }}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* KANBAN LANES */}
      <div className="kanban-board">
        {stages.map(stage => {
          const stageCards = filteredDemandas.filter(d => d.status === stage);
          return (
            <div 
              key={stage} 
              className="kanban-lane"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              style={getStageHeaderStyle(stage)}
            >
              {/* Lane Header */}
              <div className="kanban-lane-header">
                <span className="kanban-lane-title">
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 
                      stage === 'Aprovação' ? '#D4AF37' :
                      stage === 'Aguardando Cliente' ? '#FFAA00' :
                      stage === 'Produção' ? '#00c3ff' :
                      stage === 'Concluído' ? '#35D07F' : '#b5b5b5'
                  }}></span>
                  {stage}
                </span>
                <span className="kanban-lane-count">{stageCards.length}</span>
              </div>

              {/* Lane Body (Cards) */}
              <div className="kanban-lane-cards">
                {stageCards.map(d => {
                  const client = clientes.find(c => c.id === d.clienteId);
                  const priorityClass = 
                    d.prioridade === 'Urgente' ? 'badge-urgente' :
                    d.prioridade === 'Alta' ? 'badge-alta' :
                    d.prioridade === 'Média' ? 'badge-media' : 'badge-low';

                  return (
                    <div
                      key={d.id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, d.id)}
                      onClick={() => {
                        setEditingDemanda(d);
                        setEditTitle(d.titulo);
                        setEditDesc(d.descricao);
                        setEditCat(d.categoria);
                        setEditPrior(d.prioridade);
                        setEditPrazo(d.prazo.split('T')[0]);
                        setEditClienteId(d.clienteId);
                        setEditResponsavelId(d.responsavelId);
                        setEditStatus(d.status);
                        setEditAnexoUrl(d.anexos[0] || '');
                        setEditAprovadoresIds(d.aprovadoresIds || []);
                        setShowEditModal(true);
                      }}
                      style={{
                        opacity: draggingCardId === d.id ? 0.4 : 1,
                        borderLeft: d.slaEstourado ? '3px solid var(--color-danger)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                          {d.categoria}
                        </span>
                        <span className={`badge-custom ${priorityClass}`} style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                          {d.prioridade}
                        </span>
                      </div>

                      <h4 className="kanban-card-title">{d.titulo}</h4>
                      
                      <div className="kanban-card-meta">
                        <i className="fas fa-building" style={{ marginRight: '6px', fontSize: '0.7rem' }}></i>
                        {client ? client.nomeFantasia : 'Cliente Desconhecido'}
                      </div>

                      {/* Approvers */}
                      <div className="kanban-card-meta" style={{ marginTop: '4px', fontSize: '0.75rem', color: '#B5B5B5' }}>
                        <i className="fas fa-user-shield" style={{ marginRight: '6px', fontSize: '0.7rem' }}></i>
                        Aprovador: <strong style={{ color: '#fff' }}>
                          {contatos
                            .filter(co => (d.aprovadoresIds || []).includes(co.id))
                            .map(co => co.nome.split(' ')[0])
                            .join(', ') || 'Sem aprovador específico'}
                        </strong>
                      </div>

                      {/* Approval Status & Comments Badge */}
                      {(() => {
                        const demandApprovals = aprovacoes.filter(a => a.demandaId === d.id);
                        const lastApproval = demandApprovals.length > 0 ? demandApprovals[demandApprovals.length - 1] : null;
                        const demandComments = comentarios.filter(c => c.demandaId === d.id);

                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                            {/* Comment count */}
                            {demandComments.length > 0 && (
                              <span style={{ fontSize: '0.7rem', color: '#3a86ff', backgroundColor: 'rgba(58, 134, 255, 0.08)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fas fa-comment"></i> {demandComments.length}
                              </span>
                            )}
                            
                            {/* Last Approval badge */}
                            {lastApproval && (
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 700,
                                color: 
                                  lastApproval.status === 'Aprovado' ? '#35D07F' : 
                                  lastApproval.status === 'Pendente' ? '#FFAA00' : '#FF5A5A',
                                backgroundColor: 
                                  lastApproval.status === 'Aprovado' ? 'rgba(53, 208, 127, 0.08)' : 
                                  lastApproval.status === 'Pendente' ? 'rgba(255, 170, 0, 0.08)' : 'rgba(255, 90, 90, 0.08)',
                              }}>
                                <i className={`fas ${
                                  lastApproval.status === 'Aprovado' ? 'fa-check-circle' :
                                  lastApproval.status === 'Pendente' ? 'fa-hourglass-half' : 'fa-times-circle'
                                }`}></i>
                                {lastApproval.status === 'Ajuste Solicitado' ? 'Ajuste' : lastApproval.status}
                                {lastApproval.usuarioNome && ` por ${lastApproval.usuarioNome.split(' ')[0]}`}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Display warning if SLA exceeded */}
                      {d.slaEstourado && (
                        <div style={{
                          backgroundColor: 'rgba(255, 90, 90, 0.1)',
                          border: '1px solid var(--color-danger)',
                          borderRadius: '4px',
                          color: 'var(--color-danger)',
                          fontSize: '0.65rem',
                          padding: '4px 8px',
                          margin: '10px 0',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <i className="fas fa-exclamation-triangle"></i>
                          SLA ESTOURADO / ATRASADO
                        </div>
                      )}

                      <div className="kanban-card-footer" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="far fa-clock"></i>
                          Prazo: {new Date(d.prazo).toLocaleDateString('pt-BR')}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Share Button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerShareModal(d);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#25D366',
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Compartilhar no WhatsApp da Empresa"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>

                          {d.anexos.length > 0 && (
                            <span style={{ color: '#35D07F', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <i className="fas fa-paperclip"></i> {d.anexos.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageCards.length === 0 && (
                  <div style={{
                    color: '#666',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '24px 0',
                    border: '1px dashed #333',
                    borderRadius: '4px'
                  }}>
                    Sem demandas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEMAND MODAL DIALOG */}
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
            width: '90%',
            maxWidth: '600px',
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--gold-primary)',
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#D4AF37' }}>
                <i className="fas fa-folder-plus" style={{ marginRight: '8px' }}></i>
                Cadastrar Nova Demanda
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#B5B5B5',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateDemanda} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Título da Demanda *
                </label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  className="input-premium" 
                  placeholder="Ex: Encarte de Ofertas Semanal"
                  required
                />
              </div>

              {/* Client & Technical Assignee Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Cliente Relacionado *
                  </label>
                  <select 
                    value={newClienteId} 
                    onChange={(e) => setNewClienteId(e.target.value)}
                    className="input-premium"
                    required
                  >
                    <option value="">Selecione o Cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Responsável Técnico (Agência) *
                  </label>
                  <select 
                    value={newResponsavelId} 
                    onChange={(e) => setNewResponsavelId(e.target.value)}
                    className="input-premium"
                    required
                  >
                    {usuarios.filter(u => ['agencia', 'gestor', 'designer', 'colaborador', 'superadmin'].includes(u.role)).map(u => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.cargo || u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid Category, Priority & Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Categoria
                  </label>
                  <select 
                    value={newCat} 
                    onChange={(e) => setNewCat(e.target.value as CategoriaDemanda)}
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
                    value={newPrior} 
                    onChange={(e) => setNewPrior(e.target.value as PrioridadeDemanda)}
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
                    value={newPrazo} 
                    onChange={(e) => setNewPrazo(e.target.value)} 
                    className="input-premium" 
                    required
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Descrição e Orientações Operacionais
                </label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  className="input-premium" 
                  rows={3} 
                  placeholder="Insira detalhes do layout, referências e briefing..."
                />
              </div>

              {/* Design Mockup Attachment */}
              <div style={{
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: '#252525',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5' }}>
                  Imagem da Arte / Encarte (Opcional)
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* File Upload Button Area */}
                  <label style={{
                    border: '1px dashed var(--gold-primary)',
                    backgroundColor: 'rgba(212, 175, 55, 0.03)',
                    padding: '12px',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.03)'}
                  >
                    <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', fontSize: '1.2rem' }}></i>
                    <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Subir Imagem da Arte</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, false)} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {/* Or URL input */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira o Link da Arte:</span>
                    <input 
                      type="text" 
                      value={newAnexoUrl} 
                      onChange={(e) => setNewAnexoUrl(e.target.value)} 
                      className="input-premium" 
                      style={{ fontSize: '0.75rem', padding: '8px 12px' }}
                      placeholder="https://exemplo.com/imagem.png"
                    />
                  </div>
                </div>

                {newAnexoUrl && (
                  <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img 
                      src={newAnexoUrl} 
                      alt="Prévia da Arte" 
                      style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'contain' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setNewAnexoUrl('')}
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

              {/* Approvers Selection */}
              {newClienteId && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#B5B5B5' }}>
                    Contatos Responsáveis pela Aprovação *
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    backgroundColor: '#252525',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {contatos.filter(co => co.clienteId === newClienteId).map((cont) => {
                      const isChecked = newAprovadoresIds.includes(cont.id);
                      return (
                        <label key={cont.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
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
                                setNewAprovadoresIds(newAprovadoresIds.filter(id => id !== cont.id));
                              } else {
                                setNewAprovadoresIds([...newAprovadoresIds, cont.id]);
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
                    {contatos.filter(co => co.clienteId === newClienteId).length === 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                        Nenhum contato cadastrado para este cliente. Configure no CRM.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Share Checkbox */}
              {newClienteId && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#FFF',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginTop: '4px'
                }}>
                  <input
                    type="checkbox"
                    checked={newShareWhatsapp}
                    onChange={(e) => setNewShareWhatsapp(e.target.checked)}
                    style={{
                      accentColor: '#25D366',
                      cursor: 'pointer',
                      width: '14px',
                      height: '14px'
                    }}
                  />
                  <span>
                    <i className="fab fa-whatsapp" style={{ color: '#25D366', marginRight: '4px' }}></i>
                    Compartilhar e notificar aprovadores no WhatsApp da Empresa ao criar
                  </span>
                </label>
              )}

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  Salvar Demanda
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT DEMAND MODAL DIALOG */}
      {showEditModal && editingDemanda && (
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
            maxWidth: '920px',
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--gold-primary)',
            boxShadow: 'var(--shadow-gold-hover)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--gold-primary)' }}>
                <i className="fas fa-folder-open" style={{ marginRight: '8px' }}></i>
                {currentUsuario.clienteId ? 'Detalhes da Demanda' : 'Editar Demanda Planejada'}
              </h2>
              <button 
                onClick={() => { setShowEditModal(false); setEditingDemanda(null); }}
                style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '32px',
              alignItems: 'start'
            }}>
              
              {/* Left Column: Form Details */}
              <form onSubmit={handleUpdateDemanda} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Título da Demanda *
                  </label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    className="input-premium" 
                    required
                    disabled={!!currentUsuario.clienteId}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Cliente Relacionado
                  </label>
                  <select value={editClienteId} disabled className="input-premium">
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Categoria
                    </label>
                    <select 
                      value={editCat} 
                      onChange={(e) => setEditCat(e.target.value as CategoriaDemanda)}
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
                      value={editPrior} 
                      onChange={(e) => setEditPrior(e.target.value as PrioridadeDemanda)}
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
                      value={editPrazo} 
                      onChange={(e) => setEditPrazo(e.target.value)} 
                      className="input-premium" 
                      required
                      disabled={!!currentUsuario.clienteId}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                      Responsável na Equipe
                    </label>
                    <select 
                      value={editResponsavelId} 
                      onChange={(e) => setEditResponsavelId(e.target.value)}
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
                      Etapa / Status
                    </label>
                    <select 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value as StatusDemanda)}
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
                    Descrição e Orientações Operacionais
                  </label>
                  <textarea 
                    value={editDesc} 
                    onChange={(e) => setEditDesc(e.target.value)} 
                    className="input-premium" 
                    rows={2}
                    disabled={!!currentUsuario.clienteId}
                  />
                </div>

                {/* Design Mockup Attachment */}
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
                    Anexos da Arte / Encarte
                  </label>
                  
                  {!currentUsuario.clienteId ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {/* File Upload Button Area */}
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
                          onChange={(e) => handleFileChange(e, true)} 
                          style={{ display: 'none' }} 
                        />
                      </label>

                      {/* Or URL input */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '0.6rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira o Link:</span>
                        <input 
                          type="text" 
                          value={editAnexoUrl} 
                          onChange={(e) => setEditAnexoUrl(e.target.value)} 
                          className="input-premium" 
                          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                          placeholder="https://exemplo.com/imagem.png"
                        />
                      </div>
                    </div>
                  ) : (
                    editAnexoUrl ? null : <div style={{ fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>Nenhum anexo adicionado a esta demanda.</div>
                  )}

                  {editAnexoUrl && (
                    <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <img 
                        src={editAnexoUrl} 
                        alt="Prévia da Arte" 
                        style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }} 
                      />
                      {!currentUsuario.clienteId && (
                        <button
                          type="button"
                          onClick={() => setEditAnexoUrl('')}
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

                {/* Approvers list */}
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
                    {contatos.filter(co => co.clienteId === editClienteId).map((cont) => {
                      const isChecked = editAprovadoresIds.includes(cont.id);
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
                                setEditAprovadoresIds(editAprovadoresIds.filter(id => id !== cont.id));
                              } else {
                                setEditAprovadoresIds([...editAprovadoresIds, cont.id]);
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
                  ) : <div></div>}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => { setShowEditModal(false); setEditingDemanda(null); }}>
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

              {/* Right Column: Comments & Observations thread (ANY user can read & add comments!) */}
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

