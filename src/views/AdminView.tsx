import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { RoleType } from '../types';

const roleLabel: Record<RoleType, string> = {
  superadmin: 'Super Admin', agencia: 'Agência (Admin)', gestor: 'Gestor de Contas',
  designer: 'Designer', cliente: 'Cliente', colaborador: 'Colaborador',
};
const roleColor: Record<RoleType, { bg: string; text: string }> = {
  superadmin: { bg: 'rgba(255,90,90,0.15)', text: '#FF5A5A' },
  agencia:    { bg: 'rgba(212,175,55,0.15)', text: '#D4AF37' },
  gestor:     { bg: 'rgba(53,208,127,0.15)', text: '#35D07F' },
  designer:   { bg: 'rgba(0,195,255,0.15)', text: '#00C3FF' },
  cliente:    { bg: 'rgba(58,134,255,0.15)', text: '#3A86FF' },
  colaborador:{ bg: 'rgba(180,180,180,0.15)', text: '#B4B4B4' },
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  backgroundColor: '#252525', border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
};

export const AdminView: React.FC = () => {
  const { usuarios, currentUsuario, addUsuario, updateUsuario } = useData();

  const agencyUsers = usuarios.filter(u => ['agencia', 'gestor', 'designer', 'colaborador', 'superadmin'].includes(u.role));

  // ── Tab ─────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<'users' | 'permissions'>('users');

  // ── New User form ────────────────────────────────────────────────────────
  const [showForm, setShowForm]   = useState(false);
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [cargo, setCargo]         = useState('');
  const [role, setRole]           = useState<RoleType>('gestor');
  const [formError, setFormError] = useState('');

  // ── Edit User ────────────────────────────────────────────────────────────
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [editNome, setEditNome]           = useState('');
  const [editEmail, setEditEmail]         = useState('');
  const [editSenha, setEditSenha]         = useState('');
  const [editCargo, setEditCargo]         = useState('');
  const [editRole, setEditRole]           = useState<RoleType>('gestor');
  const [editError, setEditError]         = useState('');

  const isMaster = currentUsuario.role === 'agencia' || currentUsuario.id === 'master1';

  const handleCreate = () => {
    setFormError('');
    if (!nome.trim() || !email.trim() || !senha.trim()) { setFormError('Nome, e-mail e senha são obrigatórios.'); return; }
    if (usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) { setFormError('Este e-mail já está cadastrado.'); return; }
    addUsuario({
      id: 'u_' + Date.now(), nome: nome.trim(), email: email.trim().toLowerCase(),
      telefone: '', whatsapp: '', cargo: cargo.trim(), role, agenciaId: 'ag1', password: senha,
    });
    setNome(''); setEmail(''); setSenha(''); setCargo(''); setRole('gestor');
    setShowForm(false);
  };

  const handleEdit = (userId: string) => {
    const u = usuarios.find(u => u.id === userId);
    if (!u) return;
    setEditingId(userId);
    setEditNome(u.nome);
    setEditEmail(u.email);
    setEditSenha('');
    setEditCargo(u.cargo || '');
    setEditRole(u.role);
    setEditError('');
  };

  const handleSaveEdit = () => {
    setEditError('');
    if (!editNome.trim() || !editEmail.trim()) { setEditError('Nome e e-mail são obrigatórios.'); return; }
    const u = usuarios.find(u => u.id === editingId);
    if (!u) return;
    updateUsuario({
      ...u,
      nome: editNome.trim(),
      email: editEmail.trim().toLowerCase(),
      cargo: editCargo.trim(),
      role: editRole,
      ...(editSenha ? { password: editSenha } : {}),
    });
    setEditingId(null);
  };

  const sections = [
    { id: 'users', label: 'Usuários do Sistema', icon: 'fa-users-cog' },
    { id: 'permissions', label: 'Papéis & Permissões', icon: 'fa-shield-halved' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>
            <i className="fas fa-sliders" style={{ color: 'var(--gold-primary)', marginRight: '14px' }} />
            Painel Administrativo
          </h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Gerencie usuários da agência, permissões de acesso e configurações do sistema.
          </p>
        </div>
        {isMaster && activeSection === 'users' && (
          <button className="btn-gold" onClick={() => { setShowForm(v => !v); setFormError(''); }}>
            <i className={`fas ${showForm ? 'fa-times' : 'fa-user-plus'}`} style={{ marginRight: '8px' }} />
            {showForm ? 'Cancelar' : 'Novo Usuário'}
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #2A2A2A', paddingBottom: '0' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '10px 18px', fontSize: '0.82rem', fontWeight: 600,
              color: activeSection === s.id ? 'var(--gold-primary)' : '#B5B5B5',
              backgroundColor: 'transparent', border: 'none',
              borderBottom: activeSection === s.id ? '2px solid var(--gold-primary)' : '2px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s ease', marginBottom: '-1px',
            }}
          >
            <i className={`fas ${s.icon}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── USERS SECTION ── */}
      {activeSection === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* New user form */}
          {showForm && (
            <div style={{
              backgroundColor: '#1A1A1A', border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                <i className="fas fa-user-plus" style={{ marginRight: '10px' }} />Cadastrar Novo Usuário da Agência
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Nome Completo *', value: nome, set: setNome, type: 'text', ph: 'Ex: Ana Beatriz' },
                  { label: 'E-mail *',         value: email, set: setEmail, type: 'email', ph: 'ana@agencia.com' },
                  { label: 'Senha *',          value: senha, set: setSenha, type: 'password', ph: '••••••••' },
                  { label: 'Cargo',            value: cargo, set: setCargo, type: 'text', ph: 'Ex: Designer Sênior' },
                ].map(({ label, value, set, type, ph }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.72rem', color: '#B5B5B5', fontWeight: 600 }}>{label}</label>
                    <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.72rem', color: '#B5B5B5', fontWeight: 600 }}>Nível de Acesso *</label>
                <select value={role} onChange={e => setRole(e.target.value as RoleType)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="agencia">Agência — Acesso total ao sistema</option>
                  <option value="gestor">Gestor de Contas — Acesso operacional completo</option>
                  <option value="designer">Designer — Foco em demandas e produção</option>
                  <option value="colaborador">Colaborador — Acesso limitado</option>
                </select>
              </div>
              {formError && (
                <p style={{ fontSize: '0.75rem', color: '#FF5A5A', margin: 0 }}>
                  <i className="fas fa-circle-exclamation" style={{ marginRight: '6px' }} />{formError}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-gold" onClick={handleCreate}>
                  <i className="fas fa-check" style={{ marginRight: '8px' }} />Criar Usuário
                </button>
              </div>
            </div>
          )}

          {/* Users list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {agencyUsers.length === 0 ? (
              <div style={{ color: '#555', textAlign: 'center', padding: '60px 0', fontSize: '0.9rem' }}>
                <i className="fas fa-users-slash" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block', color: '#333' }} />
                Nenhum usuário cadastrado além do master.
              </div>
            ) : (
              agencyUsers.map(u => {
                const rc = roleColor[u.role] || roleColor.colaborador;
                const isEditing = editingId === u.id;
                const isSelf = u.id === currentUsuario.id;
                return (
                  <div key={u.id} className="card-premium" style={{ padding: '18px 20px', transform: 'none' }}>
                    {isEditing ? (
                      /* Edit mode */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                          <i className="fas fa-user-pen" style={{ marginRight: '8px' }} />Editar: {u.nome}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {[
                            { label: 'Nome *', value: editNome, set: setEditNome, type: 'text' },
                            { label: 'E-mail *', value: editEmail, set: setEditEmail, type: 'email' },
                            { label: 'Nova Senha (opcional)', value: editSenha, set: setEditSenha, type: 'password' },
                            { label: 'Cargo', value: editCargo, set: setEditCargo, type: 'text' },
                          ].map(({ label, value, set, type }) => (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.68rem', color: '#B5B5B5', fontWeight: 600 }}>{label}</label>
                              <input type={type} value={value} onChange={e => set(e.target.value)} style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.8rem' }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.68rem', color: '#B5B5B5', fontWeight: 600 }}>Nível de Acesso</label>
                          <select value={editRole} onChange={e => setEditRole(e.target.value as RoleType)} style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <option value="agencia">Agência — Acesso total</option>
                            <option value="gestor">Gestor de Contas</option>
                            <option value="designer">Designer</option>
                            <option value="colaborador">Colaborador</option>
                          </select>
                        </div>
                        {editError && <p style={{ fontSize: '0.72rem', color: '#FF5A5A', margin: 0 }}><i className="fas fa-circle-exclamation" style={{ marginRight: '6px' }} />{editError}</p>}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => setEditingId(null)}>Cancelar</button>
                          <button className="btn-gold" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={handleSaveEdit}>
                            <i className="fas fa-save" style={{ marginRight: '6px' }} />Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: rc.bg, color: rc.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '1rem', border: `1px solid ${rc.text}30`,
                        }}>
                          {u.fotoUrl
                            ? <img src={u.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : u.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.95rem', color: '#fff', margin: 0, fontWeight: 700 }}>{u.nome}</h4>
                            {isSelf && <span style={{ fontSize: '0.6rem', color: '#35D07F', backgroundColor: 'rgba(53,208,127,0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>VOCÊ</span>}
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: rc.text, backgroundColor: rc.bg, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {roleLabel[u.role]}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#B5B5B5', margin: '4px 0 0 0' }}>
                            {u.cargo && <><i className="fas fa-briefcase" style={{ marginRight: '5px' }} />{u.cargo} &nbsp;</>}
                            <i className="fas fa-envelope" style={{ marginRight: '5px' }} />{u.email}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.65rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fas fa-lock" />
                            {(u as any).password ? '••••••••' : 'sem senha'}
                          </span>
                          {isMaster && (
                            <button
                              onClick={() => handleEdit(u.id)}
                              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--gold-primary)', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.08)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <i className="fas fa-pen" />Editar
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── PERMISSIONS SECTION ── */}
      {activeSection === 'permissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#B5B5B5', fontSize: '0.85rem', margin: 0 }}>
            Referência de permissões por nível de acesso. As senhas e logins são configurados individualmente por usuário.
          </p>

          {([
            {
              role: 'agencia' as RoleType, desc: 'Acesso total ao sistema',
              perms: ['Dashboard executivo', 'Kanban completo', 'CRM & Contatos', 'Central de WhatsApp', 'Calendário', 'Portal de Aprovações', 'IA de Marketing', 'Relatórios & SLA', 'Painel Administrativo'],
            },
            {
              role: 'gestor' as RoleType, desc: 'Gestão operacional de clientes e demandas',
              perms: ['Dashboard executivo', 'Kanban completo', 'CRM & Contatos', 'Central de WhatsApp', 'Calendário', 'Portal de Aprovações', 'IA de Marketing', 'Relatórios & SLA'],
            },
            {
              role: 'designer' as RoleType, desc: 'Foco em produção e aprovações criativas',
              perms: ['Dashboard executivo', 'Kanban (suas demandas)', 'Calendário', 'Portal de Aprovações', 'IA de Marketing'],
            },
            {
              role: 'colaborador' as RoleType, desc: 'Acesso restrito a módulos específicos',
              perms: ['Dashboard (limitado)', 'Kanban (visualização)', 'Calendário'],
            },
            {
              role: 'cliente' as RoleType, desc: 'Portal exclusivo do cliente — configurado por contato',
              perms: ['Portal de Aprovações da empresa', 'Calendário de Marketing da empresa', 'Deixar observações nas demandas'],
            },
          ]).map(({ role, desc, perms }) => {
            const rc = roleColor[role];
            return (
              <div key={role} className="card-premium" style={{ padding: '20px', transform: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rc.text, backgroundColor: rc.bg, padding: '4px 12px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {roleLabel[role]}
                  </span>
                  <p style={{ fontSize: '0.78rem', color: '#B5B5B5', margin: 0 }}>{desc}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
                  {perms.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#E0E0E0' }}>
                      <i className="fas fa-check-circle" style={{ color: rc.text, fontSize: '0.8rem' }} />{p}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
