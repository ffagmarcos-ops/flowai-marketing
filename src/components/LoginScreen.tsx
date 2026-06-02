import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Usuario, RoleType } from '../types';

// Role badge colors
const roleColor = (role: RoleType) => {
  switch (role) {
    case 'agencia':   return { bg: 'rgba(212,175,55,0.15)',  text: '#D4AF37' };
    case 'gestor':    return { bg: 'rgba(53,208,127,0.15)',  text: '#35D07F' };
    case 'designer':  return { bg: 'rgba(0,195,255,0.15)',   text: '#00C3FF' };
    case 'cliente':   return { bg: 'rgba(58,134,255,0.15)',  text: '#3A86FF' };
    default:          return { bg: 'rgba(180,180,180,0.15)', text: '#B4B4B4' };
  }
};

const roleLabel: Record<RoleType, string> = {
  superadmin: 'Super Admin',
  agencia:    'Agência',
  gestor:     'Gestor',
  designer:   'Designer',
  cliente:    'Cliente',
  colaborador:'Colaborador',
};

export const LoginScreen: React.FC = () => {
  const { usuarios, clientes, contatos, setCurrentUsuario, setIsLoggedIn, setActiveView, resetDatabase, addUsuario } = useData();

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'master' | 'client'>('master');

  // ── Password prompt for selected agency user ──────────────────────────────
  const [pendingUser, setPendingUser] = useState<Usuario | null>(null);
  const [promptPassword, setPromptPassword] = useState('');
  const [promptError, setPromptError] = useState('');

  // ── New user registration form ─────────────────────────────────────────
  const [showRegister, setShowRegister] = useState(false);
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regCargo, setRegCargo] = useState('');
  const [regRole, setRegRole] = useState<RoleType>('gestor');
  const [regError, setRegError] = useState('');

  // ── Client tab ─────────────────────────────────────────────────────────
  const [selectedClientId, setSelectedClientId] = useState(clientes[0]?.id || '');
  const filteredContatos = contatos.filter(c => c.clienteId === selectedClientId);
  const [selectedContatoId, setSelectedContatoId] = useState(filteredContatos[0]?.id || '');
  const activeContato = contatos.find(c => c.id === selectedContatoId);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedClientId(cid);
    const rel = contatos.filter(c => c.clienteId === cid);
    setSelectedContatoId(rel[0]?.id || '');
  };

  // Only show agency-side users (not clients/colaboradores)
  const agencyUsers = usuarios.filter(u => ['agencia', 'gestor', 'designer'].includes(u.role));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectUser = (user: Usuario) => {
    setPendingUser(user);
    setPromptPassword('');
    setPromptError('');
  };

  const handleConfirmPassword = () => {
    if (!pendingUser) return;
    if ((pendingUser as any).password === promptPassword) {
      setCurrentUsuario(pendingUser);
      setIsLoggedIn(true);
      setActiveView('dashboard');
    } else {
      setPromptError('Senha incorreta. Tente novamente.');
    }
  };

  const handleRegister = () => {
    setRegError('');
    if (!regNome.trim() || !regEmail.trim() || !regSenha.trim()) {
      setRegError('Preencha nome, e-mail e senha.');
      return;
    }
    if (usuarios.find(u => u.email.toLowerCase() === regEmail.toLowerCase())) {
      setRegError('Este e-mail já está cadastrado.');
      return;
    }
    const newUser: Usuario = {
      id: 'u_' + Date.now(),
      nome: regNome.trim(),
      email: regEmail.trim().toLowerCase(),
      telefone: '',
      whatsapp: '',
      cargo: regCargo.trim(),
      role: regRole,
      agenciaId: 'ag1',
      password: regSenha,
    };
    addUsuario(newUser);
    setShowRegister(false);
    setRegNome(''); setRegEmail(''); setRegSenha(''); setRegCargo(''); setRegRole('gestor');
  };

  const handleClientLogin = () => {
    if (!selectedContatoId) {
      alert('Selecione um contato autorizado para entrar.');
      return;
    }
    const contact = contatos.find(c => c.id === selectedContatoId);
    if (!contact) return;
    const userObj: Usuario = {
      id: contact.id,
      nome: contact.nome,
      email: contact.email,
      telefone: contact.telefone,
      whatsapp: contact.whatsapp,
      cargo: contact.cargo,
      role: 'cliente',
      agenciaId: 'ag1',
      clienteId: contact.clienteId,
    };
    setCurrentUsuario(userObj);
    setIsLoggedIn(true);
    const acc = contact.acessos || [];
    if (acc.includes('Aprovações de Criativos'))        setActiveView('approval');
    else if (acc.includes('Fluxo de Trabalho Inteligente')) setActiveView('kanban');
    else if (acc.includes('Central de WhatsApp'))       setActiveView('whatsapp');
    else if (acc.includes('Relatórios & Metas SLA'))    setActiveView('reports');
    else                                                 setActiveView('approval');
  };

  // ── Shared card style ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    backgroundColor: '#252525', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
      backgroundColor: '#0d0d0d', fontFamily: 'var(--font-body)', padding: '20px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(58,134,255,0.1) 0%, transparent 70%)', top:'-10%', left:'-10%', zIndex:1 }} />
      <div style={{ position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)', bottom:'-15%', right:'-10%', zIndex:1 }} />

      {/* Password prompt modal */}
      {pendingUser && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#1A1A1A', border: '1px solid var(--glass-border)',
            borderRadius: '14px', padding: '32px 28px', width: '340px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: 'var(--gold-primary)', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.1rem', flexShrink: 0,
              }}>
                {pendingUser.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{pendingUser.nome}</h3>
                <span style={{ fontSize: '0.7rem', color: '#B5B5B5' }}>{pendingUser.cargo || roleLabel[pendingUser.role]}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: '#B5B5B5', fontWeight: 600 }}>Digite sua senha:</label>
              <input
                type="password"
                autoFocus
                value={promptPassword}
                onChange={e => { setPromptPassword(e.target.value); setPromptError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleConfirmPassword()}
                placeholder="••••••••"
                style={inputStyle}
              />
              {promptError && (
                <p style={{ fontSize: '0.72rem', color: '#FF5A5A', margin: 0 }}>
                  <i className="fas fa-circle-exclamation" style={{ marginRight: '6px' }} />
                  {promptError}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPendingUser(null)} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333',
                backgroundColor: 'transparent', color: '#B5B5B5', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}>Cancelar</button>
              <button onClick={handleConfirmPassword} style={{
                flex: 2, padding: '10px', borderRadius: '8px', border: 'none',
                backgroundColor: 'var(--gold-primary)', color: '#000', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <i className="fas fa-unlock-keyhole" />
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div style={{
        width: '100%', maxWidth: '540px', padding: '40px 32px', zIndex: 10,
        backgroundColor: 'rgba(22,22,22,0.92)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)', borderRadius: '18px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '24px',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '12px',
            backgroundColor: 'var(--gold-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px auto',
            boxShadow: 'var(--shadow-gold)', animation: 'pulse 3s infinite ease-in-out',
          }}>
            <i className="fas fa-bolt" style={{ color: '#000', fontSize: '1.6rem' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.05em', margin: 0 }}>
            M.O <span style={{ color: 'var(--gold-primary)' }}>FLOW</span>
          </h1>
          <p style={{ fontSize: '0.68rem', color: '#B5B5B5', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '6px', fontWeight: 600 }}>
            FLUXO DE TRABALHO INTELIGENTE
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#1E1E1E', borderRadius: '8px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['master', 'client'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 10px', fontSize: '0.8rem', fontWeight: 600,
              color: activeTab === tab ? '#fff' : '#B5B5B5',
              backgroundColor: activeTab === tab ? '#2A2A2A' : 'transparent',
              border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <i className={`fas ${tab === 'master' ? 'fa-user-shield' : 'fa-building'}`} style={{ fontSize: '0.85rem' }} />
              {tab === 'master' ? 'Acesso Agência' : 'Acesso Cliente'}
            </button>
          ))}
        </div>

        {/* ── AGENCY TAB ── */}
        {activeTab === 'master' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.72rem', color: '#B5B5B5', margin: 0 }}>
              Selecione seu perfil e insira a senha para entrar:
            </p>

            {/* User list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {agencyUsers.map(u => {
                const rc = roleColor(u.role);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    style={{
                      backgroundColor: '#1E1E1E',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', padding: '13px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold-primary)'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(58,134,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E1E1E'; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      backgroundColor: rc.bg, color: rc.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                    }}>
                      {u.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.88rem', color: '#FFF', margin: 0, fontWeight: 700 }}>{u.nome}</h4>
                      <p style={{ fontSize: '0.68rem', color: '#B5B5B5', margin: '2px 0 0 0' }}>{u.cargo || roleLabel[u.role]}</p>
                    </div>
                    {/* Role badge */}
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700, color: rc.text,
                      backgroundColor: rc.bg, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
                    }}>
                      {roleLabel[u.role]}
                    </span>
                    <i className="fas fa-lock" style={{ color: '#555', fontSize: '0.75rem' }} />
                  </button>
                );
              })}
            </div>

            {/* Register toggle */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => { setShowRegister(v => !v); setRegError(''); }} style={{
                background: 'none', border: 'none', color: '#35D07F',
                fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                <i className={`fas ${showRegister ? 'fa-minus-circle' : 'fa-user-plus'}`} />
                {showRegister ? 'Cancelar cadastro' : 'Cadastrar novo usuário'}
              </button>
            </div>

            {/* Registration form */}
            {showRegister && (
              <div style={{
                backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  <i className="fas fa-user-plus" style={{ marginRight: '8px' }} />
                  Novo Usuário
                </h4>

                {[
                  { label: 'Nome completo *', value: regNome, set: setRegNome, type: 'text', placeholder: 'Ex: Ana Beatriz' },
                  { label: 'E-mail *', value: regEmail, set: setRegEmail, type: 'email', placeholder: 'ana@flowai.com' },
                  { label: 'Senha *', value: regSenha, set: setRegSenha, type: 'password', placeholder: '••••••••' },
                  { label: 'Cargo', value: regCargo, set: setRegCargo, type: 'text', placeholder: 'Ex: Designer Pleno' },
                ].map(({ label, value, set, type, placeholder }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.68rem', color: '#B5B5B5', fontWeight: 600 }}>{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: '#B5B5B5', fontWeight: 600 }}>Tipo de acesso *</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value as RoleType)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="agencia">Agência (acesso total)</option>
                    <option value="gestor">Gestor de Contas</option>
                    <option value="designer">Designer</option>
                    <option value="colaborador">Colaborador</option>
                  </select>
                </div>

                {regError && (
                  <p style={{ fontSize: '0.72rem', color: '#FF5A5A', margin: 0 }}>
                    <i className="fas fa-circle-exclamation" style={{ marginRight: '6px' }} />{regError}
                  </p>
                )}

                <button onClick={handleRegister} style={{
                  padding: '11px', borderRadius: '8px', border: 'none',
                  backgroundColor: 'var(--gold-primary)', color: '#000',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
                }}>
                  <i className="fas fa-check" />
                  Criar Usuário
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CLIENT TAB ── */}
        {activeTab === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: '#B5B5B5', fontWeight: 600 }}>1. Empresa / Cliente:</label>
              <select value={selectedClientId} onChange={handleClientChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nomeFantasia} ({c.segmento})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: '#B5B5B5', fontWeight: 600 }}>2. Contato Autorizado:</label>
              {filteredContatos.length > 0 ? (
                <select value={selectedContatoId} onChange={e => setSelectedContatoId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {filteredContatos.map(co => <option key={co.id} value={co.id}>{co.nome} — {co.cargo}</option>)}
                </select>
              ) : (
                <div style={{ padding: '12px', backgroundColor: 'rgba(255,90,90,0.05)', border: '1px solid rgba(255,90,90,0.15)', borderRadius: '8px', color: '#FF5A5A', fontSize: '0.75rem', textAlign: 'center' }}>
                  Nenhum contato cadastrado para esta empresa.
                </div>
              )}
            </div>

            {activeContato && (
              <div style={{ backgroundColor: '#1A1A1A', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h5 style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginBottom: '10px', fontWeight: 700 }}>
                  <i className="fas fa-shield-halved" style={{ marginRight: '6px' }} />Permissões do contato:
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Aprovações de Criativos', 'Fluxo de Trabalho Inteligente', 'Central de WhatsApp', 'Relatórios & Metas SLA'].map(p => {
                    const ok = activeContato.acessos?.includes(p);
                    return (
                      <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: ok ? '#FFF' : '#555' }}>
                        <i className={`fas ${ok ? 'fa-check-circle' : 'fa-circle-xmark'}`} style={{ color: ok ? '#35D07F' : '#333', fontSize: '0.8rem' }} />
                        {p}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={handleClientLogin} style={{
              width: '100%', padding: '13px', fontSize: '0.88rem', fontWeight: 700,
              borderRadius: '8px', border: 'none', backgroundColor: 'var(--gold-primary)', color: '#000',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: 'var(--shadow-gold-hover)',
            }}>
              Entrar como Cliente
              <i className="fas fa-arrow-right-long" />
            </button>
          </div>
        )}

        {/* Reset */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
          <button
            onClick={() => { if (window.confirm('Resetar banco de dados para o estado inicial?')) { resetDatabase(); window.location.reload(); } }}
            style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF5A5A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
          >
            <i className="fas fa-arrow-rotate-left" />
            Resetar banco de dados
          </button>
        </div>
      </div>
    </div>
  );
};
