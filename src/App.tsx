import { useState, useEffect } from 'react';
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
  const { currentUsuario, resetDatabase, activeView, setActiveView, isLoggedIn } = useData();
  const [showAssistant, setShowAssistant] = useState(false);
  const [activeAssistantTab, setActiveAssistantTab] = useState('dashboard');

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
      {/* Dynamic Navigation Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Workspace Frame */}
      <main className="main-content">
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
