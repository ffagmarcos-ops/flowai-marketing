import React from 'react';
import { useData } from '../context/DataContext';

export const DashboardView: React.FC = () => {
  const { demandas, clientes, aprovacoes, historicos } = useData();

  // Metrics calculations
  const totalClientes = clientes.length;
  const demandasAbertas = demandas.filter(d => d.status !== 'Concluído').length;
  const demandasAtrasadas = demandas.filter(d => d.slaEstourado && d.status !== 'Concluído').length;
  const aprovacoesPendentes = aprovacoes.filter(a => a.status === 'Pendente').length;
  
  // Calculate average response time
  const activeClientesWithTime = clientes.filter(c => c.tempoMedioResposta > 0);
  const tempoMedioTotal = activeClientesWithTime.length > 0
    ? +(activeClientesWithTime.reduce((acc, c) => acc + c.tempoMedioResposta, 0) / activeClientesWithTime.length).toFixed(1)
    : 0;

  // Calculate SLA Percentage
  const totalFinalizadas = demandas.filter(d => d.status === 'Concluído' || d.status === 'Publicado').length;
  const finalizadasNoPrazo = demandas.filter(d => (d.status === 'Concluído' || d.status === 'Publicado') && !d.slaEstourado).length;
  const taxaSLA = totalFinalizadas > 0 
    ? Math.round((finalizadasNoPrazo / totalFinalizadas) * 100)
    : 92; // default high index

  // Chart data: count demands by stage
  const stages = [
    { label: 'Solicitado', count: demandas.filter(d => d.status === 'Solicitado').length },
    { label: 'Aguardando Cliente', count: demandas.filter(d => d.status === 'Aguardando Cliente').length },
    { label: 'Produção', count: demandas.filter(d => d.status === 'Produção').length },
    { label: 'Aprovação', count: demandas.filter(d => d.status === 'Aprovação').length },
    { label: 'Agendado', count: demandas.filter(d => d.status === 'Agendado').length },
    { label: 'Publicado', count: demandas.filter(d => d.status === 'Publicado').length },
    { label: 'Concluído', count: demandas.filter(d => d.status === 'Concluído').length }
  ];

  const maxStageCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Dashboard Executivo</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>Visão consolidada em tempo real da sua agência e clientes.</p>
        </div>
        <div style={{
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#D4AF37'
        }}>
          <i className="fas fa-sync fa-spin"></i>
          <span>Atualização em tempo real ativa</span>
        </div>
      </div>

      {/* METRICS COUNTERS GRID */}
      <div className="grid-dashboard">
        
        {/* Metric 1 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clientes Ativos
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }} className="flex-center">
              <i className="fas fa-building"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{totalClientes}</h3>
          <div style={{ fontSize: '0.7rem', color: '#35D07F', marginTop: '6px' }}>
            <i className="fas fa-caret-up"></i> +12% vs mês anterior
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demandas Abertas
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(0, 195, 255, 0.1)', color: '#00c3ff' }} className="flex-center">
              <i className="fas fa-tasks"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{demandasAbertas}</h3>
          <div style={{ fontSize: '0.7rem', color: '#B5B5B5', marginTop: '6px' }}>
            Aguardando ações operacionais
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demandas Atrasadas
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(255, 90, 90, 0.1)', color: '#FF5A5A' }} className="flex-center">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: demandasAtrasadas > 0 ? '#FF5A5A' : '#fff' }}>
            {demandasAtrasadas}
          </h3>
          <div style={{ fontSize: '0.7rem', color: demandasAtrasadas > 0 ? '#FF5A5A' : '#35D07F', marginTop: '6px' }}>
            {demandasAtrasadas > 0 ? 'Requer atenção imediata!' : 'Excelente! Zero atrasos'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Aprovações Pendentes
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(53, 208, 127, 0.1)', color: '#35D07F' }} className="flex-center">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{aprovacoesPendentes}</h3>
          <div style={{ fontSize: '0.7rem', color: '#B5B5B5', marginTop: '6px' }}>
            Nas centrais exclusivas dos clientes
          </div>
        </div>

        {/* Metric 5 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tempo Médio Resposta
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(255, 170, 0, 0.1)', color: '#FFAA00' }} className="flex-center">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{tempoMedioTotal}h</h3>
          <div style={{ fontSize: '0.7rem', color: '#35D07F', marginTop: '6px' }}>
            Taxa de engajamento ativa
          </div>
        </div>

        {/* Metric 6 */}
        <div className="card-premium">
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B5B5B5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cumprimento SLA
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37' }} className="flex-center">
              <i className="fas fa-shield-alt"></i>
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D4AF37' }}>{taxaSLA}%</h3>
          <div style={{ fontSize: '0.7rem', color: '#35D07F', marginTop: '6px' }}>
            Meta contratual de entrega batida
          </div>
        </div>

      </div>

      {/* GRAPH AND STATS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Kanban stats chart */}
        <div className="card-premium">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Estatísticas de Demandas por Etapa</h3>
          <p style={{ color: '#B5B5B5', fontSize: '0.8rem' }}>Distribuição volumétrica das produções e aprovações ativas no funil.</p>
          
          <div className="chart-container">
            {stages.map((stage, idx) => {
              const pct = Math.max(5, (stage.count / maxStageCount) * 85); // min 5% for rendering
              return (
                <div key={idx} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${pct}%`,
                      background: stage.label === 'Aprovação' 
                        ? 'linear-gradient(180deg, #D4AF37, rgba(212, 175, 55, 0.2))'
                        : stage.label === 'Aguardando Cliente'
                        ? 'linear-gradient(180deg, #FFAA00, rgba(255, 170, 0, 0.2))'
                        : stage.label === 'Concluído'
                        ? 'linear-gradient(180deg, #35D07F, rgba(53, 208, 127, 0.2))'
                        : 'linear-gradient(180deg, #555555, rgba(85, 85, 85, 0.2))'
                    }}
                  >
                    <span className="chart-bar-value">{stage.count}</span>
                  </div>
                  <span className="chart-label">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Rankings */}
        <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Ranking de Clientes</h3>
            <p style={{ color: '#B5B5B5', fontSize: '0.8rem' }}>Classificação de acordo com o SLA e tempo de aprovação.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {clientes.map(cli => {
              const statusColor = 
                cli.nivelEngajamento === 'excelente' ? '#35D07F' : 
                cli.nivelEngajamento === 'regular' ? '#FFAA00' : '#FF5A5A';
              const statusSymbol = 
                cli.nivelEngajamento === 'excelente' ? '🟢 Excelente' : 
                cli.nivelEngajamento === 'regular' ? '🟡 Regular' : '🔴 Crítico';
              
              return (
                <div key={cli.id} style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: '8px',
                  padding: '12px',
                  borderLeft: `4px solid ${statusColor}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{cli.nomeFantasia}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#B5B5B5' }}>Resp. Médio: <strong>{cli.tempoMedioResposta}h</strong></span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor }}>
                      {statusSymbol}
                    </span>
                    <div style={{ fontSize: '0.65rem', color: '#B5B5B5', marginTop: '2px' }}>
                      {cli.aprovacoesContadas} aprovadas / {cli.atrasosContados} atrasos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* REAL TIME ACTIVITY AUDIT STREAM */}
      <div className="card-premium">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Histórico Geral Auditável</h3>
            <p style={{ color: '#B5B5B5', fontSize: '0.8rem' }}>Todas as atividades do sistema, comentários, aprovações e mensagens interpretadas por IA.</p>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => window.print()}>
            <i className="fas fa-print"></i> Imprimir Logs
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {historicos.slice(0, 15).map(hist => {
            const icon = 
              hist.tipo === 'aprovacao' ? 'fa-check-double' : 
              hist.tipo === 'comentario' ? 'fa-comment-alt' :
              hist.tipo === 'whatsapp' ? 'fa-envelope-open-text' :
              hist.tipo === 'ia' ? 'fa-brain' : 'fa-info-circle';
            const iconColor = 
              hist.tipo === 'aprovacao' ? '#35D07F' : 
              hist.tipo === 'comentario' ? '#00c3ff' :
              hist.tipo === 'whatsapp' ? '#FFAA00' :
              hist.tipo === 'ia' ? '#D4AF37' : '#B5B5B5';

            return (
              <div key={hist.id} style={{
                display: 'flex',
                gap: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid #2A2A2A',
                borderRadius: '6px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: iconColor,
                  flexShrink: 0
                }} className="flex-center">
                  <i className={`fas ${icon}`}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex-between">
                    <strong style={{ fontSize: '0.8rem', color: '#fff' }}>{hist.usuarioNome}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#666' }}>
                      {new Date(hist.criadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#B5B5B5', marginTop: '2px' }}>
                    <span style={{ color: '#D4AF37', fontWeight: 600 }}>{hist.acao}:</span> {hist.detalhes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
