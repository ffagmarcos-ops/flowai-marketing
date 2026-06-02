import React, { useState } from 'react';
import { useData } from '../context/DataContext';

/**
 * @component ApprovalPortalView
 * @description Portal de Aprovações de Criativos
 * 
 * Este módulo serve de workspace para o cliente final revisar as peças e artes produzidas.
 * Se o contato atual estiver logado como 'cliente', ele visualiza apenas as demandas nas quais 
 * foi selecionado explicitamente como aprovador (segurança por registro).
 * 
 * Contém o visualizador ampliado do criativo, histórico de revisões com logs de IP/data-hora e 
 * ferramentas para disparar alertas via simulador do WhatsApp.
 */
export const ApprovalPortalView: React.FC = () => {
  const { 
    demandas, 
    clientes, 
    aprovacoes, 
    processarAprovacao, 
    currentUsuario, 
    contatos, 
    enviarMensagemWhatsApp, 
    selectedApprovalDemandId, 
    setSelectedApprovalDemandId 
  } = useData();

  // Find demands that are in "Aprovação" or have pending approvals, filtered by client if user is client
  const clientFilteredDemandas = currentUsuario.clienteId
    ? demandas.filter(d => {
        // Must belong to the logged-in contact's company
        if (d.clienteId !== currentUsuario.clienteId) return false;
        
        // If the demand specifies designated approvers, check if this contact is in the list
        if (d.aprovadoresIds && d.aprovadoresIds.length > 0) {
          return d.aprovadoresIds.includes(currentUsuario.id);
        }
        
        // Fallback: If no specific approvers are marked, show all active demands in 'Aprovação' or 'Aguardando Cliente' for their company
        return d.status === 'Aprovação' || d.status === 'Aguardando Cliente';
      })
    : demandas.filter(d => d.status === 'Aprovação' || d.status === 'Aguardando Cliente');

  // Currently selected demand in the approval portal
  const [selectedDemId, setSelectedDemId] = useState<string>(clientFilteredDemandas[0]?.id || '');
  
  // Comment / adjustments observation input text
  const [obs, setObs] = useState('');

  // WhatsApp Share Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDemand, setShareDemand] = useState<any>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'nova' | 'lembrete' | 'urgencia' | 'agradecimento'>('lembrete');

  const activeDemanda = demandas.find(d => d.id === selectedDemId);
  const activeClient = activeDemanda ? clientes.find(c => c.id === activeDemanda.clienteId) : null;
  
  // Pending approval file entries
  const activeApproval = aprovacoes.find(a => a.demandaId === selectedDemId && a.status === 'Pendente') || 
                         aprovacoes.find(a => a.demandaId === selectedDemId) ||
                         (activeDemanda?.anexos?.[0] ? {
                           id: 'sim_ap_' + activeDemanda.id,
                           demandaId: activeDemanda.id,
                           arquivoUrl: activeDemanda.anexos[0],
                           arquivoNome: 'arte_anexada.jpg',
                           arquivoTipo: 'image',
                           status: 'Pendente' as const
                         } : null);

  React.useEffect(() => {
    if (selectedApprovalDemandId) {
      setSelectedDemId(selectedApprovalDemandId);
      setSelectedApprovalDemandId(''); // Clear immediately to avoid loops
    }
  }, [selectedApprovalDemandId, setSelectedApprovalDemandId]);

  const generateTemplate = (type: 'nova' | 'lembrete' | 'urgencia' | 'agradecimento', dem: any) => {
    const clientObj = clientes.find(c => c.id === dem.clienteId);
    const activeContacts = contatos.filter(co => (dem.aprovadoresIds || []).includes(co.id));
    const approverNames = activeContacts.map(co => co.nome);
    const dateStr = dem.prazo ? new Date(dem.prazo).toLocaleDateString('pt-BR') : '';
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

  const triggerShareModal = (dem: any) => {
    setSelectedTemplateType('lembrete');
    const msg = generateTemplate('lembrete', dem);
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

  const handleAction = (status: 'Aprovado' | 'Ajuste Solicitado' | 'Reprovado') => {
    if (!activeDemanda || !activeApproval) {
      alert('Selecione uma demanda com arte pendente para realizar a ação.');
      return;
    }

    if ((status === 'Ajuste Solicitado' || status === 'Reprovado') && !obs) {
      alert('Por favor, informe no campo de observações o motivo do ajuste ou rejeição para direcionarmos o designer.');
      return;
    }

    // Call state context processor
    processarAprovacao(
      activeDemanda.id, 
      activeApproval.id, 
      status, 
      obs,
      currentUsuario.nome
    );

    alert(`Sucesso! Sua decisão de "${status.toUpperCase()}" foi registrada. O designer responsável foi notificado.`);
    setObs('');
  };

  return (
    <div className="approval-portal-container">
      
      {/* Portal Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid #2A2A2A', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#D4AF37', fontWeight: 800 }}>Central de Aprovações</h1>
        <p style={{ color: '#B5B5B5', marginTop: '6px', fontSize: '0.95rem' }}>
          Portal Exclusivo do Cliente: Analise criações e tome decisões instantâneas.
        </p>
      </div>

      {/* Grid: Assets Queue vs Preview Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '32px' }}>
        
        {/* Left Column: Assets awaiting approval */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            Fila de Análise
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clientFilteredDemandas.map(d => {
              const cli = clientes.find(c => c.id === d.clienteId);
              const isActive = d.id === selectedDemId;
              const hasPending = aprovacoes.some(a => a.demandaId === d.id && a.status === 'Pendente');

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDemId(d.id)}
                  style={{
                    backgroundColor: isActive ? 'rgba(212, 175, 55, 0.05)' : '#1E1E1E',
                    border: '1px solid',
                    borderColor: isActive ? '#D4AF37' : '#2A2A2A',
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase' }}>
                      {d.categoria}
                    </span>
                    {hasPending && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#FF5A5A',
                        display: 'inline-block'
                      }} title="Pendente de aprovação"></span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    {d.titulo}
                  </h4>
                  <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: '#B5B5B5' }}>
                      {cli?.nomeFantasia}
                    </span>
                    {d.aprovadoresIds && d.aprovadoresIds.length > 0 && (
                      <div style={{
                        fontSize: '0.65rem',
                        color: 'var(--gold-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'rgba(58, 134, 255, 0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        maxWidth: '120px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }} title={`Aprovador: ${d.aprovadoresIds.map(id => contatos.find(c => c.id === id)?.nome || 'Contato').join(', ')}`}>
                        <i className="fas fa-user-check"></i>
                        {d.aprovadoresIds.map(id => contatos.find(c => c.id === id)?.nome || 'Contato').join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {clientFilteredDemandas.length === 0 && (
              <div style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                Nenhuma demanda pendente de aprovação para sua conta. Tudo aprovado! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Asset Preview & Buttons */}
        <div>
          {activeDemanda && activeApproval ? (
            <div className="card-premium" style={{ border: '1px solid rgba(212, 175, 55, 0.1)', padding: '28px' }}>
              
              {/* Asset Title Metadata */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #2A2A2A', paddingBottom: '16px' }}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Analisando projeto de: <strong>{activeClient?.nomeFantasia}</strong>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 800 }}>{activeDemanda.titulo}</h2>
                      <button
                        type="button"
                        onClick={() => triggerShareModal(activeDemanda)}
                        style={{
                          backgroundColor: 'rgba(37, 211, 102, 0.1)',
                          border: '1px solid #25D366',
                          color: '#25D366',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.1)';
                        }}
                        title="Notificar no WhatsApp"
                      >
                        <i className="fab fa-whatsapp"></i> Notificar WhatsApp
                      </button>
                    </div>
                  </div>
                  
                  {/* Active approval state */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 
                        activeApproval.status === 'Aprovado' ? '#35D07F' : 
                        activeApproval.status === 'Pendente' ? '#FFAA00' : '#FF5A5A',
                      backgroundColor: 
                        activeApproval.status === 'Aprovado' ? 'rgba(53, 208, 127, 0.1)' : 
                        activeApproval.status === 'Pendente' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 90, 90, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      display: 'inline-block'
                    }}>
                      {activeApproval.status}
                    </span>
                    <div style={{ fontSize: '0.65rem', color: '#B5B5B5', marginTop: '6px' }}>
                      Arquivo: {activeApproval.arquivoNome}
                    </div>
                  </div>
                </div>
              </div>

              {/* ALL DEMAND DATA: Info Grid Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                backgroundColor: '#1E1E1E',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600 }}>Categoria</span>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                    <i className="fas fa-tags" style={{ marginRight: '6px', color: 'var(--gold-primary)', fontSize: '0.75rem' }}></i>
                    {activeDemanda.categoria}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600 }}>Prioridade</span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700,
                    color: 
                      activeDemanda.prioridade === 'Urgente' ? '#FF5A5A' :
                      activeDemanda.prioridade === 'Alta' ? '#FFAA00' :
                      activeDemanda.prioridade === 'Média' ? '#3a86ff' : '#B5B5B5'
                  }}>
                    <i className="fas fa-circle-exclamation" style={{ marginRight: '6px', fontSize: '0.75rem' }}></i>
                    {activeDemanda.prioridade}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600 }}>Prazo Limite</span>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>
                    <i className="fas fa-calendar-day" style={{ marginRight: '6px', color: 'var(--gold-primary)', fontSize: '0.75rem' }}></i>
                    {activeDemanda.prazo ? new Date(activeDemanda.prazo).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600 }}>Responsável na Agência</span>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--gold-primary)',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.55rem',
                      fontWeight: 700
                    }}>
                      L
                    </div>
                    Lucas Medeiros (Designer Sênior)
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600 }}>Status Kanban</span>
                  <span style={{ fontSize: '0.8rem', color: '#35D07F', fontWeight: 700 }}>
                    <i className="fas fa-spinner" style={{ marginRight: '6px', fontSize: '0.75rem' }}></i>
                    {activeDemanda.status}
                  </span>
                </div>

                {activeDemanda.aprovadoresIds && activeDemanda.aprovadoresIds.length > 0 && (
                  <div style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '4px' }}>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Contatos Responsáveis pela Aprovação
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeDemanda.aprovadoresIds.map(id => {
                        const contact = contatos.find(co => co.id === id);
                        if (!contact) return null;
                        return (
                          <div key={id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(58, 134, 255, 0.08)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--gold-primary)'
                          }}>
                            {contact.fotoUrl ? (
                              <img src={contact.fotoUrl} alt={contact.nome} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <i className="fas fa-user-check" style={{ fontSize: '0.65rem' }}></i>
                            )}
                            <span>{contact.nome} ({contact.cargo})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* DEMAND DESCRIPTION BRIEF */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '20px'
              }}>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  <i className="fas fa-file-alt" style={{ marginRight: '6px', color: 'var(--gold-primary)' }}></i>
                  Descrição / Briefing da Demanda
                </span>
                <p style={{ fontSize: '0.8rem', color: '#E0E0E0', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {activeDemanda.descricao || 'Nenhuma descrição fornecida.'}
                </p>
              </div>

              {/* HIGH-FIDELITY ASSET PREVIEWER (GOOD SIZE VIEWING) */}
              <div style={{
                width: '100%',
                backgroundColor: '#141414',
                border: '1px solid #2C2C2C',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                padding: '16px',
                minHeight: '420px',
                maxHeight: '680px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
              }}>
                {activeApproval.arquivoTipo === 'image' && (
                  <img 
                    src={activeApproval.arquivoUrl} 
                    alt={activeApproval.arquivoNome} 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '640px', 
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }} 
                  />
                )}
                
                {activeApproval.arquivoTipo === 'video' && (
                  <video 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '640px', borderRadius: '4px' }} 
                    poster="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80"
                  >
                    <source src={activeApproval.arquivoUrl} type="video/mp4" />
                    Seu navegador não suporta a reprodução deste vídeo.
                  </video>
                )}
              </div>

              {/* Action Buttons for Decisions */}
              {activeApproval.status === 'Pendente' ? (
                <div>
                  
                  {/* Action buttons drawer */}
                  <div className="action-buttons-approval">
                    <button className="btn-approve" onClick={() => handleAction('Aprovado')}>
                      <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                      APROVAR COMPLETO
                    </button>
                    
                    <button className="btn-adjust" onClick={() => handleAction('Ajuste Solicitado')}>
                      <i className="fas fa-pencil-alt" style={{ marginRight: '6px' }}></i>
                      SOLICITAR AJUSTES
                    </button>

                    <button className="btn-reject" onClick={() => handleAction('Reprovado')}>
                      <i className="fas fa-times-circle" style={{ marginRight: '6px' }}></i>
                      REPROVAR ARTE
                    </button>
                  </div>

                  {/* Comment adjustments textarea */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#B5B5B5' }}>
                      Detalhamento dos Ajustes ou Observação de Aprovação *
                    </label>
                    <textarea
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      className="input-premium"
                      rows={3}
                      placeholder="Ex de Ajuste: Mude o preço para R$ 19,99 / Troque a imagem de fundo por um produto fresco..."
                    />
                  </div>

                </div>
              ) : (
                /* Audit Trail Details */
                <div style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: '6px',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#D4AF37', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-shield-halved"></i> Registro de Decisão Auditável (Assinatura Eletrônica)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.75rem', color: '#B5B5B5' }}>
                    <div>👤 <strong>Decidido por:</strong> {activeApproval.usuarioNome}</div>
                    <div>📅 <strong>Data / Hora:</strong> {new Date(activeApproval.dataHora || '').toLocaleString('pt-BR')}</div>
                    <div>📡 <strong>Endereço IP:</strong> {activeApproval.ipAddress}</div>
                    <div>📝 <strong>Observação registrada:</strong> {activeApproval.observacao || 'Nenhuma observação informada.'}</div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="card-premium" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Selecione um projeto na fila de análise para exibir as artes para aprovação.
            </div>
          )}
        </div>

      </div>

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
                gridTemplateColumns: 'repeat(3, 1fr)',
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
                  <i className="fab fa-whatsapp"></i> WhatsApp Web
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
