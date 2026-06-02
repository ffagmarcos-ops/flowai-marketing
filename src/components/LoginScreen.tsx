import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Usuario } from '../types';

export const LoginScreen: React.FC = () => {
  const { 
    usuarios, 
    clientes, 
    contatos, 
    setCurrentUsuario, 
    setIsLoggedIn, 
    setActiveView,
    resetDatabase 
  } = useData();

  const [activeTab, setActiveTab] = useState<'master' | 'client'>('master');
  
  // Master selection state
  const masterUsers = usuarios.filter(u => u.role === 'agencia' || u.role === 'gestor' || u.role === 'designer');
  const [selectedMasterId, setSelectedMasterId] = useState<string>(masterUsers[0]?.id || '');

  // Client selection state
  const [selectedClientId, setSelectedClientId] = useState<string>(clientes[0]?.id || '');
  const filteredContatos = contatos.filter(c => c.clienteId === selectedClientId);
  const [selectedContatoId, setSelectedContatoId] = useState<string>(filteredContatos[0]?.id || '');

  const activeContato = contatos.find(c => c.id === selectedContatoId);

  // Sync contact selection when client dropdown changes
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedClientId(cid);
    const relatedContatos = contatos.filter(c => c.clienteId === cid);
    if (relatedContatos.length > 0) {
      setSelectedContatoId(relatedContatos[0].id);
    } else {
      setSelectedContatoId('');
    }
  };

  const handleLogin = () => {
    if (activeTab === 'master') {
      const user = usuarios.find(u => u.id === selectedMasterId);
      if (user) {
        setCurrentUsuario(user);
        setIsLoggedIn(true);
        setActiveView('dashboard');
      }
    } else {
      if (!selectedContatoId) {
        alert('Por favor, selecione ou cadastre um contato no CRM antes de tentar fazer login.');
        return;
      }
      
      const contact = contatos.find(c => c.id === selectedContatoId);
      if (contact) {
        // Build a simulated user session object from the contact
        const userObj: Usuario = {
          id: contact.id,
          nome: contact.nome,
          email: contact.email,
          telefone: contact.telefone,
          whatsapp: contact.whatsapp,
          cargo: contact.cargo,
          role: 'cliente', // treat logged in contacts with role cliente
          agenciaId: 'ag1',
          clienteId: contact.clienteId
        };
        
        setCurrentUsuario(userObj);
        setIsLoggedIn(true);
        
        // Find their default view based on accesses permissions
        const accesses = contact.acessos || [];
        if (accesses.includes('Aprovações de Criativos')) {
          setActiveView('approval');
        } else if (accesses.includes('Fluxo de Trabalho Inteligente')) {
          setActiveView('kanban');
        } else if (accesses.includes('Central de WhatsApp')) {
          setActiveView('whatsapp');
        } else if (accesses.includes('Relatórios & Metas SLA')) {
          setActiveView('reports');
        } else {
          // Fallback if no permissions are checked
          setActiveView('approval');
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0d0d0d',
      fontFamily: 'var(--font-body)',
      padding: '20px'
    }}>
      {/* Visual background accents */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(58, 134, 255, 0.12) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
        bottom: '-15%',
        right: '-10%',
        zIndex: 1
      }}></div>

      {/* Main Glassmorphic Card Container */}
      <div className="card-premium" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '40px 32px',
        zIndex: 10,
        backgroundColor: 'rgba(22, 22, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), var(--shadow-gold)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Logo and Brand Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: 'var(--shadow-gold)',
            animation: 'pulse 3s infinite ease-in-out'
          }}>
            <i className="fas fa-bolt" style={{ color: '#000', fontSize: '1.6rem' }}></i>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            margin: 0
          }}>
            M.O <span style={{ color: 'var(--gold-primary)' }}>FLOW</span>
          </h1>
          <p style={{
            fontSize: '0.7rem',
            color: '#B5B5B5',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '6px',
            fontWeight: 600
          }}>
            FLUXO DE TRABALHO INTELIGENTE
          </p>
        </div>

        {/* Dynamic Selection Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#1E1E1E',
          borderRadius: '8px',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <button
            onClick={() => setActiveTab('master')}
            style={{
              padding: '12px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'master' ? '#fff' : '#B5B5B5',
              backgroundColor: activeTab === 'master' ? '#2A2A2A' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-user-shield" style={{ fontSize: '0.85rem' }}></i>
            Acesso Master (Agência)
          </button>
          
          <button
            onClick={() => setActiveTab('client')}
            style={{
              padding: '12px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === 'client' ? '#fff' : '#B5B5B5',
              backgroundColor: activeTab === 'client' ? '#2A2A2A' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-building" style={{ fontSize: '0.85rem' }}></i>
            Acesso do Cliente
          </button>
        </div>

        {/* Tab 1 Content: Master Agency Accounts Grid */}
        {activeTab === 'master' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.75rem', color: '#B5B5B5', fontWeight: 600 }}>
              Selecione o profissional da agência:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {masterUsers.map(u => {
                const isSelected = selectedMasterId === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedMasterId(u.id)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(58, 134, 255, 0.08)' : '#1E1E1E',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--gold-primary)' : '#2A2A2A',
                      color: isSelected ? '#000' : '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      {u.nome.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#FFF', margin: 0 }}>{u.nome}</h4>
                      <p style={{ fontSize: '0.7rem', color: '#B5B5B5', margin: '2px 0 0 0' }}>{u.cargo}</p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: u.role === 'agencia' ? 'var(--gold-primary)' : u.role === 'gestor' ? '#35D07F' : '#00c3ff',
                      backgroundColor: u.role === 'agencia' ? 'rgba(58, 134, 255, 0.1)' : u.role === 'gestor' ? 'rgba(53, 208, 127, 0.1)' : 'rgba(0, 195, 255, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2 Content: Client Company and Contacts Dropdowns */}
        {activeTab === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Company Selection Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#B5B5B5', fontWeight: 600 }}>
                1. Selecione a Empresa / Cliente:
              </label>
              <select
                value={selectedClientId}
                onChange={handleClientChange}
                className="input-premium"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nomeFantasia} ({c.segmento})
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Selection Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#B5B5B5', fontWeight: 600 }}>
                2. Selecione o Contato Autorizado:
              </label>
              {filteredContatos.length > 0 ? (
                <select
                  value={selectedContatoId}
                  onChange={(e) => setSelectedContatoId(e.target.value)}
                  className="input-premium"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {filteredContatos.map(co => (
                    <option key={co.id} value={co.id}>
                      {co.nome} - {co.cargo}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 90, 90, 0.05)',
                  border: '1px solid rgba(255, 90, 90, 0.15)',
                  borderRadius: '8px',
                  color: '#FF5A5A',
                  fontSize: '0.75rem',
                  textAlign: 'center'
                }}>
                  Não há contatos cadastrados para esta empresa. Por favor, adicione contatos na aba CRM do painel Master primeiro.
                </div>
              )}
            </div>

            {/* Permissions Live Preview Container */}
            {activeContato && (
              <div style={{
                backgroundColor: '#1E1E1E',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.03)'
              }}>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginBottom: '10px', fontWeight: 700 }}>
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }}></i>
                  Visualizar Permissões Ativas do Contato:
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    'Aprovações de Criativos',
                    'Fluxo de Trabalho Inteligente',
                    'Central de WhatsApp',
                    'Relatórios & Metas SLA'
                  ].map(permission => {
                    const isGranted = activeContato.acessos?.includes(permission);
                    return (
                      <div key={permission} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.7rem',
                        color: isGranted ? '#FFF' : '#666'
                      }}>
                        <i className={`fas ${isGranted ? 'fa-check-circle' : 'fa-circle-xmark'}`} style={{
                          color: isGranted ? '#35D07F' : '#444',
                          fontSize: '0.8rem'
                        }}></i>
                        {permission}
                      </div>
                    );
                  })}
                </div>
                {(!activeContato.acessos || activeContato.acessos.length === 0) && (
                  <p style={{ fontSize: '0.65rem', color: '#B5B5B5', marginTop: '10px', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    Sem permissões concedidas. Acesso básico para visualização indisponível.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Login Submission CTA Button */}
        <button
          onClick={handleLogin}
          className="btn-confirm"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderRadius: '8px',
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-gold-hover)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Entrar no Fluxo
          <i className="fas fa-arrow-right-long"></i>
        </button>

        {/* Global Reset Database Tool */}
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '20px'
        }}>
          <button
            onClick={() => {
              if (window.confirm('Isso resetará o banco de dados simulado no LocalStorage para o estado de fábrica. Continuar?')) {
                resetDatabase();
                window.location.reload();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF5A5A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <i className="fas fa-arrow-rotate-left"></i>
            Resetar Tudo Operacional
          </button>
        </div>

      </div>
    </div>
  );
};
