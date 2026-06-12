import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { ItemPlanejamento, CanalMidia, CategoriaDemanda, PrioridadeDemanda } from '../types';

const CANAIS_OPCOES: { value: CanalMidia; label: string; icon: string; color: string }[] = [
  { value: 'Instagram', label: 'Instagram', icon: 'fa-instagram', color: '#E1306C' },
  { value: 'Facebook', label: 'Facebook', icon: 'fa-facebook-f', color: '#1877F2' },
  { value: 'YouTube', label: 'YouTube', icon: 'fa-youtube', color: '#FF0000' },
  { value: 'LinkedIn', label: 'LinkedIn', icon: 'fa-linkedin-in', color: '#0A66C2' },
  { value: 'E-mail', label: 'E-mail / Newsletter', icon: 'fa-envelope-open-text', color: '#FFB020' },
  { value: 'Blog', label: 'Blog / Artigo', icon: 'fa-blog', color: '#35D07F' },
  { value: 'Outros', label: 'Outro Canal', icon: 'fa-share-nodes', color: '#B5B5B5' },
];

const MESES_OPCOES = [
  { value: '2026-01', label: 'Janeiro 2026' },
  { value: '2026-02', label: 'Fevereiro 2026' },
  { value: '2026-03', label: 'Março 2026' },
  { value: '2026-04', label: 'Abril 2026' },
  { value: '2026-05', label: 'Maio 2026' },
  { value: '2026-06', label: 'Junho 2026' },
  { value: '2026-07', label: 'Julho 2026' },
  { value: '2026-08', label: 'Agosto 2026' },
  { value: '2026-09', label: 'Setembro 2026' },
  { value: '2026-10', label: 'Outubro 2026' },
  { value: '2026-11', label: 'Novembro 2026' },
  { value: '2026-12', label: 'Dezembro 2026' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  backgroundColor: '#252525', border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
};

export const PlannerView: React.FC = () => {
  const {
    itensPlanejamento,
    clientes,
    usuarios,
    contatos,
    currentUsuario,
    addItemPlanejamento,
    updateItemPlanejamento,
    deleteItemPlanejamento,
    converterPlanejamentoEmDemanda,
    setActiveView
  } = useData();

  const isClient = !!currentUsuario.clienteId;

  // Context Filter States
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isClient ? (currentUsuario.clienteId || '') : (clientes[0]?.id || '')
  );
  const [selectedMes, setSelectedMes] = useState<string>('2026-06');

  // Form Modals states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemPlanejamento | null>(null);

  // Form Fields
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [canal, setCanal] = useState<CanalMidia>('Instagram');
  const [dataPostagem, setDataPostagem] = useState('');
  const [categoria, setCategoria] = useState<CategoriaDemanda>('Rede Social');
  const [prioridade, setPrioridade] = useState<PrioridadeDemanda>('Média');
  const [responsavelId, setResponsavelId] = useState('');
  const [aprovadoresIds, setAprovadoresIds] = useState<string[]>([]);

  // Filtered List
  const activeClient = clientes.find(c => c.id === selectedClientId);
  const monthlyItems = itensPlanejamento.filter(
    item => item.clienteId === selectedClientId && item.mes === selectedMes
  ).sort((a, b) => a.dataPostagem.localeCompare(b.dataPostagem));

  const clientContacts = contatos.filter(co => co.clienteId === selectedClientId);
  const agencyUsers = usuarios.filter(u => ['agencia', 'gestor', 'designer', 'colaborador', 'superadmin'].includes(u.role));

  const totalPlanned = monthlyItems.length;
  const totalConverted = monthlyItems.filter(item => !!item.demandaGeradaId).length;
  const totalPending = totalPlanned - totalConverted;

  // Open Form Handler
  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitulo('');
    setDescricao('');
    setCanal('Instagram');
    setDataPostagem(selectedMes + '-15'); // set mid month as suggestion
    setCategoria('Rede Social');
    setPrioridade('Média');
    setResponsavelId(agencyUsers[0]?.id || '');
    setAprovadoresIds([]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: ItemPlanejamento) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setDescricao(item.descricao);
    setCanal(item.canal);
    setDataPostagem(item.dataPostagem);
    setCategoria(item.categoria);
    setPrioridade(item.prioridade);
    setResponsavelId(item.responsavelId);
    setAprovadoresIds(item.aprovadoresIds || []);
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitulo = titulo.trim() || 'Criativo Sem Título';
    const finalData = dataPostagem || (selectedMes + '-15');
    const finalResponsavel = responsavelId || (agencyUsers[0]?.id || 'master1');

    const payload = {
      clienteId: selectedClientId,
      mes: selectedMes,
      titulo: finalTitulo,
      descricao: descricao.trim(),
      canal,
      dataPostagem: finalData,
      categoria,
      prioridade,
      responsavelId: finalResponsavel,
      aprovadoresIds
    };

    if (editingItem) {
      updateItemPlanejamento({
        ...editingItem,
        ...payload
      });
    } else {
      addItemPlanejamento(payload);
    }

    setShowModal(false);
  };

  const handleToggleApprover = (contactId: string) => {
    setAprovadoresIds(prev => 
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Planejador Mensal de Campanhas</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Planeje postagens do cronograma mensal e converta rascunhos em demandas ativas para a equipe em um clique.
          </p>
        </div>
        {!isClient && (
          <button className="btn-gold" onClick={handleOpenCreate}>
            <i className="fas fa-calendar-plus" style={{ marginRight: '8px' }}></i>
            Novo Post Planejado
          </button>
        )}
      </div>

      {/* FILTER ROW */}
      <div className="card-premium" style={{ 
        padding: '16px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {isClient ? (
            <div style={{ fontSize: '0.9rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-building" style={{ color: 'var(--gold-primary)' }}></i>
              <span>Empresa: <strong>{activeClient?.nomeFantasia}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B5B5B5' }}>Empresa:</label>
              <select 
                value={selectedClientId} 
                onChange={(e) => setSelectedClientId(e.target.value)}
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
                {clientes.map(cli => (
                  <option key={cli.id} value={cli.id}>{cli.nomeFantasia}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B5B5B5' }}>Mês Referência:</label>
            <select 
              value={selectedMes} 
              onChange={(e) => setSelectedMes(e.target.value)}
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
              {MESES_OPCOES.map(mes => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
        </div>

        {activeClient && (
          <span style={{ fontSize: '0.75rem', color: '#B5B5B5' }}>
            Segmento: <strong style={{ color: 'var(--gold-primary)' }}>{activeClient.segmento}</strong>
          </span>
        )}
      </div>

      {/* DASHBOARD INDICATORS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Posts Planejados', value: totalPlanned, icon: 'fa-calendar-days', color: '#00c3ff' },
          { label: 'Demandas em Produção (Kanban)', value: totalConverted, icon: 'fa-circle-check', color: '#35D07F' },
          { label: 'Aguardando Produção', value: totalPending, icon: 'fa-clock', color: '#FFB020' }
        ].map((item, idx) => (
          <div key={idx} className="card-premium" style={{ 
            padding: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            transform: 'none'
          }}>
            <div>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#B5B5B5', fontWeight: 600 }}>{item.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{item.value}</h3>
            </div>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              backgroundColor: `${item.color}15`, 
              border: `1px solid ${item.color}30`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: item.color,
              fontSize: '1.25rem'
            }}>
              <i className={`fas ${item.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* PLANNED TIMELINE ITEMS */}
      <div className="card-premium" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--gold-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-list-timeline"></i>
          Cronograma de Postagens do Mês
        </h2>

        {monthlyItems.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: '0.9rem' }}>
            <i className="far fa-calendar-times" style={{ fontSize: '2.5rem', marginBottom: '14px', display: 'block', color: '#333' }} />
            Nenhuma postagem ou campanha planejada para este período.
            {!isClient && (
              <button 
                className="btn-gold" 
                onClick={handleOpenCreate} 
                style={{ display: 'block', margin: '14px auto 0 auto', padding: '6px 14px', fontSize: '0.78rem' }}
              >
                Começar Planejamento
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {monthlyItems.map(item => {
              const chInfo = CANAIS_OPCOES.find(c => c.value === item.canal) || CANAIS_OPCOES[6];
              const isConverted = !!item.demandaGeradaId;
              const respUser = usuarios.find(u => u.id === item.responsavelId);

              return (
                <div 
                  key={item.id} 
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    opacity: isConverted ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
                    
                    {/* Media channel icon */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: `${chInfo.color}15`,
                      border: `1px solid ${chInfo.color}30`,
                      color: chInfo.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }} title={chInfo.label}>
                      <i className={`fab ${chInfo.icon}`}></i>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                          {new Date(item.dataPostagem + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ color: '#333' }}>•</span>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', margin: 0 }}>{item.titulo}</h4>
                      </div>
                      
                      {item.descricao && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#B5B5B5', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <strong>Briefing:</strong> {item.descricao}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.65rem', color: '#888', backgroundColor: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                          Categoria: <strong>{item.categoria}</strong>
                        </span>
                        <span style={{ fontSize: '0.65rem', color: item.prioridade === 'Urgente' || item.prioridade === 'Alta' ? '#FF5A5A' : '#B5B5B5', backgroundColor: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                          Prioridade: <strong>{item.prioridade}</strong>
                        </span>
                        {respUser && (
                          <span style={{ fontSize: '0.65rem', color: '#B5B5B5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="far fa-user" style={{ fontSize: '0.6rem' }} />
                            Equipe: <strong>{respUser.nome}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Conversion flow trigger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {isConverted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#35D07F', backgroundColor: 'rgba(53,208,127,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(53,208,127,0.2)' }}>
                          <i className="fas fa-circle-check" style={{ marginRight: '6px' }}></i>
                          Em Produção
                        </span>
                        <button 
                          onClick={() => setActiveView('kanban')}
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                        >
                          Ver no Kanban <i className="fas fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        {!isClient && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.05)', color: '#B5B5B5', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <i className="fas fa-pen" /> Editar
                            </button>
                            <button
                              onClick={() => { if (window.confirm('Excluir este post do planejador?')) deleteItemPlanejamento(item.id); }}
                              style={{ background: 'none', border: '1px solid rgba(255,90,90,0.1)', color: '#FF5A5A', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <i className="fas fa-trash-can" /> Excluir
                            </button>
                            <button 
                              onClick={() => converterPlanejamentoEmDemanda(item.id)}
                              className="btn-gold"
                              style={{ padding: '7px 14px', fontSize: '0.75rem', backgroundColor: '#35D07F', borderColor: '#35D07F', color: '#000', fontWeight: 700 }}
                            >
                              🚀 Enviar Produção
                            </button>
                          </>
                        )}
                        {isClient && (
                          <span style={{ fontSize: '0.72rem', color: '#666', fontStyle: 'italic' }}>
                            Aguardando criação da agência
                          </span>
                        )}
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--glass-border)',
            borderRadius: '14px',
            padding: '28px',
            width: '560px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--gold-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-calendar-plus" />
                {editingItem ? 'Editar Post Planejado' : 'Novo Post Planejado'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Título do Post / Tema
                </label>
                <input 
                  type="text" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  placeholder="Ex: Lançamento do Produto X" 
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Canal de Mídia
                  </label>
                  <select 
                    value={canal} 
                    onChange={(e) => setCanal(e.target.value as CanalMidia)}
                    style={inputStyle}
                  >
                    {CANAIS_OPCOES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Data Programada
                  </label>
                  <input 
                    type="date" 
                    value={dataPostagem} 
                    onChange={(e) => setDataPostagem(e.target.value)} 
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Categoria da Demanda
                  </label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaDemanda)} style={inputStyle}>
                    <option value="Rede Social">Rede Social</option>
                    <option value="Encarte">Encarte</option>
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
                  <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as PrioridadeDemanda)} style={inputStyle}>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Responsável Técnico (Agência)
                  </label>
                  <select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} style={inputStyle}>
                    <option value="">Selecione o Responsável</option>
                    {agencyUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.cargo || u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Descrição / Briefing do Criativo
                </label>
                <textarea 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  placeholder="Instruções para o criativo, textos de apoio ou briefings de imagem."
                  style={inputStyle}
                  rows={4}
                />
              </div>

              {/* Designated Approvers checkbox list */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Aprovadores Designados do Cliente
                </label>
                {clientContacts.length === 0 ? (
                  <p style={{ color: '#555', fontSize: '0.72rem', margin: '4px 0 0 0' }}>
                    Nenhum contato de cliente cadastrado no CRM para esta empresa.
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#161616'
                  }}>
                    {clientContacts.map(co => (
                      <label key={co.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#E0E0E0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={aprovadoresIds.includes(co.id)} 
                          onChange={() => handleToggleApprover(co.id)} 
                          style={{ cursor: 'pointer' }}
                        />
                        {co.nome}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-gold">
                  <i className="fas fa-check" style={{ marginRight: '6px' }} />
                  {editingItem ? 'Salvar Edições' : 'Criar Planejamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
