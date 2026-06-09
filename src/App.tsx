import { useState, useEffect, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './views/DashboardView';
import { KanbanView } from './views/KanbanView';
import { CRMView } from './views/CRMView';
import { ConversationsView } from './views/ConversationsView';
import { CalendarView } from './views/CalendarView';
import { ApprovalPortalView } from './views/ApprovalPortalView';
import { AIToolsView } from './views/AIToolsView';
import { ReportsView } from './views/ReportsView';
import { AdminView } from './views/AdminView';
import { PlannerView } from './views/PlannerView';
import assistantGuide from './data/assistant_guide.json';

function AppContent() {
  const { 
    currentUsuario, 
    resetDatabase, 
    activeView, 
    setActiveView, 
    isLoggedIn, 
    historicos, 
    demandas, 
    setSelectedApprovalDemandId 
  } = useData();
  const [showAssistant, setShowAssistant] = useState(false);
  const [activeAssistantTab, setActiveAssistantTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [lidasIds, setLidasIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mf_lidas_notificacoes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeToast, setActiveToast] = useState<{ id: string; mensagem: string; tipo: string } | null>(null);

  // Trigger Toast Notification on new events
  const prevHistoricosLength = useRef(historicos?.length || 0);
  useEffect(() => {
    if (historicos && historicos.length > prevHistoricosLength.current) {
      const latest = historicos[0];
      if (latest && latest.usuarioNome !== currentUsuario.nome) {
        setActiveToast({
          id: latest.id,
          mensagem: `${latest.usuarioNome}: ${latest.acao}`,
          tipo: latest.tipo
        });
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 4500);
        return () => clearTimeout(timer);
      }
    }
    prevHistoricosLength.current = historicos?.length || 0;
  }, [historicos, currentUsuario.nome]);

  const notificationsList = (historicos || []).filter(h => 
    (h.tipo === 'comentario' || h.tipo === 'aprovacao') && 
    h.usuarioNome !== currentUsuario.nome
  );
  const unreadNotifs = notificationsList.filter(n => !lidasIds.includes(n.id));
  const unreadCount = unreadNotifs.length;

  const handleNotifClick = (n: any) => {
    if (!lidasIds.includes(n.id)) {
      const nextLidas = [...lidasIds, n.id];
      setLidasIds(nextLidas);
      localStorage.setItem('mf_lidas_notificacoes', JSON.stringify(nextLidas));
    }
    setShowNotifications(false);
    
    const demand = demandas.find(d => d.id === n.demandaId);
    if (!demand) return;
    
    setSelectedApprovalDemandId(demand.id);
    if (currentUsuario.role === 'cliente' || currentUsuario.role === 'colaborador') {
      setActiveView('approval');
    } else {
      setActiveView('kanban');
    }
  };

  const markAllAsRead = () => {
    const allIds = notificationsList.map(n => n.id);
    setLidasIds(allIds);
    localStorage.setItem('mf_lidas_notificacoes', JSON.stringify(allIds));
  };

  // DYNAMIC DESIGN ACCENT SHIFT: If user role is Designer, switch primary CSS color variables to Blue
  useEffect(() => {
    const root = document.documentElement;
    const isDesigner = currentUsuario.role === 'designer';
    
    if (isDesigner) {
      // High-fidelity bright blue accent theme for the Designer
      root.style.setProperty('--gold-primary', '#00c3ff');
      root.style.setProperty('--gold-hover', '#00a2d3');
      root.style.setProperty('--glass-border', 'rgba(0, 195, 255, 0.15)');
      root.style.setProperty('--glass-border-hover', 'rgba(0, 195, 255, 0.35)');
      root.style.setProperty('--shadow-gold', '0 0 20px rgba(0, 195, 255, 0.15)');
      root.style.setProperty('--shadow-gold-hover', '0 0 30px rgba(0, 195, 255, 0.35)');
    } else {
      // Premium Royal Blue accent theme for other roles
      root.style.setProperty('--gold-primary', '#3a86ff');
      root.style.setProperty('--gold-hover', '#52b7ff');
      root.style.setProperty('--glass-border', 'rgba(58, 134, 255, 0.15)');
      root.style.setProperty('--glass-border-hover', 'rgba(58, 134, 255, 0.35)');
      root.style.setProperty('--shadow-gold', '0 0 20px rgba(58, 134, 255, 0.15)');
      root.style.setProperty('--shadow-gold-hover', '0 0 30px rgba(58, 134, 255, 0.35)');
    }
  }, [currentUsuario.role]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'kanban':
        return <KanbanView />;
      case 'crm':
        return <CRMView />;
      case 'whatsapp':
        return <ConversationsView />;
      case 'calendar':
        return <CalendarView />;
      case 'planner':
        return <PlannerView />;
      case 'approval':
        return <ApprovalPortalView />;
      case 'ai-tools':
        return <AIToolsView />;
      case 'reports':
        return <ReportsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {activeToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${activeToast.tipo === 'aprovacao' ? '#25D366' : '#3a86ff'}`,
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(58, 134, 255, 0.1)',
          padding: '12px 20px',
          zIndex: 10002,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: 600,
          animation: 'slideDown 0.3s ease forwards'
        }}>
          <i className={`fas ${activeToast.tipo === 'aprovacao' ? 'fa-check-double' : 'fa-comment'}`} style={{ color: activeToast.tipo === 'aprovacao' ? '#25D366' : '#3a86ff' }}></i>
          <span>{activeToast.mensagem}</span>
          <button 
            onClick={() => setActiveToast(null)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', marginLeft: '10px' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Dynamic Navigation Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Workspace Frame */}
      <main className="main-content">
        {/* Floating Notification Center Bell Widget */}
        <div className="floating-notifications" style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 1000 }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1E1E1E',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#FF5A5A',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px rgba(255, 90, 90, 0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              backgroundColor: '#1E1E1E',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>Alertas do Portal</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    Marcar lidas
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {unreadNotifs.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#666', fontSize: '0.75rem' }}>
                    Nenhum alerta pendente no portal.
                  </div>
                ) : (
                  unreadNotifs.map(n => {
                    const iconClass = n.tipo === 'aprovacao' ? 'fa-check-double' : 'fa-comment';
                    const iconColor = n.tipo === 'aprovacao' ? '#25D366' : '#3a86ff';
                    return (
                      <div 
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <i className={`fas ${iconClass}`} style={{ color: iconColor, fontSize: '0.85rem', marginTop: '3px', flexShrink: 0 }}></i>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.72rem', color: '#fff', lineHeight: '1.3' }}>
                            <strong>{n.usuarioNome}</strong>: {n.acao}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: '#666' }}>
                            {new Date(n.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* CSS Animation Keyframes for Toast slider */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideDown {
            from { transform: translate(-50%, -40px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        ` }} />

        {renderView()}

        {/* Global Floating Simulator Utility Button */}
        <button 
          onClick={() => {
            if (window.confirm('Deseja realmente resetar o banco de dados simulado para o estado inicial? Isso limpará todas as suas interações de teste.')) {
              resetDatabase();
              window.location.reload();
            }
          }}
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            backgroundColor: '#2A2A2A',
            border: '1px solid #333',
            color: '#B5B5B5',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FF5A5A'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#B5B5B5'}
        >
          <i className="fas fa-trash-can" style={{ marginRight: '6px' }}></i>
          Limpar Simulação
        </button>

        {/* Global Floating Virtual Assistant Onboarding Button */}
        <button 
          onClick={() => setShowAssistant(!showAssistant)}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            backgroundColor: 'rgba(37, 211, 102, 0.15)',
            border: '1px solid #25D366',
            color: '#25D366',
            padding: '10px 18px',
            borderRadius: '24px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 9998,
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.25)';
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <i className="fas fa-robot" style={{ fontSize: '1rem' }}></i>
          🤖 Guia do Sistema
        </button>

        {/* Onboarding Virtual Assistant Drawer */}
        {showAssistant && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            bottom: '80px',
            width: '420px',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(58, 134, 255, 0.15)',
            zIndex: 9997,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              backgroundColor: '#1A1A1A',
              borderBottom: '1px solid #2A2A2A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-primary)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', fontWeight: 800 }}>Guia e Ajuda M.O FLOW</h3>
                  <span style={{ fontSize: '0.62rem', color: '#B5B5B5' }}>Conheça todos os recursos da plataforma</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAssistant(false)}
                style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* 
              💡 EXPLICAÇÃO DA ARQUITETURA DO GUIA DO SISTEMA BASEADO EM METADADOS (JSON):
              
              Este painel de ajuda / onboarding foi projetado para ser 100% dinâmico, aplicando
              o conceito de "Configuração Orientada a Dados" (Data-Driven Configuration).
              
              COMO FUNCIONA E COMO REPROVEITAR EM PROJETOS FUTUROS:
              1. Estrutura Declarativa (assistant_guide.json): Todas as descrições de fluxo, 
                 títulos, ícones e papéis permitidos (roles) estão isolados em um arquivo JSON de metadados.
                 Dessa forma, atualizar ou adicionar guias de ajuda não exige alterações na lógica ou
                 novas compilações de código React.
                 
              2. Filtro Baseado em Roles (Role-Based Filtering): 
                 `assistantGuide.passos.filter(...)` filtra os guias em tempo de execução de acordo
                 com o perfil do usuário ativo. Assim, garantimos segurança e relevância (clientes veem
                 apenas guias específicos do portal, designers veem guias de produção, etc.).
                 
              3. Navegação Reativa e Integrada:
                 O identificador do guia (`modulo`) mapeia 1:1 os identificadores das abas da plataforma.
                 Ao clicar no botão "Acessar Módulo", alteramos o estado global `activeView` para redirecionar 
                 o usuário e fechar o guia (`setShowAssistant(false)`), oferecendo um onboarding ativo e prático.
            */}
            {(() => {
              const filteredPassos = assistantGuide.passos.filter(p => p.roles?.includes(currentUsuario.role));
              const currentStep = filteredPassos.find(s => s.modulo === activeAssistantTab);
              return (
                <>
                  <div style={{ padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <p style={{ fontSize: '0.72rem', color: '#B5B5B5', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                      {assistantGuide.descricao} Selecione um módulo abaixo para aprender a usar cada recurso.
                    </p>
                  </div>

                  {/* Modules Horizontal Tab Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    padding: '12px 20px',
                    backgroundColor: '#1E1E1E',
                    borderBottom: '1px solid #2A2A2A'
                  }}>
                    {filteredPassos.map((step) => {
                      const isActive = activeAssistantTab === step.modulo;
                      return (
                        <button
                          key={step.modulo}
                          onClick={() => setActiveAssistantTab(step.modulo)}
                          style={{
                            backgroundColor: isActive ? 'rgba(58, 134, 255, 0.1)' : '#252525',
                            border: isActive ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.03)',
                            color: isActive ? 'var(--gold-primary)' : '#B5B5B5',
                            padding: '8px 4px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          <i className={`fas ${step.icon}`} style={{ fontSize: '0.85rem' }}></i>
                          <span style={{ fontSize: '0.55rem', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
                            {step.titulo.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Content pane */}
                  <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {currentStep ? (
                      <>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #2A2A2A', paddingBottom: '10px' }}>
                          <i className={`fas ${currentStep.icon}`} style={{ color: 'var(--gold-primary)' }}></i>
                          {currentStep.titulo}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {currentStep.instrucoes.map((ins, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'flex-start',
                              backgroundColor: '#252525',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.02)'
                            }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(58, 134, 255, 0.1)',
                                color: 'var(--gold-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                marginTop: '2px'
                              }}>
                                {index + 1}
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#E0E0E0', margin: 0, lineHeight: '1.4' }}>
                                {ins}
                              </p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setActiveView(currentStep.modulo);
                            setShowAssistant(false);
                          }}
                          style={{
                            marginTop: 'auto',
                            width: '100%',
                            backgroundColor: 'var(--gold-primary)',
                            color: '#000',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                        >
                          <i className="fas fa-arrow-right-to-bracket"></i>
                          Acessar Módulo: {currentStep.titulo}
                        </button>
                      </>
                    ) : null}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
