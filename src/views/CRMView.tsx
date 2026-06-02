import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Contato } from '../types';

export const CRMView: React.FC = () => {
  const { 
    clientes, 
    contatos, 
    addCliente, 
    updateCliente, 
    updateContato, 
    currentUsuario, 
    setActiveView, 
    setSelectedCalendarClientId 
  } = useData();

  // Active client selected for contact list details
  const [selectedClientId, setSelectedClientId] = useState<string>(clientes[0]?.id || '');

  // Form States - New Client
  const [showClientModal, setShowClientModal] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [segmento, setSegmento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefones, setTelefones] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [calendarioIcs, setCalendarioIcs] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Form States - Edit Client
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editRazaoSocial, setEditRazaoSocial] = useState('');
  const [editNomeFantasia, setEditNomeFantasia] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editSegmento, setEditSegmento] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editTelefones, setEditTelefones] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCalendarioIcs, setEditCalendarioIcs] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  // Form States - New Contact
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactNome, setContactNome] = useState('');
  const [contactCargo, setContactCargo] = useState('');
  const [contactTelefone, setContactTelefone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPriority, setContactPriority] = useState<number>(1);
  const [selectedAccesses, setSelectedAccesses] = useState<string[]>(['Aprovações de Criativos']);
  const [contactFotoUrl, setContactFotoUrl] = useState('');
  const [contactLogin, setContactLogin] = useState('');
  const [contactSenha, setContactSenha] = useState('');

  // Form States - Edit Contact
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editContactNome, setEditContactNome] = useState('');
  const [editContactCargo, setEditContactCargo] = useState('');
  const [editContactTelefone, setEditContactTelefone] = useState('');
  const [editContactWhatsapp, setEditContactWhatsapp] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPriority, setEditContactPriority] = useState<number>(1);
  const [editSelectedAccesses, setEditSelectedAccesses] = useState<string[]>([]);
  const [editContactFotoUrl, setEditContactFotoUrl] = useState('');
  const [editContactLogin, setEditContactLogin] = useState('');
  const [editContactSenha, setEditContactSenha] = useState('');

  const selectedClient = clientes.find(c => c.id === selectedClientId);
  const clientContacts = contatos.filter(co => co.clienteId === selectedClientId);

  const handleCreateCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !nomeFantasia || !cnpj || !email || !whatsapp) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    addCliente({
      agenciaId: currentUsuario.agenciaId,
      razaoSocial,
      nomeFantasia,
      cnpj,
      segmento,
      endereco,
      telefones,
      whatsapp,
      email,
      calendarioIcs,
      logoUrl
    });

    // Reset Form
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setSegmento('');
    setEndereco('');
    setTelefones('');
    setWhatsapp('');
    setEmail('');
    setCalendarioIcs('');
    setLogoUrl('');
    setShowClientModal(false);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNome || !contactCargo || !contactWhatsapp || !contactEmail) {
      alert('Preencha os campos obrigatórios do contato.');
      return;
    }
    if (!contactLogin || !contactSenha) {
      alert('Defina um login (e-mail) e senha para o acesso do cliente ao portal.');
      return;
    }

    const newContact: Contato = {
      id: 'co_' + Date.now(),
      clienteId: selectedClientId,
      nome: contactNome,
      cargo: contactCargo,
      telefone: contactTelefone,
      whatsapp: contactWhatsapp,
      email: contactEmail,
      prioridadeEscalonamento: +contactPriority,
      acessos: selectedAccesses,
      fotoUrl: contactFotoUrl,
      password: contactSenha
    };

    // Store reactively
    const saved = localStorage.getItem('mf_contatos');
    const existing: Contato[] = saved ? JSON.parse(saved) : contatos;
    const updated = [...existing, newContact];
    localStorage.setItem('mf_contatos', JSON.stringify(updated));
    setContactFotoUrl('');
    setContactLogin('');
    setContactSenha('');
    window.location.reload();
  };

  const handleUpdateCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editRazaoSocial || !editNomeFantasia || !editCnpj || !editEmail || !editWhatsapp) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    updateCliente({
      ...editingClient,
      razaoSocial: editRazaoSocial,
      nomeFantasia: editNomeFantasia,
      cnpj: editCnpj,
      segmento: editSegmento,
      endereco: editEndereco,
      telefones: editTelefones,
      whatsapp: editWhatsapp,
      email: editEmail,
      calendarioIcs: editCalendarioIcs,
      logoUrl: editLogoUrl
    });

    setShowEditClientModal(false);
    setEditingClient(null);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    if (!editContactNome || !editContactCargo || !editContactWhatsapp || !editContactEmail) {
      alert('Preencha os campos obrigatórios do contato.');
      return;
    }

    updateContato({
      ...editingContact,
      nome: editContactNome,
      cargo: editContactCargo,
      telefone: editContactTelefone,
      whatsapp: editContactWhatsapp,
      email: editContactEmail,
      prioridadeEscalonamento: +editContactPriority,
      acessos: editSelectedAccesses,
      fotoUrl: editContactFotoUrl,
      ...(editContactSenha ? { password: editContactSenha } : {})
    });

    setShowEditContactModal(false);
    setEditingContact(null);
    setEditContactSenha('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>CRM de Clientes & Contatos</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>Cadastre empresas, organize múltiplos contatos e configure prioridades de cobrança.</p>
        </div>
        {(currentUsuario.role === 'agencia' || currentUsuario.role === 'gestor') && (
          <button className="btn-gold" onClick={() => setShowClientModal(true)}>
            <i className="fas fa-building-circle-primary"></i> Cadastrar Empresa
          </button>
        )}
      </div>

      {/* Grid Layout: Client List vs Contact Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }}>
        
        {/* Left Column: Client list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Empresas Cadastradas</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clientes.map(cli => {
              const isActive = cli.id === selectedClientId;
              const statusColor = 
                cli.nivelEngajamento === 'excelente' ? '#35D07F' : 
                cli.nivelEngajamento === 'regular' ? '#FFAA00' : '#FF5A5A';
              const engagementLabel = 
                cli.nivelEngajamento === 'excelente' ? 'Excelente Engajamento' : 
                cli.nivelEngajamento === 'regular' ? 'Regular' : 'Crítico (Atrasos recorrentes)';

              return (
                <div 
                  key={cli.id}
                  onClick={() => setSelectedClientId(cli.id)}
                  className="card-premium"
                  style={{
                    cursor: 'pointer',
                    borderColor: isActive ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                    backgroundColor: isActive ? 'rgba(212, 175, 55, 0.03)' : 'var(--bg-card)',
                    boxShadow: isActive ? 'var(--shadow-md), var(--shadow-gold)' : 'var(--shadow-sm)',
                    transform: isActive ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#2A2A2A',
                        color: 'var(--gold-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid var(--glass-border)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {cli.logoUrl ? (
                          <img src={cli.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          cli.nomeFantasia.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>{cli.nomeFantasia}</h4>
                        {(currentUsuario.role === 'agencia' || currentUsuario.role === 'gestor') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingClient(cli);
                              setEditRazaoSocial(cli.razaoSocial);
                              setEditNomeFantasia(cli.nomeFantasia);
                              setEditCnpj(cli.cnpj);
                              setEditSegmento(cli.segmento);
                              setEditEndereco(cli.endereco);
                              setEditTelefones(cli.telefones);
                              setEditWhatsapp(cli.whatsapp);
                              setEditEmail(cli.email);
                              setEditCalendarioIcs(cli.calendarioIcs || '');
                              setEditLogoUrl(cli.logoUrl || '');
                              setShowEditClientModal(true);
                            }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '4px',
                            transition: 'color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Editar Empresa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: statusColor,
                      textTransform: 'uppercase',
                      backgroundColor: `${statusColor}15`,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {engagementLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#B5B5B5', marginBottom: '12px' }}>
                    <strong>Razão Social:</strong> {cli.razaoSocial}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#B5B5B5' }}>
                    <div>
                      <i className="fas fa-file-signature" style={{ marginRight: '6px' }}></i>
                      {cli.cnpj}
                    </div>
                    <div>
                      <i className="fas fa-tag" style={{ marginRight: '6px' }}></i>
                      {cli.segmento}
                    </div>
                    <div>
                      <i className="fab fa-whatsapp" style={{ marginRight: '6px' }}></i>
                      {cli.whatsapp}
                    </div>
                    <div>
                      <i className="far fa-envelope" style={{ marginRight: '6px' }}></i>
                      {cli.email}
                    </div>
                  </div>

                  {cli.calendarioIcs && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCalendarClientId(cli.id);
                        setActiveView('calendar');
                      }}
                      style={{ 
                        marginTop: '12px', 
                        paddingTop: '8px', 
                        borderTop: '1px solid rgba(255,255,255,0.05)', 
                        fontSize: '0.75rem', 
                        color: 'var(--gold-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      title="Clique para abrir o calendário de marketing desta empresa"
                    >
                      <i className="fas fa-calendar-alt"></i>
                      <span>Calendário: <strong style={{ textDecoration: 'underline' }}>{cli.calendarioIcs}</strong></span>
                      <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem', marginLeft: 'auto' }}></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contact management */}
        <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          {selectedClient ? (
            <>
              <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--gold-primary)' }}>
                    Contatos de: {selectedClient.nomeFantasia}
                  </h3>
                  {selectedClient.calendarioIcs ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-calendar-check"></i>
                      <span>Calendário Vinculado: <strong>{selectedClient.calendarioIcs}</strong></span>
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#B5B5B5', marginTop: '4px' }}>
                      Contatos habilitados a responder cobranças e aprovar no WhatsApp.
                    </p>
                  )}
                </div>
                {(currentUsuario.role === 'agencia' || currentUsuario.role === 'gestor') && (
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setShowContactModal(true)}>
                    <i className="fas fa-plus"></i> Novo Contato
                  </button>
                )}
              </div>

              {/* Contacts Table List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clientContacts.sort((a,b)=> a.prioridadeEscalonamento - b.prioridadeEscalonamento).map(cont => (
                  <div key={cont.id} style={{
backgroundColor: '#2A2A2A',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.02)'
                  }}>
                    <div className="flex-between" style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {cont.fotoUrl ? (
                          <img 
                            src={cont.fotoUrl} 
                            alt={cont.nome} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} 
                          />
                        ) : (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--gold-primary)',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {cont.nome.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: 0 }}>{cont.nome}</h4>
                            {(currentUsuario.role === 'agencia' || currentUsuario.role === 'gestor') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingContact(cont);
                                  setEditContactNome(cont.nome);
                                  setEditContactCargo(cont.cargo);
                                  setEditContactTelefone(cont.telefone);
                                  setEditContactWhatsapp(cont.whatsapp);
                                  setEditContactEmail(cont.email);
                                  setEditContactPriority(cont.prioridadeEscalonamento);
                                  setEditSelectedAccesses(cont.acessos || []);
                                  setEditContactFotoUrl(cont.fotoUrl || '');
                                  setShowEditContactModal(true);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--gold-primary)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  padding: '2px',
                                  transition: 'color 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Editar Contato"
                              >
                                <i className="fas fa-user-pen"></i>
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#B5B5B5' }}>{cont.cargo}</span>
                        </div>
                      </div>
                      
                      {/* Priority Tag for Escalation */}
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: 
                          cont.prioridadeEscalonamento === 1 ? 'rgba(255, 90, 90, 0.15)' : 
                          cont.prioridadeEscalonamento === 2 ? 'rgba(255, 170, 0, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: 
                          cont.prioridadeEscalonamento === 1 ? '#FF5A5A' : 
                          cont.prioridadeEscalonamento === 2 ? '#FFAA00' : '#D4AF37',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: '1px solid transparent',
                        borderColor: 
                          cont.prioridadeEscalonamento === 1 ? 'rgba(255, 90, 90, 0.3)' : 'transparent'
                      }}>
                        <i className="fas fa-signal" style={{ marginRight: '6px' }}></i>
                        Prioridade {cont.prioridadeEscalonamento} (Cobrança)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#B5B5B5' }}>
                      <div>
                        <i className="fas fa-phone" style={{ marginRight: '6px' }}></i>
                        {cont.telefone}
                      </div>
                      <div>
                        <i className="fab fa-whatsapp" style={{ marginRight: '6px', color: '#35D07F' }}></i>
                        {cont.whatsapp}
                      </div>
                    </div>

                    {/* Access permissions tags */}
                    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#B5B5B5', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Módulos de Acesso Habilitados:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {cont.acessos && cont.acessos.length > 0 ? (
                          cont.acessos.map(acc => (
                            <span key={acc} style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(58, 134, 255, 0.1)',
                              color: 'var(--gold-primary)',
                              border: '1px solid var(--glass-border)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {acc}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#666', fontStyle: 'italic' }}>
                            Sem acessos concedidos (Apenas visualização básica)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {clientContacts.length === 0 && (
                  <div style={{
                    color: '#666',
                    textAlign: 'center',
                    padding: '40px 0',
                    fontSize: '0.85rem'
                  }}>
                    Nenhum contato cadastrado para este cliente.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
              Nenhum cliente cadastrado no momento.
            </div>
          )}
        </div>

      </div>

      {/* CREATE CLIENT MODAL */}
      {showClientModal && (
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
                <i className="fas fa-building" style={{ marginRight: '8px' }}></i>
                Cadastrar Empresa / Cliente
              </h2>
              <button onClick={() => setShowClientModal(false)} style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Razão Social *
                  </label>
                  <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="input-premium" required placeholder="Ex: Supermercado Preço Bom LTDA" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Nome Fantasia *
                  </label>
                  <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="input-premium" required placeholder="Ex: Bom Preço" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    CNPJ *
                  </label>
                  <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="input-premium" required placeholder="Ex: 00.000.000/0001-00" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Segmento
                  </label>
                  <input type="text" value={segmento} onChange={(e) => setSegmento(e.target.value)} className="input-premium" placeholder="Ex: Varejo / Alimentação" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    WhatsApp Principal *
                  </label>
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-premium" required placeholder="Ex: (11) 99999-9999" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    E-mail Principal *
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium" required placeholder="Ex: contato@empresa.com" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Telefone Fixo
                </label>
                <input type="text" value={telefones} onChange={(e) => setTelefones(e.target.value)} className="input-premium" placeholder="Ex: (11) 3333-3333" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Endereço Completo
                </label>
                <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="input-premium" placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Vincular Calendário de Marketing (ICS)
                </label>
                <select 
                  value={calendarioIcs} 
                  onChange={(e) => setCalendarioIcs(e.target.value)}
                  className="input-premium"
                  style={{
                    width: '100%',
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFF',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Nenhum calendário de marketing vinculado</option>
                  <option value="Varejo_e_Alimentos_2026.ics">Varejo & Alimentos 2026 (Varejo_e_Alimentos_2026.ics)</option>
                  <option value="Gastronomia_e_Restaurantes_2026.ics">Gastronomia & Restaurantes 2026 (Gastronomia_e_Restaurantes_2026.ics)</option>
                  <option value="Estetica_e_Saude_2026.ics">Estética & Saúde 2026 (Estetica_e_Saude_2026.ics)</option>
                </select>
                <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px' }}>
                  Arquivos carregados a partir da pasta <strong>calendario marketing 2026</strong>.
                </p>
              </div>

              {/* Logotipo da Empresa */}
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
                  Logotipo da Empresa (Opcional)
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setLogoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyC: 'center', gap: '4px' } as any}>
                    <span style={{ fontSize: '0.6rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira a URL:</span>
                    <input 
                      type="text" 
                      value={logoUrl} 
                      onChange={(e) => setLogoUrl(e.target.value)} 
                      className="input-premium" 
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>

                {logoUrl && (
                  <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img 
                      src={logoUrl} 
                      alt="Logo da Empresa" 
                      style={{ maxWidth: '100%', maxHeight: '60px', borderRadius: '4px', objectFit: 'contain' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowClientModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  Salvar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE CONTACT MODAL */}
      {showContactModal && (
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
            maxWidth: '500px',
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--gold-primary)',
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#D4AF37' }}>
                <i className="fas fa-user-plus" style={{ marginRight: '8px' }}></i>
                Adicionar Novo Contato Interno
              </h2>
              <button onClick={() => setShowContactModal(false)} style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Nome Completo *
                </label>
                <input type="text" value={contactNome} onChange={(e) => setContactNome(e.target.value)} className="input-premium" required placeholder="Ex: Roberto Carlos" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Cargo *
                </label>
                <input type="text" value={contactCargo} onChange={(e) => setContactCargo(e.target.value)} className="input-premium" required placeholder="Ex: Gerente Geral / Diretor Proprietário" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    WhatsApp *
                  </label>
                  <input type="text" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} className="input-premium" required placeholder="Ex: (11) 98888-8888" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    E-mail *
                  </label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input-premium" required placeholder="Ex: roberto@empresa.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Telefone de Contato
                  </label>
                  <input type="text" value={contactTelefone} onChange={(e) => setContactTelefone(e.target.value)} className="input-premium" placeholder="Ex: (11) 3232-3232" />
                </div>
                
                {/* Priority Selection for sequence escalation */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Prioridade de Escalonamento
                  </label>
                  <select 
                    value={contactPriority} 
                    onChange={(e) => setContactPriority(+e.target.value)}
                    className="input-premium"
                  >
                    <option value={1}>1 - Operacional Principal</option>
                    <option value={2}>2 - Gerente Intermediário</option>
                    <option value={3}>3 - Diretor Executivo (Crítico)</option>
                    <option value={4}>4 - Todos envolvidos</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#B5B5B5' }}>
                  Módulos de Acesso ao Sistema
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
                  {[
                    'Aprovações de Criativos',
                    'Fluxo de Trabalho Inteligente',
                    'Central de WhatsApp',
                    'Relatórios & Metas SLA'
                  ].map((acesso) => {
                    const isChecked = selectedAccesses.includes(acesso);
                    return (
                      <label key={acesso} style={{
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
                              setSelectedAccesses(selectedAccesses.filter(a => a !== acesso));
                            } else {
                              setSelectedAccesses([...selectedAccesses, acesso]);
                            }
                          }}
                          style={{
                            accentColor: 'var(--gold-primary)',
                            cursor: 'pointer',
                            width: '14px',
                            height: '14px'
                          }}
                        />
                        {acesso}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Foto de Perfil (Imagem Local ou Link)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '12px', alignItems: 'center' }}>
                  <label style={{
                    border: '1px dashed var(--gold-primary)',
                    backgroundColor: 'rgba(212, 175, 55, 0.03)',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '4px',
                    height: '65px',
                    textAlign: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.03)'}
                  >
                    <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', fontSize: '1rem' }}></i>
                    <span style={{ fontSize: '0.58rem', color: '#fff', fontWeight: 600 }}>Subir Imagem</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setContactFotoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="text" 
                      value={contactFotoUrl} 
                      onChange={(e) => setContactFotoUrl(e.target.value)} 
                      className="input-premium" 
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      placeholder="https://exemplo.com/foto.png ou upload local"
                    />
                    {contactFotoUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={contactFotoUrl} 
                          alt="Prévia" 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setContactFotoUrl('')} 
                          style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          Remover foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Login / Senha for client portal */}
              <div style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-key" />
                  Acesso ao Portal do Cliente (login + senha)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', color: '#B5B5B5' }}>Login (e-mail) *</label>
                    <input type="email" value={contactLogin} onChange={e => setContactLogin(e.target.value)} className="input-premium" required placeholder="joao@empresa.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', color: '#B5B5B5' }}>Senha *</label>
                    <input type="password" value={contactSenha} onChange={e => setContactSenha(e.target.value)} className="input-premium" required placeholder="••••••••" />
                  </div>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#888', margin: 0 }}>
                  <i className="fas fa-shield-halved" style={{ marginRight: '4px' }} />
                  O cliente usará esses dados para acessar o portal de aprovações e calendário.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowContactModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  Adicionar Contato
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {showEditClientModal && editingClient && (
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
            boxShadow: 'var(--shadow-gold-hover)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--gold-primary)' }}>
                <i className="fas fa-building" style={{ marginRight: '8px' }}></i>
                Editar Empresa / Cliente
              </h2>
              <button onClick={() => { setShowEditClientModal(false); setEditingClient(null); }} style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Razão Social *
                  </label>
                  <input type="text" value={editRazaoSocial} onChange={(e) => setEditRazaoSocial(e.target.value)} className="input-premium" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Nome Fantasia *
                  </label>
                  <input type="text" value={editNomeFantasia} onChange={(e) => setEditNomeFantasia(e.target.value)} className="input-premium" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    CNPJ *
                  </label>
                  <input type="text" value={editCnpj} onChange={(e) => setEditCnpj(e.target.value)} className="input-premium" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Segmento
                  </label>
                  <input type="text" value={editSegmento} onChange={(e) => setEditSegmento(e.target.value)} className="input-premium" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    WhatsApp Principal *
                  </label>
                  <input type="text" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="input-premium" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    E-mail Principal *
                  </label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-premium" required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Telefone Fixo
                </label>
                <input type="text" value={editTelefones} onChange={(e) => setEditTelefones(e.target.value)} className="input-premium" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Endereço Completo
                </label>
                <input type="text" value={editEndereco} onChange={(e) => setEditEndereco(e.target.value)} className="input-premium" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Vincular Calendário de Marketing (ICS)
                </label>
                <select 
                  value={editCalendarioIcs} 
                  onChange={(e) => setEditCalendarioIcs(e.target.value)}
                  className="input-premium"
                  style={{
                    width: '100%',
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFF',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Nenhum calendário de marketing vinculado</option>
                  <option value="Varejo_e_Alimentos_2026.ics">Varejo & Alimentos 2026 (Varejo_e_Alimentos_2026.ics)</option>
                  <option value="Gastronomia_e_Restaurantes_2026.ics">Gastronomia & Restaurantes 2026 (Gastronomia_e_Restaurantes_2026.ics)</option>
                  <option value="Estetica_e_Saude_2026.ics">Estética & Saúde 2026 (Estetica_e_Saude_2026.ics)</option>
                </select>
                <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px' }}>
                  Arquivos carregados a partir da pasta <strong>calendario marketing 2026</strong>.
                </p>
              </div>

              {/* Logotipo da Empresa */}
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
                  Logotipo da Empresa (Opcional)
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditLogoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyC: 'center', gap: '4px' } as any}>
                    <span style={{ fontSize: '0.6rem', color: '#B5B5B5', fontWeight: 600 }}>Ou insira a URL:</span>
                    <input 
                      type="text" 
                      value={editLogoUrl} 
                      onChange={(e) => setEditLogoUrl(e.target.value)} 
                      className="input-premium" 
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>

                {editLogoUrl && (
                  <div style={{ position: 'relative', marginTop: '4px', textAlign: 'center', backgroundColor: '#1A1A1A', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img 
                      src={editLogoUrl} 
                      alt="Logo da Empresa" 
                      style={{ maxWidth: '100%', maxHeight: '60px', borderRadius: '4px', objectFit: 'contain' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setEditLogoUrl('')}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowEditClientModal(false); setEditingClient(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-floppy-disk"></i> Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT CONTACT MODAL */}
      {showEditContactModal && editingContact && (
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
            maxWidth: '500px',
            backgroundColor: '#1E1E1E',
            border: '1px solid var(--gold-primary)',
            boxShadow: 'var(--shadow-gold-hover)',
            transform: 'none',
            padding: '28px'
          }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--gold-primary)' }}>
                <i className="fas fa-user-pen" style={{ marginRight: '8px' }}></i>
                Editar Contato Interno
              </h2>
              <button onClick={() => { setShowEditContactModal(false); setEditingContact(null); }} style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.25rem', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUpdateContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Nome Completo *
                </label>
                <input type="text" value={editContactNome} onChange={(e) => setEditContactNome(e.target.value)} className="input-premium" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Cargo *
                </label>
                <input type="text" value={editContactCargo} onChange={(e) => setEditContactCargo(e.target.value)} className="input-premium" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    WhatsApp *
                  </label>
                  <input type="text" value={editContactWhatsapp} onChange={(e) => setEditContactWhatsapp(e.target.value)} className="input-premium" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    E-mail *
                  </label>
                  <input type="email" value={editContactEmail} onChange={(e) => setEditContactEmail(e.target.value)} className="input-premium" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Telefone de Contato
                  </label>
                  <input type="text" value={editContactTelefone} onChange={(e) => setEditContactTelefone(e.target.value)} className="input-premium" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                    Prioridade de Escalonamento
                  </label>
                  <select 
                    value={editContactPriority} 
                    onChange={(e) => setEditContactPriority(+e.target.value)}
                    className="input-premium"
                  >
                    <option value={1}>1 - Operacional Principal</option>
                    <option value={2}>2 - Gerente Intermediário</option>
                    <option value={3}>3 - Diretor Executivo (Crítico)</option>
                    <option value={4}>4 - Todos envolvidos</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#B5B5B5' }}>
                  Módulos de Acesso ao Sistema
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
                  {[
                    'Aprovações de Criativos',
                    'Fluxo de Trabalho Inteligente',
                    'Central de WhatsApp',
                    'Relatórios & Metas SLA'
                  ].map((acesso) => {
                    const isChecked = editSelectedAccesses.includes(acesso);
                    return (
                      <label key={acesso} style={{
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
                              setEditSelectedAccesses(editSelectedAccesses.filter(a => a !== acesso));
                            } else {
                              setEditSelectedAccesses([...editSelectedAccesses, acesso]);
                            }
                          }}
                          style={{
                            accentColor: 'var(--gold-primary)',
                            cursor: 'pointer',
                            width: '14px',
                            height: '14px'
                          }}
                        />
                        {acesso}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                  Foto de Perfil (Imagem Local ou Link)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '12px', alignItems: 'center' }}>
                  <label style={{
                    border: '1px dashed var(--gold-primary)',
                    backgroundColor: 'rgba(212, 175, 55, 0.03)',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '4px',
                    height: '65px',
                    textAlign: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.03)'}
                  >
                    <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', fontSize: '1rem' }}></i>
                    <span style={{ fontSize: '0.58rem', color: '#fff', fontWeight: 600 }}>Subir Imagem</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditContactFotoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="text" 
                      value={editContactFotoUrl} 
                      onChange={(e) => setEditContactFotoUrl(e.target.value)} 
                      className="input-premium" 
                      style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      placeholder="https://exemplo.com/foto.png ou upload local"
                    />
                    {editContactFotoUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={editContactFotoUrl} 
                          alt="Prévia" 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setEditContactFotoUrl('')} 
                          style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          Remover foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowEditContactModal(false); setEditingContact(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-floppy-disk"></i> Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
