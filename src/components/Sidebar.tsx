import React from 'react';
import { useData } from '../context/DataContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { currentUsuario, contatos, setIsLoggedIn, updateUsuario, updateContato, regenerarToken } = useData();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Executivo', icon: 'fa-chart-line' },
    { id: 'kanban', label: 'Fluxo de Trabalho Inteligente', icon: 'fa-chalkboard-teacher' },
    { id: 'planner', label: 'Planejamento de Campanhas', icon: 'fa-calendar-plus' },
    { id: 'crm', label: 'CRM & Contatos', icon: 'fa-users' },
    { id: 'whatsapp', label: 'Central Conversas & IA', icon: 'fa-comments' },
    { id: 'calendar', label: 'Calendário de Marketing', icon: 'fa-calendar-alt' },
    { id: 'approval', label: 'Portal de Aprovação', icon: 'fa-check-double' },
    { id: 'ai-tools', label: 'IA de Marketing', icon: 'fa-brain' },
    { id: 'reports', label: 'Relatórios & SLA', icon: 'fa-file-invoice-dollar' },
    { id: 'admin', label: 'Painel Administrativo', icon: 'fa-sliders', adminOnly: true },
  ];

  // CLIENT ACCESS CONTROL: Filter tabs based on contact's permissions checklist in the CRM
  const isClient = currentUsuario.role === 'cliente' || currentUsuario.role === 'colaborador';
  
  // Find contact permission details by matching the contact's email or ID
  const contactInfo = contatos.find(c => c.email === currentUsuario.email || c.id === currentUsuario.id);
  const activeAcessos = contactInfo?.acessos || [];

  const visibleMenuItems = isClient 
    ? menuItems.filter(item => {
        if (item.id === 'calendar') return true;
        if (item.id === 'approval') return true;
        if (item.id === 'planner') return true;
        if (item.id === 'kanban') return activeAcessos.includes('Fluxo de Trabalho Inteligente');
        if (item.id === 'whatsapp') return activeAcessos.includes('Central de WhatsApp');
        if (item.id === 'reports') return activeAcessos.includes('Relatórios & Metas SLA');
        return false;
      })
    : menuItems.filter(item => {
        if ((item as any).adminOnly) return currentUsuario.role === 'agencia';
        return true;
      });

  return (
    <aside className="app-sidebar" style={{
      width: '280px',
      backgroundColor: '#1E1E1E',
      borderRight: '1px solid #2A2A2A',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '24px 20px',
      flexShrink: 0
    }}>
      {/* Platform Branding */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        paddingLeft: '8px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: 'var(--gold-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-gold)'
        }}>
          <i className="fas fa-bolt" style={{ color: '#000', fontSize: '1.25rem' }}></i>
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
            M.O <span style={{ color: 'var(--gold-primary)' }}>FLOW</span>
          </h2>
          <p style={{ fontSize: '0.58rem', color: '#B5B5B5', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
            FLUXO DE TRABALHO INTELIGENTE
          </p>
        </div>
      </div>

      {/* ACTIVE PROFILE DISPLAY CARD */}
      <div className="sidebar-profile-card" style={{
        backgroundColor: '#2A2A2A',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '28px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div 
          onClick={() => {
            const input = document.getElementById('profile-picture-input');
            if (input) input.click();
          }}
          title="Clique para alterar sua foto de perfil"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--gold-primary)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.2s ease',
            border: '2px solid rgba(255,255,255,0.1)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 10px var(--gold-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {currentUsuario.fotoUrl ? (
            <img 
              src={currentUsuario.fotoUrl} 
              alt="Foto" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            currentUsuario.nome.split(' ').map(n => n[0]).join('')
          )}
          
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.65rem',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <i className="fas fa-camera"></i>
          </div>
        </div>

        <input 
          id="profile-picture-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  if (currentUsuario.clienteId) {
                    const cont = contatos.find(c => c.id === currentUsuario.id);
                    if (cont) {
                      updateContato({ ...cont, fotoUrl: reader.result });
                    }
                  } else {
                    updateUsuario({ ...currentUsuario, fotoUrl: reader.result });
                  }
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#FFF', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {currentUsuario.nome}
          </h4>
          <p style={{ fontSize: '0.65rem', color: '#B5B5B5', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {currentUsuario.cargo}
          </p>
        </div>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: currentUsuario.role === 'agencia' ? 'var(--gold-primary)' : currentUsuario.role === 'gestor' ? '#35D07F' : currentUsuario.role === 'designer' ? '#00c3ff' : '#FFAA00',
          textTransform: 'uppercase',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 4px',
          borderRadius: '3px'
        }}>
          {currentUsuario.role}
        </span>
      </div>

      {/* Token Integration Panel */}
      {!isClient && (
        <div style={{
          backgroundColor: '#2A2A2A',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: '#B5B5B5', fontWeight: 700, letterSpacing: '0.05em' }}>TOKEN DE INTEGRAÇÃO</span>
            <button 
              onClick={async () => {
                if (currentUsuario.clienteId) {
                  await regenerarToken(currentUsuario.id, 'contato');
                } else {
                  await regenerarToken(currentUsuario.id, 'usuario');
                }
              }}
              title="Regerar Token de API"
              style={{ border: 'none', backgroundColor: 'transparent', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '0.68rem', padding: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <i className="fas fa-sync-alt"></i> Atualizar
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1E1E1E', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '0.6rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontFamily: 'monospace' }}>
              {currentUsuario.apiToken || 'Nenhum token ativo'}
            </span>
            <button 
              onClick={() => {
                if (currentUsuario.apiToken) {
                  navigator.clipboard.writeText(currentUsuario.apiToken);
                  alert('Token de API copiado para a área de transferência!');
                } else {
                  alert('Nenhum token disponível para cópia.');
                }
              }}
              title="Copiar Token"
              style={{ border: 'none', backgroundColor: 'transparent', color: '#B5B5B5', cursor: 'pointer', fontSize: '0.72rem', padding: '2px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#B5B5B5'}
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
      )}

      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {visibleMenuItems.map((item) => {
          const isActive = activeView === item.id;
          const isAdmin = item.id === 'admin';
          return (
            <React.Fragment key={item.id}>
              {isAdmin && (
                <div style={{ height: '1px', backgroundColor: '#2A2A2A', margin: '8px 0' }} />
              )}
              <button
                onClick={() => setActiveView(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  backgroundColor: isActive ? (isAdmin ? 'rgba(212,175,55,0.08)' : 'var(--glass-bg)') : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? (isAdmin ? 'rgba(212,175,55,0.3)' : 'var(--glass-border)') : 'transparent',
                  color: isActive ? (isAdmin ? '#D4AF37' : 'var(--gold-primary)') : (isAdmin ? '#D4AF37' : '#B5B5B5'),
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : (isAdmin ? 600 : 500),
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  opacity: isAdmin ? 0.9 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = isAdmin ? '#D4AF37' : '#FFF';
                    e.currentTarget.style.backgroundColor = isAdmin ? 'rgba(212,175,55,0.06)' : '#252525';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = isAdmin ? '#D4AF37' : '#B5B5B5';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={`fas ${item.icon}`} style={{ width: '18px', fontSize: '1rem' }}></i>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* SYSTEM META FOOTER */}
      <div className="sidebar-footer" style={{
        borderTop: '1px solid #2A2A2A',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontSize: '0.7rem',
        color: '#B5B5B5',
        textAlign: 'center'
      }}>
        <button
          onClick={() => {
            setIsLoggedIn(false);
            setActiveView('dashboard');
          }}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 90, 90, 0.08)',
            border: '1px solid rgba(255, 90, 90, 0.2)',
            color: '#FF5A5A',
            padding: '10px 8px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 90, 90, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 90, 90, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 90, 90, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 90, 90, 0.2)';
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          Sair / Fazer Logout
        </button>
        <div>
          <p style={{ margin: 0 }}>M.O FLOW v1.0.0 Pro</p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>LGPD & GDPR Compliant</p>
        </div>
      </div>
    </aside>
  );
};
