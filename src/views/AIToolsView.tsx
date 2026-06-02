import React, { useState } from 'react';

export const AIToolsView: React.FC = () => {
  const [objective, setObjective] = useState('social');
  const [productName, setProductName] = useState('');
  const [tone, setTone] = useState('persuasivo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) {
      alert('Digite o nome do produto ou campanha.');
      return;
    }

    setLoading(true);
    setResult('');

    // Simulate AI generation delay
    setTimeout(() => {
      setLoading(false);
      let output = '';

      if (objective === 'social') {
        output = `✍️ **LEGENDA PARA REDES SOCIAIS GERADA POR IA**\n\n🎯 **Campanha:** ${productName}\n📢 **Tom de Voz:** ${tone.toUpperCase()}\n\n---\n\n🔥 Sabe aquele momento em que tudo o que você precisa é de qualidade sem complicação? Pois é. O(A) **${productName}** chegou para redefinir seus padrões!\n\nDesenvolvido exclusivamente para quem não abre mão do melhor, trazemos inovação, sofisticação e aquela entrega operacional impecável que você já conhece.\n\n✨ Por que escolher?\n• Praticidade no seu dia a dia\n• Custo-benefício incomparável\n• Resultados validados e aprovados\n\n👉 Clique no link da bio para garantir o seu com condições exclusivas de lançamento. Corre, porque o estoque é limitado!\n\n#${productName.replace(/\s+/g, '')} #Lancamento #Novidade #MarketingFlow #Sucesso #MarketingDigital`;
      } else if (objective === 'reels') {
        output = `🎬 **ROTEIRO DE VÍDEO CURTO (REELS/TIKTOK) GERADO POR IA**\n\n🎯 **Campanha:** ${productName}\n🔊 **Música de Fundo:** Trend animada com batida marcada\n\n---\n\n⏱️ **0:00 - 0:03 [GANCHO]**\n*(Corte rápido mostrando insatisfação do personagem com soluções comuns. Texto na tela: "Ainda quebrando a cabeça com isso?")*\n🎙️ **Locução:** Pare de fazer isso do jeito difícil! \n\n⏱️ **0:03 - 0:07 [A REVELAÇÃO]**\n*(Corte rápido para transição dinâmica mostrando o(a) ${productName} em close premium)*\n🎙️ **Locução:** Conheça a única solução que você precisa para revolucionar seu dia.\n\n⏱️ **0:07 - 0:12 [OS BENEFÍCIOS]**\n*(Demonstração rápida do produto em ação / Letterings flutuantes com benefícios)*\n🎙️ **Locução:** Mais rápido, robusto e totalmente focado no seu resultado.\n\n⏱️ **0:12 - 0:15 [CTA - CHAMADA PARA AÇÃO]**\n*(Pessoa sorrindo, apontando para baixo. Texto: Link na Bio!)*\n🎙️ **Locução:** Quer saber como ter o seu? O link exclusivo está na nossa bio. Comente "QUERO" para receber no direct!`;
      } else {
        output = `📅 **CALENDÁRIO EDITORIAL SEMANAL GERADO POR IA**\n\n🎯 **Foco:** Promover ${productName}\n\n---\n\n📅 **SEGUNDA-FEIRA: Conteúdo de Topo de Funil (Consciência)**\n💡 **Post:** "3 erros que você comete ao tentar resolver [Dor do cliente]"\n📝 **Legenda:** Mostrar como o(a) ${productName} elimina esses gargalos.\n🎯 **CTA:** Salve esse post para não esquecer!\n\n📅 **QUARTA-FEIRA: Conteúdo de Meio de Funil (Consideração)**\n💡 **Post:** Carrossel explicativo mostrando os bastidores e os diferencias técnicos do projeto.\n📝 **Legenda:** Detalhar a tecnologia aplicada e a otimização de tempo.\n🎯 **CTA:** Marque um amigo que precisa ver isso!\n\n📅 **SEXTA-FEIRA: Conteúdo de Fundo de Funil (Conversão)**\n💡 **Post:** Prova social / Depoimento de cliente satisfeito com os resultados.\n📝 **Legenda:** Apresentar a transformação real obtida após o uso do(a) ${productName}.\n🎯 **CTA:** Clique no link da bio e fale com nossos consultores hoje mesmo!`;
      }

      setResult(output);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert('Texto copiado com sucesso!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* AI Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Inteligência Artificial de Marketing</h1>
          <p style={{ color: '#B5B5B5', fontSize: '0.9rem' }}>
            Gere legendas, roteiros, ideias e campanhas completas em segundos para alimentar suas demandas.
          </p>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px' }}>
        
        {/* Left Column: Input parameters */}
        <div className="card-premium" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#D4AF37', marginBottom: '18px', borderBottom: '1px solid #2A2A2A', paddingBottom: '10px' }}>
            Parâmetros de Criação
          </h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Objective Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                O que você deseja gerar?
              </label>
              <select 
                value={objective} 
                onChange={(e) => setObjective(e.target.value)}
                className="input-premium"
              >
                <option value="social">Legenda para Rede Social</option>
                <option value="reels">Roteiro de Reels / Shorts</option>
                <option value="calendar">Calendário Editorial Semanal</option>
              </select>
            </div>

            {/* Campaign / Product Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                Produto, Serviço ou Nome da Campanha
              </label>
              <input 
                type="text" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                className="input-premium" 
                placeholder="Ex: Hambúrguer de Costela Premium"
                required
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: '#B5B5B5' }}>
                Tom de Voz da IA
              </label>
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
                className="input-premium"
              >
                <option value="persuasivo">Persuasivo & Vendas</option>
                <option value="humanizado">Humanizado & Emocional</option>
                <option value="tecnico">Técnico & Corporativo</option>
                <option value="descontraido">Descontraído & Moderno</option>
              </select>
            </div>

            <button type="submit" className="btn-gold" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processando Criação...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i> Gerar Conteúdo
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: AI Output */}
        <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '14px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Resultado da IA</h3>
            {result && (
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleCopy}>
                <i className="far fa-copy"></i> Copiar Texto
              </button>
            )}
          </div>

          {/* Prompt output body */}
          <div style={{ 
            flex: 1, 
            backgroundColor: '#121212', 
            borderRadius: '6px', 
            border: '1px solid #2A2A2A',
            padding: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#fff',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#B5B5B5' }}>
                <i className="fas fa-brain fa-pulse" style={{ fontSize: '2.5rem', color: '#D4AF37' }}></i>
                <span>A IA está analisando sua solicitação e redigindo propostas exclusivas...</span>
              </div>
            ) : result ? (
              result
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#666', textAlign: 'center' }}>
                <i className="fas fa-robot" style={{ fontSize: '2.5rem' }}></i>
                <span>Preencha os parâmetros de criação à esquerda e clique em "Gerar Conteúdo" para ver a mágica acontecer.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
