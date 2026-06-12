import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { ProjetoCronograma, EtapaCronograma } from '../types';

function getStepImportance(stepName: string) {
  const name = stepName.toLowerCase();
  if (name.includes('requisito') || name.includes('coleta')) {
    return "Nesta fase, nós mapeamos todas as suas necessidades. O prazo aqui é crucial porque qualquer funcionalidade não mapeada agora exigirá retrabalho nas fases futuras, o que atrasaria todo o projeto. Cumprir esta etapa garante que estamos na mesma página antes de escrever a primeira linha de código.";
  }
  if (name.includes('planejamento')) {
    return "Esta é a construção do alicerce do projeto. O prazo é importante para que a equipe saiba exatamente o que fazer, quando fazer e quem vai fazer. Sem o planejamento finalizado no prazo, os designers e desenvolvedores ficarão bloqueados.";
  }
  if (name.includes('design') || name.includes('prototipação')) {
    return "Aqui damos vida à aparência do seu app. O cumprimento deste prazo é fundamental porque os programadores dependem da interface aprovada para começar a montar as telas no código. Atrasar o design causa um efeito dominó direto no desenvolvimento.";
  }
  if (name.includes('estrutura') || name.includes('banco de dados')) {
    return "É a criação da arquitetura invisível (servidores e banco de dados). O prazo é vital: sem a estrutura pronta, o sistema não tem onde salvar as informações do usuário. É como construir as tubulações antes de erguer as paredes.";
  }
  if (name.includes('backend') || name.includes('servidor')) {
    return "A inteligência do aplicativo está sendo construída. Este prazo é rigoroso porque o Frontend (as telas) precisa consultar essa inteligência. Se o Backend atrasa, o aplicativo fica sem dados reais para mostrar nas telas, travando a equipe visual.";
  }
  if (name.includes('frontend') || name.includes('visual')) {
    return "Nesta etapa unimos o Design com a inteligência do Backend. O prazo aqui dita quando o aplicativo ganhará vida e poderá ser tocado por você pela primeira vez. Atrasos aqui empurram os testes de qualidade para frente.";
  }
  if (name.includes('testes') || name.includes('qa')) {
    return "A fase de caça aos bugs! O rigor neste prazo garante que teremos tempo suficiente para quebrar o sistema e consertá-lo antes que seus clientes reais o utilizem. Diminuir esse prazo significa lançar um app com falhas na versão final.";
  }
  if (name.includes('beta')) {
    return "O momento em que você experimenta o aplicativo na prática. Cumprir este prazo significa que teremos tempo hábil para ouvir seus feedbacks e lapidar os detalhes finais antes do grande lançamento nas lojas.";
  }
  if (name.includes('ajustes')) {
    return "Refinamento baseado no seu feedback do Beta. O prazo é estrito porque ajustes não podem durar para sempre; precisamos 'fechar o pacote' para que os servidores da Apple e do Google aprovem a versão pública a tempo.";
  }
  if (name.includes('publicação') || name.includes('lojas')) {
    return "A submissão do aplicativo para a Apple App Store e Google Play Store. O prazo aqui é estratégico, pois essas empresas costumam levar alguns dias para analisar e aprovar o app. Enviar no prazo garante que a data do seu lançamento oficial não seja furada pelas regras da Apple ou do Google.";
  }
  if (name.includes('entrega')) {
    return "A conclusão absoluta. Este prazo marca o fim do nosso ciclo de desenvolvimento ativo e a passagem de bastão oficial do código para a sua posse, garantindo a sua autonomia sobre o produto.";
  }
  return "Esta etapa prepara as bases para a fase seguinte. Cumprir este prazo mantém a equipe fluindo sem bloqueios e garante que a data final de entrega ao mercado não sofra impactos em cadeia.";
}

export const CronogramaView: React.FC = () => {
  const {
    projetosCronograma,
    etapasCronograma,
    clientes,
    currentUsuario,
    addProjetoCronograma,
    deleteProjetoCronograma,
    updateEtapaCronograma,
    addEtapaCustomizada,
    reorderEtapasCronograma,
    definirEtapaAtualCronograma,
  } = useData();

  const isClient = currentUsuario.role === 'cliente' || currentUsuario.role === 'colaborador';

  // Filter projects by client if logged in as client
  const filteredProjects: ProjetoCronograma[] = isClient
    ? projetosCronograma.filter(p => p.clienteId === currentUsuario.clienteId)
    : projetosCronograma;

  // Selected Project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    if (filteredProjects.length > 0) {
      const isValid = filteredProjects.some(p => p.id === selectedProjectId);
      if (!isValid) {
        setSelectedProjectId(filteredProjects[0].id);
      }
    } else {
      setSelectedProjectId('');
    }
  }, [filteredProjects, selectedProjectId]);

  const activeProject = filteredProjects.find(p => p.id === selectedProjectId);
  const activeSteps = etapasCronograma
    .filter(e => e.projetoId === selectedProjectId)
    .sort((a, b) => a.step_order - b.step_order);

  // Modal State for Client Details
  const [selectedStepModal, setSelectedStepModal] = useState<EtapaCronograma | null>(null);

  // Admin Drag & Drop
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // New Project Form State
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjClientId, setNewProjClientId] = useState('');
  const [newProjStartDate, setNewProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProjBanner, setNewProjBanner] = useState('');

  // Custom Step Form State
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepDays, setNewStepDays] = useState(5);
  const [newStepImage, setNewStepImage] = useState('');

  // Save feedback state (mapping: stepId -> true/false)
  const [saveFeedback, setSaveFeedback] = useState<Record<string, boolean>>({});

  // Client list for project creation
  useEffect(() => {
    if (clientes.length > 0 && !newProjClientId) {
      setNewProjClientId(clientes[0].id);
    }
  }, [clientes, newProjClientId]);

  // Predefined premium banners for quick selection
  const BANNER_PRESETS = [
    { name: 'Tecnologia', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800' },
    { name: 'Alimentação', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' },
    { name: 'Imobiliário', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800' },
    { name: 'Saúde', url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=800' },
    { name: 'Moda', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800' }
  ];

  // Helper date metrics
  let totalDays = 0;
  let elapsedDays = 0;
  let remainingDays = 0;
  let completedCount = 0;
  let currentStageIndex = -1;

  if (activeProject && activeSteps.length > 0) {
    const sDate = new Date(activeProject.start_date);
    const eDate = new Date(activeProject.expected_delivery);
    totalDays = Math.max(1, Math.ceil(Math.abs(eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const today = new Date();
    elapsedDays = Math.max(0, Math.ceil((today.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
    remainingDays = Math.max(0, totalDays - elapsedDays);

    activeSteps.forEach((s, idx) => {
      if (s.status === 'concluido') completedCount++;
      if (s.status === 'andamento' && currentStageIndex === -1) {
        currentStageIndex = idx;
      }
    });

    if (currentStageIndex === -1) {
      const firstAguardando = activeSteps.findIndex(s => s.status === 'aguardando');
      if (firstAguardando !== -1) {
        currentStageIndex = firstAguardando;
      } else if (completedCount === activeSteps.length) {
        currentStageIndex = activeSteps.length - 1;
      }
    }
  }

  // Handle Drag Start
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle Drop
  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx || !activeProject) return;
    const reordered = [...activeSteps];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    
    setDraggedIdx(null);
    await reorderEtapasCronograma(activeProject.id, reordered.map(s => s.id));
  };

  // Save Step Changes
  const handleSaveStep = async (step: EtapaCronograma) => {
    if (!activeProject) return;
    const pInput = document.getElementById(`perc-${step.id}`) as HTMLInputElement;
    const sInput = document.getElementById(`status-${step.id}`) as HTMLSelectElement;
    const dInput = document.getElementById(`days-${step.id}`) as HTMLInputElement;

    const percentage = pInput ? Number(pInput.value) : step.percentage;
    const status = sInput ? sInput.value as any : step.status;
    const durationDays = dInput ? Number(dInput.value) : step.duration_days;

    await updateEtapaCronograma(activeProject.id, step.id, percentage, status, durationDays);

    setSaveFeedback(prev => ({ ...prev, [step.id]: true }));
    setTimeout(() => {
      setSaveFeedback(prev => ({ ...prev, [step.id]: false }));
    }, 2500);
  };

  // Date picker changed: recalculates duration
  const handleDateChange = async (step: EtapaCronograma, value: string) => {
    if (!activeProject) return;
    const stepIdx = activeSteps.findIndex(s => s.id === step.id);
    const prevDateStr = stepIdx > 0 ? activeSteps[stepIdx - 1].expected_date : activeProject.start_date;
    
    if (!prevDateStr) return;
    const prevDate = new Date(prevDateStr);
    const newExpected = new Date(value);
    
    const diffTime = newExpected.getTime() - prevDate.getTime();
    const durationDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // update UI input locally
    const dInput = document.getElementById(`days-${step.id}`) as HTMLInputElement;
    if (dInput) dInput.value = durationDays.toString();

    const pInput = document.getElementById(`perc-${step.id}`) as HTMLInputElement;
    const sInput = document.getElementById(`status-${step.id}`) as HTMLSelectElement;
    const percentage = pInput ? Number(pInput.value) : step.percentage;
    const status = sInput ? sInput.value as any : step.status;

    await updateEtapaCronograma(activeProject.id, step.id, percentage, status, durationDays);
  };

  // Define Current Stage
  const handleDefineCurrent = async (stepId: string) => {
    if (!activeProject) return;
    await definirEtapaAtualCronograma(activeProject.id, stepId);
  };

  // Add Project Submit
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const projName = newProjName.trim() || 'Novo Projeto';
    const clientId = newProjClientId || (clientes[0]?.id || '');
    if (!clientId) {
      alert('Nenhum cliente disponível para associar ao projeto.');
      return;
    }
    const client = clientes.find(c => c.id === clientId);
    const clientName = client ? client.nomeFantasia : 'Cliente CRM';
    const banner = newProjBanner || BANNER_PRESETS[0].url;

    await addProjetoCronograma(projName, clientName, newProjStartDate, clientId, banner);

    setShowNewProjModal(false);
    setNewProjName('');
    setNewProjBanner('');
    // Auto-select newly created project
    const latestProj = projetosCronograma[projetosCronograma.length - 1];
    if (latestProj) setSelectedProjectId(latestProj.id);
  };

  // Add Custom Step Submit
  const handleAddCustomStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    const stepName = newStepName.trim() || 'Etapa Customizada';
    const image = newStepImage || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500';

    await addEtapaCustomizada(activeProject.id, stepName, newStepDesc, newStepDays, image);

    setNewStepName('');
    setNewStepDesc('');
    setNewStepImage('');
    setNewStepDays(5);
  };

  // Delete Project Action
  const handleDeleteProject = async (projId: string) => {
    if (window.confirm('Tem certeza de que deseja deletar este projeto e todas as suas etapas?')) {
      await deleteProjetoCronograma(projId);
      setSelectedProjectId('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Cronograma de Projetos</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Acompanhe ou gerencie a execução operacional e prazos de desenvolvimento tecnológico.
          </p>
        </div>
        {!isClient && (
          <button className="btn-gold" onClick={() => setShowNewProjModal(true)}>
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
            Novo Projeto
          </button>
        )}
      </div>

      {/* NO PROJECTS WRAPPER */}
      {filteredProjects.length === 0 ? (
        <div className="card-premium flex-center" style={{ padding: '60px 20px', flexDirection: 'column', gap: '16px' }}>
          <i className="fas fa-stream" style={{ fontSize: '3rem', color: '#666' }}></i>
          <h3 style={{ margin: 0 }}>Nenhum projeto operacional ativo</h3>
          <p style={{ color: '#B5B5B5', textAlign: 'center', maxWidth: '400px', margin: 0, fontSize: '0.85rem' }}>
            {isClient
              ? 'Sua empresa não possui cronogramas associados no momento. Entre em contato com a agência!'
              : 'Nenhum projeto cadastrado no banco de dados. Clique no botão acima para iniciar um novo!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', flexDirection: isClient ? 'column' : 'row', flexWrap: 'wrap' }}>
          
          {/* SIDEBAR FOR AGENCY USERS */}
          {!isClient && (
            <div style={{ flex: '0 0 280px', width: '280px' }}>
              <div className="card-premium" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Projetos Operacionais
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredProjects.map(proj => {
                    const isSelected = selectedProjectId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--glass-bg)' : 'transparent',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--glass-border)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--gold-primary)' : '#FFF' }}>
                            {proj.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#888' }}>
                            {proj.progress}%
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#888' }}>
                          Cliente: {proj.client_name}
                        </span>
                        
                        {/* Thin progress bar */}
                        <div style={{ width: '100%', height: '3px', backgroundColor: '#252525', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${proj.progress}%`, height: '100%', backgroundColor: 'var(--gold-primary)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MAIN CRONOGRAMA WORKSPACE */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {activeProject && (
              <>
                {/* HERO BANNER CARD */}
                <div 
                  className="card-premium" 
                  style={{ 
                    padding: 0, 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <div 
                    style={{ 
                      height: '180px', 
                      backgroundImage: `url(${activeProject.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000'})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center', 
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '24px'
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(18,18,18,0.2) 0%, rgba(18,18,18,0.85) 100%)' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(58, 134, 255, 0.15)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>
                          PROJETO OPERACIONAL
                        </span>
                        <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#FFF' }}>{activeProject.name}</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#B5B5B5', fontSize: '0.8rem' }}>
                          Cliente: <strong>{activeProject.client_name}</strong>
                        </p>
                      </div>

                      {isClient && filteredProjects.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '0.75rem', color: '#B5B5B5', fontWeight: 700 }}>Selecionar Projeto:</label>
                          <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            style={{
                              backgroundColor: '#1E1E1E',
                              border: '1px solid #2A2A2A',
                              color: '#FFF',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {filteredProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {!isClient && (
                        <button 
                          onClick={() => handleDeleteProject(activeProject.id)}
                          style={{
                            backgroundColor: 'rgba(255, 90, 90, 0.1)',
                            border: '1px solid rgba(255, 90, 90, 0.3)',
                            color: '#FF5A5A',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 90, 90, 0.2)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 90, 90, 0.1)'}
                        >
                          <i className="fas fa-trash-can" style={{ marginRight: '6px' }} /> Deletar Projeto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner Info Summary Grid */}
                  <div style={{ padding: '20px 24px', backgroundColor: '#1E1E1E', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', borderTop: '1px solid #2A2A2A' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Data de Início</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeProject.start_date ? new Date(activeProject.start_date + 'T00:00:00').toLocaleDateString() : '--/--/----'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Entrega Prevista</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{activeProject.expected_delivery ? new Date(activeProject.expected_delivery + 'T00:00:00').toLocaleDateString() : '--/--/----'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Duração Total</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{totalDays} dias</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Progresso</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeProject.progress}% Concluído</span>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 1. MODO CLIENTE: TIMELINE PREMIUM VISUAL */}
                {/* ============================================================== */}
                {isClient && (
                  <>
                    {/* PROGRESS CIRCULAR AND CARDS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
                      
                      {/* Left Block: Horizontal visual gallery */}
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Galeria Visual do Desenvolvimento</h3>
                          <p style={{ color: '#B5B5B5', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                            Deslize horizontalmente e clique sobre qualquer card para entender a importância crítica de cada etapa.
                          </p>
                        </div>

                        <div className="timeline-gallery-container">
                          {activeSteps.map((step, idx) => {
                            const isCurrent = idx === currentStageIndex;
                            const isDone = step.status === 'concluido';
                            let statusText = 'Aguardando';
                            if (step.status === 'andamento') statusText = 'Em andamento';
                            if (step.status === 'concluido') statusText = 'Concluído';

                            return (
                              <div
                                key={step.id}
                                className={`timeline-card-visual ${isCurrent ? 'active' : ''}`}
                                onClick={() => setSelectedStepModal(step)}
                              >
                                <div 
                                  className="timeline-card-image-box"
                                  style={{ backgroundImage: `url(${step.image_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400'})` }}
                                >
                                  <div className="timeline-card-overlay" />
                                  <div className="timeline-card-tag">Etapa {idx + 1}</div>
                                  
                                  {step.expected_date && (
                                    <div className="timeline-card-date">
                                      <i className="fas fa-calendar-alt" /> {new Date(step.expected_date + 'T00:00:00').toLocaleDateString()}
                                    </div>
                                  )}

                                  <h4 className="timeline-card-title">{step.name}</h4>
                                </div>

                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                                    <span style={{ color: isDone ? 'var(--color-success)' : isCurrent ? 'var(--gold-primary)' : '#888' }}>
                                      {statusText}
                                    </span>
                                    <span>{step.percentage}%</span>
                                  </div>
                                  
                                  {/* Step Progress Line */}
                                  <div style={{ width: '100%', height: '4px', backgroundColor: '#252525', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div 
                                      style={{ 
                                        width: `${step.percentage}%`, 
                                        height: '100%', 
                                        backgroundColor: isDone ? 'var(--color-success)' : isCurrent ? 'var(--gold-primary)' : '#444',
                                        transition: 'width 0.4s ease'
                                      }} 
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Block: Circular Progress Indicator */}
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                          Progresso Real
                        </h3>
                        
                        <div className="circular-progress-wrapper">
                          <div className="rocket-icon-center">🚀</div>
                          <svg className="circular-chart" viewBox="0 0 36 36">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle-fill" strokeDasharray={`${activeProject.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{activeProject.progress}%</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#B5B5B5' }}>
                            {completedCount} de {activeSteps.length} etapas concluídas
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS AND CALENDAR SUMMARY ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '24px' }}>
                      
                      {/* Section: Active Step Detail */}
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2A2A2A', paddingBottom: '12px' }}>
                          <h3 style={{ fontSize: '1rem', margin: 0 }}>Etapa Atual em Foco</h3>
                          <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(58, 134, 255, 0.12)', padding: '3px 8px', borderRadius: '10px', color: 'var(--gold-primary)', fontWeight: 700 }}>
                            Fase {currentStageIndex + 1} de {activeSteps.length}
                          </span>
                        </div>

                        {currentStageIndex !== -1 && activeSteps[currentStageIndex] ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', fontSize: '1.2rem' }}>
                                <i className="fas fa-play" />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{activeSteps[currentStageIndex].name}</h4>
                                <p style={{ color: '#B5B5B5', fontSize: '0.78rem', margin: '2px 0 0 0' }}>{activeSteps[currentStageIndex].description}</p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <span style={{ color: '#888' }}>Conclusão da Etapa</span>
                                <span style={{ fontWeight: 700 }}>{activeSteps[currentStageIndex].percentage}%</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#252525', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${activeSteps[currentStageIndex].percentage}%`, height: '100%', backgroundColor: 'var(--gold-primary)' }} />
                              </div>
                            </div>

                            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                Raciocínio de Importância Operacional:
                              </span>
                              <p style={{ fontSize: '0.75rem', color: '#B5B5B5', margin: 0, lineHeight: '1.4' }}>
                                {getStepImportance(activeSteps[currentStageIndex].name)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>Nenhuma etapa operacional ativa.</p>
                        )}
                      </div>

                      {/* Section: Next Milestones */}
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0, borderBottom: '1px solid #2A2A2A', paddingBottom: '12px' }}>
                          Próximos Passos Operacionais
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '180px' }}>
                          {activeSteps.slice(currentStageIndex + 1).length === 0 ? (
                            <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>Nenhum passo pendente restante. Projeto em conclusão!</p>
                          ) : (
                            activeSteps.slice(currentStageIndex + 1).map((s, idx) => (
                              <div 
                                key={s.id} 
                                className="clickable-node"
                                onClick={() => setSelectedStepModal(s)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#888' }}>
                                    {currentStageIndex + 2 + idx}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFF' }}>
                                    {s.name}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.68rem', color: '#888' }}>
                                  {s.expected_date ? new Date(s.expected_date + 'T00:00:00').toLocaleDateString() : '--/--'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Section: Operational Calendar Stats */}
                      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0, borderBottom: '1px solid #2A2A2A', paddingBottom: '12px' }}>
                          Métricas Operacionais
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#888' }}>Previsão Inicial</span>
                            <span style={{ fontWeight: 700 }}>{totalDays} dias</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#888' }}>Tempo Operado</span>
                            <span style={{ fontWeight: 700 }}>{elapsedDays} dias</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#888' }}>Dias Restantes</span>
                            <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{remainingDays} dias</span>
                          </div>
                          
                          <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Situação Operacional</span>
                            <span className="badge-custom badge-low" style={{ backgroundColor: 'rgba(53, 208, 127, 0.1)', color: 'var(--color-success)', fontSize: '0.65rem' }}>
                              <i className="fas fa-check-circle" /> Dentro do prazo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ============================================================== */}
                {/* 2. MODO ADMINISTRATIVO: TABELA DE GERENCIAMENTO E DRAG & DROP */}
                {/* ============================================================== */}
                {!isClient && (
                  <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="flex-between">
                      <div>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Gerenciamento Operacional de Etapas</h3>
                        <p style={{ color: '#B5B5B5', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                          Arraste as linhas das etapas para reordená-las. Salve alterações de prazo, status ou porcentagem individualmente.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#B5B5B5', backgroundColor: '#252525', padding: '6px 12px', borderRadius: '6px' }}>
                          Progresso Calculado: <strong>{activeProject.progress}%</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ border: '1px solid var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table className="table-cronograma">
                        <thead>
                          <tr>
                            <th style={{ width: '32px' }} />
                            <th>Fase & Descrição</th>
                            <th style={{ width: '120px' }}>Duração</th>
                            <th style={{ width: '150px' }}>Data Prevista</th>
                            <th style={{ width: '110px' }}>% Concluído</th>
                            <th style={{ width: '170px' }}>Situação</th>
                            <th style={{ textAlign: 'right', width: '160px' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeSteps.map((step, idx) => {
                            const isCurrent = idx === currentStageIndex;
                            const isSuccess = !!saveFeedback[step.id];

                            return (
                              <tr 
                                key={step.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(idx)}
                                style={{
                                  opacity: draggedIdx === idx ? 0.4 : 1,
                                  cursor: 'grab'
                                }}
                              >
                                <td style={{ color: '#555', cursor: 'grab', verticalAlign: 'middle' }}>
                                  <i className="fas fa-grip-lines" />
                                </td>
                                
                                <td style={{ verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: isCurrent ? 'var(--gold-primary)' : '#252525', color: isCurrent ? '#000' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>{step.name}</span>
                                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>{step.description}</span>
                                    </div>
                                  </div>
                                </td>

                                <td style={{ verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                      type="number"
                                      id={`days-${step.id}`}
                                      defaultValue={step.duration_days}
                                      min={0}
                                      style={{
                                        width: '60px',
                                        backgroundColor: '#252525',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        color: '#FFF',
                                        fontSize: '0.8rem',
                                        textAlign: 'center',
                                        outline: 'none'
                                      }}
                                    />
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>dias</span>
                                  </div>
                                </td>

                                <td style={{ verticalAlign: 'middle' }}>
                                  <input
                                    type="date"
                                    defaultValue={step.expected_date}
                                    onChange={(e) => handleDateChange(step, e.target.value)}
                                    style={{
                                      backgroundColor: '#252525',
                                      border: '1px solid rgba(255,255,255,0.06)',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      color: '#FFF',
                                      fontSize: '0.75rem',
                                      outline: 'none',
                                      width: '125px'
                                    }}
                                  />
                                </td>

                                <td style={{ verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                      type="number"
                                      id={`perc-${step.id}`}
                                      defaultValue={step.percentage}
                                      min={0}
                                      max={100}
                                      style={{
                                        width: '55px',
                                        backgroundColor: '#252525',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '6px',
                                        padding: '6px 8px',
                                        color: '#FFF',
                                        fontSize: '0.8rem',
                                        textAlign: 'center',
                                        outline: 'none'
                                      }}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>%</span>
                                  </div>
                                </td>

                                <td style={{ verticalAlign: 'middle' }}>
                                  <select
                                    id={`status-${step.id}`}
                                    defaultValue={step.status}
                                    style={{
                                      backgroundColor: '#252525',
                                      border: '1px solid rgba(255,255,255,0.06)',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      color: '#FFF',
                                      fontSize: '0.78rem',
                                      outline: 'none',
                                      cursor: 'pointer',
                                      width: '100%'
                                    }}
                                  >
                                    <option value="aguardando">Aguardando ⏳</option>
                                    <option value="andamento">Em andamento 🔥</option>
                                    <option value="concluido">Concluído ✅</option>
                                  </select>
                                </td>

                                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    {!isCurrent && step.status !== 'concluido' && (
                                      <button
                                        onClick={() => handleDefineCurrent(step.id)}
                                        title="Definir como Etapa Operacional Ativa (Conclui anteriores)"
                                        style={{
                                          backgroundColor: '#252525',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          borderRadius: '6px',
                                          padding: '6px 10px',
                                          cursor: 'pointer',
                                          fontSize: '0.85rem'
                                        }}
                                      >
                                        🎯
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => handleSaveStep(step)}
                                      style={{
                                        backgroundColor: isSuccess ? 'var(--color-success)' : 'var(--gold-primary)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      {isSuccess ? (
                                        <><i className="fas fa-check" /> Salvo</>
                                      ) : (
                                        <><i className="fas fa-save" /> Salvar</>
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* BLOCK: ADD CUSTOM ETAPA */}
                    <div style={{ marginTop: '12px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--bg-secondary)', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#FFF', marginBottom: '14px' }}>
                        Adicionar Fase Customizada ao Projeto
                      </h4>
                      
                      <form onSubmit={handleAddCustomStep} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 100px 1.5fr auto', gap: '12px', alignItems: 'end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Nome da Etapa</label>
                          <input 
                            type="text"
                            placeholder="Ex: Treinamento Operacional"
                            value={newStepName}
                            onChange={e => setNewStepName(e.target.value)}
                            style={{
                              backgroundColor: '#1E1E1E',
                              border: '1px solid #2A2A2A',
                              color: '#FFF',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Descrição</label>
                          <input 
                            type="text"
                            placeholder="Ex: Entrega de documentação e treinamento..."
                            value={newStepDesc}
                            onChange={e => setNewStepDesc(e.target.value)}
                            style={{
                              backgroundColor: '#1E1E1E',
                              border: '1px solid #2A2A2A',
                              color: '#FFF',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Duração (Dias)</label>
                          <input 
                            type="number" min={0}
                            value={newStepDays}
                            onChange={e => setNewStepDays(Number(e.target.value))}
                            style={{
                              backgroundColor: '#1E1E1E',
                              border: '1px solid #2A2A2A',
                              color: '#FFF',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>Link da Imagem (Opcional)</label>
                          <input 
                            type="text"
                            placeholder="Link Unsplash ou imagem..."
                            value={newStepImage}
                            onChange={e => setNewStepImage(e.target.value)}
                            style={{
                              backgroundColor: '#1E1E1E',
                              border: '1px solid #2A2A2A',
                              color: '#FFF',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <button 
                          type="submit"
                          style={{
                            backgroundColor: '#1E1E1E',
                            border: '1px solid var(--glass-border)',
                            color: '#FFF',
                            padding: '10px 18px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                          Inserir Fase
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: DETALHES DA ETAPA (CLIENT MODE) */}
      {/* ============================================================== */}
      {selectedStepModal && (
        <div 
          onClick={() => setSelectedStepModal(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1E1E1E', 
              borderRadius: '16px', 
              padding: '32px', 
              width: '90%', 
              maxWidth: '520px',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setSelectedStepModal(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: '#2A2A2A', border: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}
            >
              <i className="fas fa-times" />
            </button>

            <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--gold-primary)', backgroundColor: 'rgba(58, 134, 255, 0.15)', padding: '4px 10px', borderRadius: '4px', display: 'inline-block', marginBottom: '16px' }}>
              Importância do Milestone
            </span>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>{selectedStepModal.name}</h2>
            <p style={{ color: '#B5B5B5', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
              {selectedStepModal.description}
            </p>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-clock" /> Por que este prazo é importante?
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#B5B5B5', lineHeight: 1.5, margin: 0 }}>
                {getStepImportance(selectedStepModal.name)}
              </p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: selectedStepModal.status === 'concluido' ? 'var(--color-success)' : selectedStepModal.status === 'andamento' ? 'var(--gold-primary)' : '#888' }}>
                  {selectedStepModal.status === 'concluido' ? 'Concluído' : selectedStepModal.status === 'andamento' ? 'Em andamento' : 'Aguardando'}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Data Limite</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFF' }}>
                  {selectedStepModal.expected_date ? new Date(selectedStepModal.expected_date + 'T00:00:00').toLocaleDateString() : '--/--/----'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Progresso</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{selectedStepModal.percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: NOVO PROJETO (AGENCY MODE) */}
      {/* ============================================================== */}
      {showNewProjModal && (
        <div 
          onClick={() => setShowNewProjModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1E1E1E', 
              borderRadius: '16px', 
              padding: '32px', 
              width: '90%', 
              maxWidth: '500px',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowNewProjModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: '#2A2A2A', border: 'none', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}
            >
              <i className="fas fa-times" />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '20px' }}>
              Novo Cronograma de Projeto
            </h2>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#B5B5B5', fontWeight: 700 }}>Nome do Projeto</label>
                <input 
                  type="text"
                  placeholder="Ex: Aurea Clube de Benefícios"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#B5B5B5', fontWeight: 700 }}>Cliente Associado (CRM)</label>
                <select
                  value={newProjClientId}
                  onChange={e => setNewProjClientId(e.target.value)}
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia} ({c.razaoSocial})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#B5B5B5', fontWeight: 700 }}>Data de Início</label>
                <input 
                  type="date"
                  value={newProjStartDate}
                  onChange={e => setNewProjStartDate(e.target.value)}
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#B5B5B5', fontWeight: 700 }}>Banner Temático</label>
                
                {/* Visual selector presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {BANNER_PRESETS.map(preset => {
                    const isSelected = newProjBanner === preset.url;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setNewProjBanner(preset.url)}
                        style={{
                          backgroundColor: isSelected ? 'rgba(58, 134, 255, 0.15)' : '#252525',
                          border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.06)',
                          color: isSelected ? 'var(--gold-primary)' : '#B5B5B5',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>

                <input 
                  type="text"
                  placeholder="Ou cole uma URL personalizada..."
                  value={newProjBanner}
                  onChange={e => setNewProjBanner(e.target.value)}
                  style={{
                    backgroundColor: '#252525',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit"
                className="btn-gold"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Criar Projeto Operacional
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
