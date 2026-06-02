import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';

export const ConversationsView: React.FC = () => {
  const { 
    mensagensWhatsapp, clientes, demandas, 
    enviarMensagemWhatsApp, aiLogs, simularPrazoVencido, currentUsuario 
  } = useData();

  // Selected chat client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    currentUsuario.clienteId || clientes[0]?.id || ''
  );

  useEffect(() => {
    if (currentUsuario.clienteId) {
      setSelectedClientId(currentUsuario.clienteId);
    }
  }, [currentUsuario.clienteId]);
  
  // Custom message input text (Agency sending)
  const [typedMessage, setTypedMessage] = useState('');
  
  // Custom message input text (Simulating client incoming)
  const [simulatedClientMsg, setSimulatedClientMsg] = useState('');

  // Loading state for AI responses
  const [aiThinking, setAiThinking] = useState(false);

  // Auto-scroll messages anchor
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagensWhatsapp, aiThinking]);

  const activeClient = clientes.find(c => c.id === selectedClientId);
  const activeDemanda = demandas.find(d => d.clienteId === selectedClientId && d.status !== 'Concluído');
  
  // Filter messages for current selected client
  const currentMessages = mensagensWhatsapp.filter(m => m.clienteId === selectedClientId);

  const handleSendAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage) return;

    const direction = currentUsuario.clienteId ? 'entrada' : 'saida';
    enviarMensagemWhatsApp(selectedClientId, typedMessage, direction);
    setTypedMessage('');

    if (currentUsuario.clienteId) {
      setAiThinking(true);
      setTimeout(() => {
        setAiThinking(false);
      }, 1200);
    }
  };

  const handleSimulateClient = (text: string) => {
    if (!text) return;
    
    // Put thinking state
    setAiThinking(true);
    enviarMensagemWhatsApp(selectedClientId, text, 'entrada');
    setSimulatedClientMsg('');

    setTimeout(() => {
      setAiThinking(false);
    }, 1200);
  };

  const handleTriggerPrazoVencido = () => {
    if (activeDemanda) {
      simularPrazoVencido(activeDemanda.id);
      alert(`Automação executada! O prazo da demanda "${activeDemanda.titulo}" foi vencido. Disparado alerta automático no WhatsApp e escalonamento interno.`);
    } else {
      alert('Não há demanda ativa pendente para este cliente no momento.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      
      {/* Title Banner */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Central de Conversas & Assistente de IA</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Integração nativa de WhatsApp. Assista à IA interpretando retornos dos clientes e executando automações na hora!
          </p>
        </div>
      </div>

      {/* Main Workspace Grid: WhatsApp Web Layout vs AI Monitor Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.3fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: THE WHATSAPP WEB CLIENT */}
        <div className="whatsapp-workspace">
          
          {/* Chat List Sidebar */}
          {!currentUsuario.clienteId && (
            <div className="whatsapp-sidebar">
              <div className="whatsapp-search">
                <input type="text" placeholder="Procurar contatos..." className="whatsapp-input-search" />
              </div>

              <div className="whatsapp-chat-list">
                {clientes.map(cli => {
                  const isActive = cli.id === selectedClientId;
                  const lastMsg = mensagensWhatsapp.filter(m => m.clienteId === cli.id).slice(-1)[0];
                  
                  return (
                    <div 
                      key={cli.id} 
                      className={`whatsapp-chat-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedClientId(cli.id)}
                    >
                      <div className="whatsapp-chat-avatar">
                        {cli.nomeFantasia.charAt(0)}
                      </div>
                      <div className="whatsapp-chat-info">
                        <div className="whatsapp-chat-name">
                          <span>{cli.nomeFantasia}</span>
                          {lastMsg && (
                            <span className="whatsapp-chat-time">
                              {new Date(lastMsg.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="whatsapp-chat-lastmsg">
                          {lastMsg ? lastMsg.conteudo : 'Nenhuma mensagem recente'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messaging Box */}
          <div className="whatsapp-chat-area">
            
            {/* Header info bar displaying related active demands */}
            <div className="whatsapp-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="whatsapp-chat-avatar" style={{ width: '40px', height: '40px' }}>
                  {activeClient?.nomeFantasia.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>{activeClient?.nomeFantasia}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#35D07F' }}>WhatsApp Online</span>
                </div>
              </div>

              {/* Related Demand info panel */}
              {activeDemanda && (
                <div style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>Demanda Relacionada:</span>
                  <span>{activeDemanda.titulo}</span>
                  <span className="badge-custom badge-media" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                    {activeDemanda.status}
                  </span>
                </div>
              )}
            </div>

            {/* Message History Feed */}
            <div className="whatsapp-messages-box">
              {currentMessages.map(msg => {
                const isOut = msg.direcao === 'saida';
                return (
                  <div 
                    key={msg.id} 
                    className={`whatsapp-bubble ${isOut ? 'out' : 'in'}`}
                  >
                    {/* Golden AI badge for assistant messages */}
                    {msg.processadaPorIA && isOut && (
                      <span className="whatsapp-bubble-ia-badge">
                        <i className="fas fa-brain" style={{ marginRight: '4px' }}></i> IA Assistente
                      </span>
                    )}

                    <div>{msg.conteudo}</div>
                    
                    <span className="whatsapp-bubble-time">
                      {new Date(msg.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {/* Thinking loading state bubble */}
              {aiThinking && (
                <div className="whatsapp-bubble in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#B5B5B5' }}>IA está digitando</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'inline-block', animation: 'pulse-danger 1s infinite' }}></span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'inline-block', animation: 'pulse-danger 1s infinite 0.2s' }}></span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'inline-block', animation: 'pulse-danger 1s infinite 0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={msgEndRef} />
            </div>

            {/* Chat Input Area (Agency message) */}
            <form onSubmit={handleSendAgency} className="whatsapp-chat-footer">
              <input 
                type="text" 
                placeholder="Digite sua resposta operacional..." 
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="whatsapp-chat-input"
              />
              <button type="submit" className="btn-gold" style={{ borderRadius: '50%', width: '46px', height: '46px', padding: 0 }} title="Enviar Mensagem">
                <i className="fas fa-paper-plane" style={{ fontSize: '1rem' }}></i>
              </button>
            </form>

          </div>
        </div>

        {/* RIGHT COLUMN: AI AGENT SYSTEM MONITOR & SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SIMULATOR: Send Message AS THE CUSTOMER */}
          {!currentUsuario.clienteId && (
            <div className="card-premium" style={{ border: '1px solid var(--color-warning)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-terminal"></i>
                Simulador de Cliente
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#B5B5B5', marginBottom: '16px' }}>
                Simule a resposta do cliente no WhatsApp e veja como o assistente de inteligência artificial interpreta e age in segundos!
              </p>

              {/* Custom input */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Ex: Aprovado o encarte..." 
                  value={simulatedClientMsg}
                  onChange={(e) => setSimulatedClientMsg(e.target.value)}
                  className="input-premium"
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                />
                <button 
                  className="btn-gold" 
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  onClick={() => handleSimulateClient(simulatedClientMsg)}
                >
                  Enviar
                </button>
              </div>

              {/* Quick Trigger Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '10px', width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateClient('Aprovado o encarte de ofertas')}
                >
                  👍 Simular "Aprovado!"
                </button>
                
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '10px', width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateClient('Pode trocar a foto do arroz do encarte por favor?')}
                >
                  🛠️ Simular "Solicitar Ajustes"
                </button>

                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '10px', width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateClient('Quais demandas estão pendentes?')}
                >
                  📋 Simular "Pedir Status"
                </button>

                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '10px', width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateClient('O preço correto da oferta é R$ 19,99')}
                >
                  💰 Simular "Preço correto é R$ 19,99"
                </button>
              </div>

              {/* Smart deadline billing triggers */}
              <div style={{ borderTop: '1px solid #333', marginTop: '16px', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '8px' }}>Cobrança Inteligente Automática</h4>
                <button 
                  className="btn-reject" 
                  style={{ fontSize: '0.7rem', padding: '8px 12px', width: '100%' }}
                  onClick={handleTriggerPrazoVencido}
                >
                  ⚠️ Simular Prazo VENCIDO!
                </button>
                <span style={{ fontSize: '0.6rem', color: '#B5B5B5', marginTop: '6px', display: 'block', textAlign: 'center' }}>
                  Dispara alertas agendados de 48h, 24h e escalonamento hierárquico.
                </span>
              </div>
            </div>
          )}

          {/* SYSTEM: AI LOG MONITOR */}
          <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#D4AF37', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-brain"></i> Monitor da IA em Ação
            </h3>
            
            <div style={{
              flex: 1,
              backgroundColor: '#121212',
              borderRadius: '6px',
              border: '1px solid #2A2A2A',
              padding: '12px',
              fontFamily: 'Courier New, Courier, monospace',
              fontSize: '0.75rem',
              color: '#35D07F',
              overflowY: 'auto',
              maxHeight: '280px',
              whiteSpace: 'pre-wrap'
            }}>
              {aiLogs.length > 0 ? (
                aiLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px dashed #222', paddingBottom: '8px' }}>
                    <span style={{ color: '#D4AF37' }}>&gt; [SYSTEM AI LOG]</span>
                    <p style={{ marginTop: '4px', color: '#fff' }}>{log}</p>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666', textAlign: 'center', paddingTop: '40px' }}>
                  Aguardando interações da IA para exibir logs de processamento em tempo real...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
