import React, { useState } from 'react';
import assistantGuide from './assistant_guide.json';

interface Passo {
  modulo: string;
  titulo: string;
  icon: string;
  roles: string[];
  instrucoes: string[];
}

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
  onNavigate: (module: string) => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  onNavigate,
}) => {
  /* 
    💡 EXPLICAÇÃO DA ARQUITETURA DO GUIA DO SISTEMA BASEADO EM METADADOS (JSON):
    
    Este painel de ajuda / onboarding foi projetado para ser 100% dinâmico, aplicando
    o conceito de "Configuração Orientada a Dados" (Data-Driven Configuration).
    
    COMO FUNCIONA E COMO REPROVEITAR EM PROJETOS FUTUROS:
    1. Estrutura Declarativa (assistant_guide.json): Todas as descrições de fluxo, 
       títulos, ícones e papéis permitidos (roles) estão isolados em um arquivo JSON de metadados.
       Desta forma, atualizar ou adicionar guias de ajuda não exige alterações na lógica ou
       novas compilações de código React.
       
    2. Filtro Baseado em Roles (Role-Based Filtering): 
       `assistantGuide.passos.filter(...)` filtra os guias em tempo de execução de acordo
       com o perfil (role) do usuário ativo recebido por propriedade (`currentUserRole`). 
       Assim, garantimos segurança e relevância (clientes veem apenas guias específicos, 
       designers veem guias de produção, etc.).
       
    3. Navegação Reativa e Integrada:
       O identificador do guia (`modulo`) mapeia 1:1 os identificadores de abas ou rotas do sistema.
       Ao clicar no botão "Acessar Módulo", disparamos o callback `onNavigate` para que a aplicação pai
       redirecione o usuário e fechamos o drawer com o `onClose()`, proporcionando um onboarding fluido.
  */
  const filteredSteps = (assistantGuide.passos as Passo[]).filter(
    (p) => p.roles?.includes(currentUserRole)
  );

  const [activeTab, setActiveTab] = useState<string>(
    filteredSteps[0]?.modulo || 'dashboard'
  );

  if (!isOpen) return null;

  const currentStep = filteredSteps.find((s) => s.modulo === activeTab);

  // Styles defined for ease of export and reuse in vanilla JS/CSS or styled systems
  const drawerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '420px',
    backgroundColor: '#161616',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c1c1c'
  };

  const tabGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
    padding: '12px 20px',
    backgroundColor: '#1c1c1c',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const stepCardStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    backgroundColor: '#202020',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.02)'
  };

  const stepNumberStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(58, 134, 255, 0.15)',
    color: '#3a86ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '2px'
  };

  const actionButtonStyle: React.CSSProperties = {
    marginTop: 'auto',
    width: '100%',
    backgroundColor: '#3a86ff',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease'
  };

  return (
    <>
      {/* Keyframes injecter for clean slider animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />

      <div style={drawerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#3a86ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(58, 134, 255, 0.3)'
            }}>
              <i className="fas fa-robot" style={{ color: '#fff', fontSize: '1rem' }}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Guia e Ajuda {assistantGuide.nome_sistema}</h3>
              <span style={{ fontSize: '0.62rem', color: '#B5B5B5' }}>Conheça todos os recursos da plataforma</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#B5B5B5', fontSize: '1.1rem', cursor: 'pointer', outline: 'none' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Description Banner */}
        <div style={{ padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <p style={{ fontSize: '0.72rem', color: '#B5B5B5', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
            {assistantGuide.descricao} Selecione um módulo abaixo para aprender a usar cada recurso.
          </p>
        </div>

        {/* Module Tabs Grid Selector */}
        <div style={tabGridStyle}>
          {filteredSteps.map((step) => {
            const isActive = activeTab === step.modulo;
            return (
              <button
                key={step.modulo}
                onClick={() => setActiveTab(step.modulo)}
                style={{
                  backgroundColor: isActive ? 'rgba(58, 134, 255, 0.15)' : '#222222',
                  border: isActive ? '1px solid #3a86ff' : '1px solid rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#3a86ff' : '#B5B5B5',
                  padding: '8px 4px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  outline: 'none'
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

        {/* Content Pane showing active module instructions */}
        <div style={contentStyle}>
          {currentStep ? (
            <>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <i className={`fas ${currentStep.icon}`} style={{ color: '#3a86ff' }}></i>
                {currentStep.titulo}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentStep.instrucoes.map((ins, index) => (
                  <div key={index} style={stepCardStyle}>
                    <div style={stepNumberStyle}>
                      {index + 1}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#E0E0E0', margin: 0, lineHeight: '1.4' }}>
                      {ins}
                    </p>
                  </div>
                ))}
              </div>

              {/* Navigation CTA button */}
              <button
                onClick={() => {
                  onNavigate(currentStep.modulo);
                  onClose();
                }}
                style={actionButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a75e6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3a86ff'}
              >
                <i className="fas fa-arrow-right-to-bracket"></i>
                Acessar Módulo: {currentStep.titulo}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666', fontSize: '0.8rem' }}>
              Nenhum módulo selecionado.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
