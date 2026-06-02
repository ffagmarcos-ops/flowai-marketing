import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export const ReportsView: React.FC = () => {
  const { demandas, clientes, currentUsuario } = useData();
  const [selectedReportClientId, setSelectedReportClientId] = useState<string>('');

  const activeReportClientId = currentUsuario.clienteId || selectedReportClientId;

  const filteredDemandas = activeReportClientId 
    ? demandas.filter(d => d.clienteId === activeReportClientId)
    : demandas;

  const filteredClientes = activeReportClientId
    ? clientes.filter(c => c.id === activeReportClientId)
    : clientes;

  // Export alerts
  const handleExport = (type: string) => {
    alert(`Relatório exportado com sucesso no formato ${type}! O download iniciará automaticamente.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Reports Header Banner */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Relatórios & Auditoria de SLA</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Exportação de dados operacionais, análises de gargalos de comunicação e produtividade de design.
          </p>
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => handleExport('CSV')}>
            <i className="fas fa-file-csv"></i> Exportar CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExport('Excel')}>
            <i className="fas fa-file-excel"></i> Exportar Excel
          </button>
          <button className="btn-gold" onClick={() => window.print()}>
            <i className="fas fa-file-pdf"></i> Imprimir PDF
          </button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      {!currentUsuario.clienteId && (
        <div className="card-premium" style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          alignItems: 'center',
          gap: '12px'
        }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B5B5B5' }}>
            <i className="fas fa-filter" style={{ marginRight: '6px' }}></i> Filtrar por Empresa:
          </label>
          <select 
            value={selectedReportClientId} 
            onChange={(e) => setSelectedReportClientId(e.target.value)}
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#FFF',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Todas as Empresas</option>
            {clientes.map(cli => (
              <option key={cli.id} value={cli.id}>
                {cli.nomeFantasia}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* SLA Table Summary */}
      <div className="card-premium">
        <h3 style={{ fontSize: '1.15rem', color: '#D4AF37', marginBottom: '16px' }}>Métricas de Atendimento por Demanda</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2A2A2A', color: '#D4AF37' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Cliente</th>
                <th style={{ padding: '12px' }}>Título da Demanda</th>
                <th style={{ padding: '12px' }}>Categoria</th>
                <th style={{ padding: '12px' }}>Prioridade</th>
                <th style={{ padding: '12px' }}>Prazo Operacional</th>
                <th style={{ padding: '12px' }}>Status Atual</th>
                <th style={{ padding: '12px' }}>Status SLA</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandas.map(d => {
                const cli = clientes.find(c => c.id === d.clienteId);
                const isOver = d.slaEstourado;
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #2A2A2A' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.id.toUpperCase()}</td>
                    <td style={{ padding: '12px' }}>{cli?.nomeFantasia}</td>
                    <td style={{ padding: '12px', color: '#fff' }}>{d.titulo}</td>
                    <td style={{ padding: '12px' }}>{d.categoria}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        color: 
                          d.prioridade === 'Urgente' ? '#FF5A5A' : 
                          d.prioridade === 'Alta' ? '#FFAA00' : '#D4AF37'
                      }}>
                        {d.prioridade}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(d.prazo).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '12px' }}>{d.status}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isOver ? '#FF5A5A' : '#35D07F',
                        backgroundColor: isOver ? 'rgba(255, 90, 90, 0.1)' : 'rgba(53, 208, 127, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {isOver ? 'Estourado / Atrasado' : 'Dentro do Prazo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredDemandas.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                    Nenhuma demanda encontrada para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Summary Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Designer productivity summary */}
        <div className="card-premium">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Produtividade da Equipe de Design</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              <span>Lucas Medeiros (Designer Sênior)</span>
              <strong>{filteredDemandas.filter(d => d.responsavelId === 'u3').length} demandas ativas</strong>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              <span>Bárbara Costa (Gestora)</span>
              <strong>{filteredDemandas.filter(d => d.responsavelId === 'u2').length} demandas ativas</strong>
            </div>
            <div className="flex-between">
              <span>SLA Geral do Designer Lucas</span>
              <strong style={{ color: '#35D07F' }}>94.2% Cumprimento</strong>
            </div>
          </div>
        </div>

        {/* Client responsiveness statistics */}
        <div className="card-premium">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Tempo Médio de Aprovação dos Clientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredClientes.map(cli => (
              <div key={cli.id} className="flex-between" style={{ borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                <span>{cli.nomeFantasia}</span>
                <span style={{
                  color: 
                    cli.nivelEngajamento === 'excelente' ? '#35D07F' : 
                    cli.nivelEngajamento === 'regular' ? '#FFAA00' : '#FF5A5A',
                  fontWeight: 700
                }}>
                  {cli.tempoMedioResposta} horas
                </span>
              </div>
            ))}
            {filteredClientes.length === 0 && (
              <div style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>
                Nenhum cliente disponível.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
