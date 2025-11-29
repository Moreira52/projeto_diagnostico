import { genAI, MODELS } from './gemini-client';
import type { ScrapedData } from './scraper';
import type { DetectedTechnology } from './technology-detector';
import type { PerformanceMetrics } from './performance-analyzer';

// Interface para a resposta estruturada da análise de CRO
export interface CROAnalysis {
    pontoFortes: string[];
    oportunidadesMelhoria: {
        titulo: string;
        descricao: string;
        impacto: 'alto' | 'médio' | 'baixo';
        prioridade: number; // 1-5
    }[];
    insightsEstrategicos: string[];
    scoreCRO: {
        nota: number; // 0-100
        justificativa: string;
    };
    error?: string;
}

/**
 * Analisa os dados coletados do e-commerce e gera um relatório de CRO usando IA.
 * 
 * @param scrapedData Dados extraídos da página (meta tags, conteúdo, etc)
 * @param technologiesData Tecnologias detectadas no site
 * @param performanceData Métricas de performance (Core Web Vitals)
 * @returns Análise estruturada de CRO
 */
export async function analyzeCRO(
    scrapedData: ScrapedData,
    technologiesData: DetectedTechnology[],
    performanceData: PerformanceMetrics
): Promise<CROAnalysis> {
    console.log('🧠 Iniciando análise de CRO com Gemini...');

    try {
        if (!scrapedData || !performanceData) {
            throw new Error('Dados insuficientes para análise de CRO.');
        }

        // 2. Construção do Prompt
        const prompt = `
<role>
Você é um especialista sênior em CRO (Conversion Rate Optimization) e UX especializado em e-commerce brasileiro.
Sua análise deve ser técnica, baseada em dados, mas acionável para donos de e-commerce.
</role>

<constraints>
1. Seja objetivo e baseie-se estritamente nos dados fornecidos.
2. Foque em oportunidades de alto impacto para aumento de conversão.
3. Considere o contexto do mercado brasileiro (meios de pagamento, frete, confiança).
4. Use linguagem profissional.
5. A resposta DEVE ser um JSON válido seguindo o schema solicitado.
</constraints>

<context>
## Dados do Site Analisado: ${scrapedData.url}

### Conteúdo e SEO On-page:
- Título: ${scrapedData.title}
- Descrição: ${scrapedData.metaDescription}
- Keywords: ${scrapedData.metaKeywords}
- Headings (H1-H3): ${JSON.stringify({ h1: scrapedData.headings.h1, h2: scrapedData.headings.h2, h3: scrapedData.headings.h3 })}
- Imagens sem Alt: ${scrapedData.images.withoutAlt} de ${scrapedData.images.total}
- Scripts Detectados: ${scrapedData.scripts.detected.join(', ')}

### Tecnologias Detectadas (Stack):
${JSON.stringify(technologiesData.map(t => `${t.name} (${t.category})`), null, 2)}

### Performance (Core Web Vitals):
- Performance Score: ${performanceData.score}/100
- FCP (First Contentful Paint): ${performanceData.fcp}
- LCP (Largest Contentful Paint): ${performanceData.lcp}
- CLS (Cumulative Layout Shift): ${performanceData.cls}
- TTI (Time to Interactive): ${performanceData.tti}
- Speed Index: ${performanceData.speedIndex}
</context>

<task>
Analise este e-commerce e forneça uma análise estruturada em JSON com o seguinte formato exato:

{
  "pontoFortes": [
    "descrição detalhada de até 5 pontos fortes identificados"
  ],
  "oportunidadesMelhoria": [
    {
      "titulo": "título da oportunidade",
      "descricao": "descrição detalhada do problema e da solução sugerida",
      "impacto": "alto|médio|baixo",
      "prioridade": 1-5 (sendo 5 a maior prioridade)
    }
  ],
  "insightsEstrategicos": [
    "3 insights estratégicos de negócio baseados na combinação de tecnologias e performance"
  ],
  "scoreCRO": {
    "nota": 0-100 (baseada na análise geral),
    "justificativa": "explicação curta da nota"
  }
}
</task>
`;

        // 3. Chamada à API (SDK @google/genai v0.1.0+)
        // A nova sintaxe usa models.generateContent diretamente na instância do cliente
        const response = await genAI.models.generateContent({
            model: MODELS.FLASH_1_5,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });

        // Log de uso de tokens
        console.log('📊 Tokens usados na análise:', {
            promptTokens: response.usageMetadata?.promptTokenCount,
            candidatesTokens: response.usageMetadata?.candidatesTokenCount,
            totalTokens: response.usageMetadata?.totalTokenCount
        });

        const text = response.text();

        if (!text) {
            throw new Error('Resposta vazia da IA.');
        }

        // 4. Parsing e Validação
        try {
            const analysis = JSON.parse(text) as CROAnalysis;
            return analysis;
        } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON da IA:', parseError);
            throw new Error('Falha ao processar resposta da IA.');
        }

    } catch (error: any) {
        console.error('❌ Erro na análise de CRO:', error);

        if (error.message?.includes('RESOURCE_EXHAUSTED')) {
            return getFallbackAnalysis(performanceData, 'Limite de requisições da IA excedido.');
        }

        return getFallbackAnalysis(performanceData, `Erro na análise inteligente: ${error.message}`);
    }
}

/**
 * Gera uma análise básica de fallback baseada apenas em regras estáticas de performance.
 */
function getFallbackAnalysis(performance: PerformanceMetrics, errorMessage: string): CROAnalysis {
    const pontosFortes: string[] = [];
    const oportunidades: { titulo: string; descricao: string; impacto: 'alto' | 'médio' | 'baixo'; prioridade: number }[] = [];

    if (performance.score >= 90) pontosFortes.push('Excelente pontuação de performance geral.');
    if (parseFloat(performance.cls) < 0.1) pontosFortes.push('Boa estabilidade visual (CLS).');

    if (performance.score < 50) {
        oportunidades.push({
            titulo: 'Melhorar Performance Geral',
            descricao: 'O site está muito lento, o que impacta severamente a conversão móvel.',
            impacto: 'alto',
            prioridade: 5
        });
    }

    return {
        pontoFortes: pontosFortes.length > 0 ? pontosFortes : ['Site acessível'],
        oportunidadesMelhoria: oportunidades.length > 0 ? oportunidades : [{
            titulo: 'Revisão Manual Necessária',
            descricao: 'Não foi possível gerar recomendações automáticas detalhadas no momento.',
            impacto: 'médio',
            prioridade: 3
        }],
        insightsEstrategicos: ['Monitore seus Core Web Vitals mensalmente.'],
        scoreCRO: {
            nota: performance.score,
            justificativa: 'Nota baseada puramente em métricas de performance devido a erro na análise detalhada.'
        },
        error: errorMessage
    };
}
