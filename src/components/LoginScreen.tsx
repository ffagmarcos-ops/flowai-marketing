import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Usuario, RoleType } from '../types';

const roleColor = (role: RoleType) => {
  switch (role) {
    case 'agencia':    return { bg: 'rgba(212,175,55,0.15)',  text: '#D4AF37' };
    case 'gestor':     return { bg: 'rgba(53,208,127,0.15)',  text: '#35D07F' };
    case 'designer':   return { bg: 'rgba(0,195,255,0.15)',   text: '#00C3FF' };
    case 'cliente':    return { bg: 'rgba(58,134,255,0.15)',  text: '#3A86FF' };
    default:           return { bg: 'rgba(180,180,180,0.15)', text: '#B4B4B4' };
  }
};

const roleLabel: Record<RoleType, string> = {
  superadmin: 'Super Admin', agencia: 'Agência', gestor: 'Gestor',
  designer: 'Designer', cliente: 'Cliente', colaborador: 'Colaborador',
};

export const LoginScreen: React.FC = () => {
  const { usuarios, contatos, clientes, setCurrentUsuario, setIsLoggedIn, setActiveView, resetDatabase, addUsuario } = useData();

  const [activeTab, setActiveTab] = useState<'master' | 'client'>('master');

  // ── Agency: click-user → password modal ─────────────────────────────────
  const [pendingUser, setPendingUser]     = useState<Usuario | null>(null);
  const [promptPassword, setPromptPassword] = useState('');
  const [promptError, setPromptError]     = useState('');

  // ── Agency: new user registration (only accessible inside the system login) ─
  const [showRegister, setShowRegister]   = useState(false);
  const [regNome, setRegNome]             = useState('');
  const [regEmail, setRegEmail]           = useState('');
  const [regSenha, setRegSenha]           = useState('');
  const [regCargo, setRegCargo]           = useState('');
  const [regRole, setRegRole]             = useState<RoleType>('gestor');
  const [regError, setRegError]           = useState('');

  // ── Client tab: email + password ─────────────────────────────────────────
  const [clientEmail, setClientEmail]     = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientError, setClientError]     = useState('');

  const agencyUsers = usuarios.filter(u => ['agencia', 'gestor', 'designer'].includes(u.role));

  // ── Handlers ─────────────────────────────────────────────────────────────
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
    if (!regNome.trim() || !regEmail.trim() || !regSenha.trim()) { setRegError('Nome, e-mail e senha são obrigatórios.'); return; }
    if (usuarios.find(u => u.email.toLowerCase() === regEmail.toLowerCase())) { setRegError('Este e-mail já está cadastrado.'); return; }
    addUsuario({
      id: 'u_' + Date.now(), nome: regNome.trim(), email: regEmail.trim().toLowerCase(),
      telefone: '', whatsapp: '', cargo: regCargo.trim(), role: regRole,
      agenciaId: 'ag1', password: regSenha,
    });
    setShowRegister(false);
    setRegNome(''); setRegEmail(''); setRegSenha(''); setRegCargo(''); setRegRole('gestor');
  };

  const handleClientLogin = () => {
    setClientError('');
    const email = clientEmail.trim().toLowerCase();
    const contact = contatos.find(c => c.email.toLowerCase() === email && (c as any).password === clientPassword);
    if (!contact) { setClientError('E-mail ou senha inválidos.'); return; }

    const clienteVinculado = clientes.find(cl => cl.id === contact.clienteId);
    const userObj: Usuario = {
      id: contact.id, nome: contact.nome, email: contact.email,
      telefone: contact.telefone, whatsapp: contact.whatsapp, cargo: contact.cargo,
      role: 'cliente', agenciaId: 'ag1', clienteId: contact.clienteId,
    };
    setCurrentUsuario(userObj);
    setIsLoggedIn(true);

    // Client can only see: approvals + calendar for their company
    const acc = contact.acessos || [];
    if (acc.includes('Aprovações de Criativos')) setActiveView('approval');
    else setActiveView('approval'); // default for clients
  };

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
      <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(58,134,255,0.1) 0%, transparent 70%)', top:'-10%', left:'-10%', zIndex:1 }} />
      <div style={{ position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)', bottom:'-15%', right:'-10%', zIndex:1 }} />

      {/* Password prompt modal for agency users */}
      {pendingUser && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{
            backgroundColor:'#1A1A1A', border:'1px solid var(--glass-border)', borderRadius:'14px',
            padding:'32px 28px', width:'340px', boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
            display:'flex', flexDirection:'column', gap:'16px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{
                width:'44px', height:'44px', borderRadius:'50%', backgroundColor:'var(--gold-primary)',
                color:'#000', display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:'1.1rem', flexShrink:0,
              }}>
                {pendingUser.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin:0, fontSize:'0.95rem', color:'#fff', fontWeight:700 }}>{pendingUser.nome}</h3>
                <span style={{ fontSize:'0.7rem', color:'#B5B5B5' }}>{pendingUser.cargo || roleLabel[pendingUser.role]}</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.72rem', color:'#B5B5B5', fontWeight:600 }}>Digite sua senha:</label>
              <input
                type="password" autoFocus value={promptPassword}
                onChange={e => { setPromptPassword(e.target.value); setPromptError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleConfirmPassword()}
                placeholder="••••••••" style={inputStyle}
              />
              {promptError && <p style={{ fontSize:'0.72rem', color:'#FF5A5A', margin:0 }}><i className="fas fa-circle-exclamation" style={{ marginRight:'6px' }} />{promptError}</p>}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => { setPendingUser(null); setPromptPassword(''); setPromptError(''); }} style={{ flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #333', backgroundColor:'transparent', color:'#B5B5B5', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>Cancelar</button>
              <button onClick={handleConfirmPassword} style={{ flex:2, padding:'10px', borderRadius:'8px', border:'none', backgroundColor:'var(--gold-primary)', color:'#000', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <i className="fas fa-unlock-keyhole" />Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div style={{
        width:'100%', maxWidth:'540px', padding:'40px 32px', zIndex:10,
        backgroundColor:'rgba(22,22,22,0.92)', backdropFilter:'blur(24px)',
        border:'1px solid var(--glass-border)', borderRadius:'18px',
        boxShadow:'0 24px 48px rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', gap:'24px',
      }}>
        {/* Brand */}
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:'54px', height:'54px', borderRadius:'12px', backgroundColor:'var(--gold-primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px auto', boxShadow:'var(--shadow-gold)', animation:'pulse 3s infinite ease-in-out',
          }}>
            <i className="fas fa-bolt" style={{ color:'#000', fontSize:'1.6rem' }} />
          </div>
          <h1 style={{ fontFamily:'var(--font-title)', fontSize:'2rem', fontWeight:800, letterSpacing:'0.05em', margin:0 }}>
            M.O <span style={{ color:'var(--gold-primary)' }}>FLOW</span>
          </h1>
          <p style={{ fontSize:'0.68rem', color:'#B5B5B5', letterSpacing:'0.15em', textTransform:'uppercase', marginTop:'6px', fontWeight:600 }}>
            FLUXO DE TRABALHO INTELIGENTE
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', backgroundColor:'#1E1E1E', borderRadius:'8px', padding:'4px', border:'1px solid rgba(255,255,255,0.05)' }}>
          {(['master','client'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'12px 10px', fontSize:'0.8rem', fontWeight:600,
              color: activeTab === tab ? '#fff' : '#B5B5B5',
              backgroundColor: activeTab === tab ? '#2A2A2A' : 'transparent',
              border:'none', borderRadius:'6px', cursor:'pointer', transition:'all 0.2s ease',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            }}>
              <i className={`fas ${tab === 'master' ? 'fa-user-shield' : 'fa-building'}`} style={{ fontSize:'0.85rem' }} />
              {tab === 'master' ? 'Acesso Agência' : 'Acesso Cliente'}
            </button>
          ))}
        </div>

        {/* ── AGENCY TAB ── */}
        {activeTab === 'master' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <p style={{ fontSize:'0.72rem', color:'#B5B5B5', margin:0 }}>Selecione seu perfil e insira a senha para entrar:</p>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {agencyUsers.map(u => {
                const rc = roleColor(u.role);
                return (
                  <button key={u.id} onClick={() => { setPendingUser(u); setPromptPassword(''); setPromptError(''); }}
                    style={{
                      backgroundColor:'#1E1E1E', border:'1px solid rgba(255,255,255,0.06)',
                      borderRadius:'10px', padding:'13px 16px', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:'14px', transition:'all 0.2s ease',
                      textAlign:'left', width:'100%',
                    }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--gold-primary)'; (e.currentTarget).style.backgroundColor = 'rgba(58,134,255,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget).style.backgroundColor = '#1E1E1E'; }}
                  >
                    <div style={{ width:'38px', height:'38px', borderRadius:'50%', backgroundColor:rc.bg, color:rc.text, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.9rem', flexShrink:0 }}>
                      {u.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <h4 style={{ fontSize:'0.88rem', color:'#FFF', margin:0, fontWeight:700 }}>{u.nome}</h4>
                      <p style={{ fontSize:'0.68rem', color:'#B5B5B5', margin:'2px 0 0 0' }}>{u.cargo || roleLabel[u.role]}</p>
                    </div>
                    <span style={{ fontSize:'0.62rem', fontWeight:700, color:rc.text, backgroundColor:rc.bg, padding:'3px 8px', borderRadius:'4px', textTransform:'uppercase' }}>
                      {roleLabel[u.role]}
                    </span>
                    <i className="fas fa-lock" style={{ color:'#555', fontSize:'0.75rem' }} />
                  </button>
                );
              })}
            </div>

            {/* Register new agency user — only available here inside the login */}
            <div style={{ textAlign:'center' }}>
              <button onClick={() => { setShowRegister(v => !v); setRegError(''); }} style={{ background:'none', border:'none', color:'#35D07F', fontSize:'0.75rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                <i className={`fas ${showRegister ? 'fa-minus-circle' : 'fa-user-plus'}`} />
                {showRegister ? 'Cancelar cadastro' : 'Cadastrar novo usuário da agência'}
              </button>
            </div>

            {showRegister && (
              <div style={{ backgroundColor:'#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                <h4 style={{ margin:0, fontSize:'0.85rem', color:'var(--gold-primary)', fontWeight:700 }}>
                  <i className="fas fa-user-plus" style={{ marginRight:'8px' }} />Novo Usuário da Agência
                </h4>
                {[
                  { label:'Nome completo *', value:regNome, set:setRegNome, type:'text',     ph:'Ex: Ana Beatriz' },
                  { label:'E-mail *',         value:regEmail, set:setRegEmail, type:'email',  ph:'ana@flowai.com' },
                  { label:'Senha *',          value:regSenha, set:setRegSenha, type:'password', ph:'••••••••' },
                  { label:'Cargo',            value:regCargo, set:setRegCargo, type:'text',   ph:'Ex: Designer Pleno' },
                ].map(({ label, value, set, type, ph }) => (
                  <div key={label} style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    <label style={{ fontSize:'0.68rem', color:'#B5B5B5', fontWeight:600 }}>{label}</label>
                    <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
                  </div>
                ))}
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  <label style={{ fontSize:'0.68rem', color:'#B5B5B5', fontWeight:600 }}>Tipo de acesso *</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value as RoleType)} style={{ ...inputStyle, cursor:'pointer' }}>
                    <option value="agencia">Agência (acesso total)</option>
                    <option value="gestor">Gestor de Contas</option>
                    <option value="designer">Designer</option>
                    <option value="colaborador">Colaborador</option>
                  </select>
                </div>
                {regError && <p style={{ fontSize:'0.72rem', color:'#FF5A5A', margin:0 }}><i className="fas fa-circle-exclamation" style={{ marginRight:'6px' }} />{regError}</p>}
                <button onClick={handleRegister} style={{ padding:'11px', borderRadius:'8px', border:'none', backgroundColor:'var(--gold-primary)', color:'#000', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'4px' }}>
                  <i className="fas fa-check" />Criar Usuário
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CLIENT TAB ── */}
        {activeTab === 'client' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ padding:'12px 16px', backgroundColor:'rgba(58,134,255,0.05)', border:'1px solid rgba(58,134,255,0.15)', borderRadius:'8px', fontSize:'0.75rem', color:'#B5B5B5' }}>
              <i className="fas fa-info-circle" style={{ color:'var(--gold-primary)', marginRight:'8px' }} />
              Use o <strong style={{ color:'#fff' }}>e-mail e senha</strong> fornecidos pela agência para acessar o portal de aprovações e calendário da sua empresa.
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.72rem', color:'#B5B5B5', fontWeight:600 }}>E-mail de acesso:</label>
              <input
                type="email" value={clientEmail} onChange={e => { setClientEmail(e.target.value); setClientError(''); }}
                className="input-premium" placeholder="seu@email.com"
                style={{ width:'100%', padding:'10px 14px', borderRadius:'8px' }}
              />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.72rem', color:'#B5B5B5', fontWeight:600 }}>Senha:</label>
              <input
                type="password" value={clientPassword} onChange={e => { setClientPassword(e.target.value); setClientError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleClientLogin()}
                className="input-premium" placeholder="••••••••"
                style={{ width:'100%', padding:'10px 14px', borderRadius:'8px' }}
              />
            </div>

            {clientError && (
              <p style={{ fontSize:'0.75rem', color:'#FF5A5A', margin:0, display:'flex', alignItems:'center', gap:'6px' }}>
                <i className="fas fa-circle-exclamation" />{clientError}
              </p>
            )}

            <button onClick={handleClientLogin} style={{
              width:'100%', padding:'13px', fontSize:'0.88rem', fontWeight:700,
              borderRadius:'8px', border:'none', backgroundColor:'var(--gold-primary)', color:'#000',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              textTransform:'uppercase', letterSpacing:'0.05em', boxShadow:'var(--shadow-gold-hover)',
            }}>
              Entrar como Cliente
              <i className="fas fa-arrow-right-long" />
            </button>
          </div>
        )}

        {/* Reset */}
        <div style={{ textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'16px' }}>
          <button
            onClick={() => { if (window.confirm('Resetar banco de dados para o estado inicial?')) { resetDatabase(); window.location.reload(); } }}
            style={{ background:'none', border:'none', color:'#555', fontSize:'0.68rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px', transition:'color 0.2s ease' }}
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
