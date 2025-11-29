import { env } from './env';

// Interfaces para a resposta da API do PageSpeed Insights (simplificada)
interface PageSpeedMetric {
    score: number;
    displayValue: string;
    numericValue: number;
}

interface PageSpeedAudit {
    id: string;
    title: string;
    description: string;
    score: number | null;
    displayValue?: string;
    numericValue?: number;
}

interface PageSpeedResponse {
    lighthouseResult: {
        categories: {
            performance: {
                score: number; // 0-1
            };
        };
        audits: {
            'first-contentful-paint': PageSpeedAudit;
            'largest-contentful-paint': PageSpeedAudit;
            'interactive': PageSpeedAudit; // TTI
            'cumulative-layout-shift': PageSpeedAudit;
            'speed-index': PageSpeedAudit;
            'total-blocking-time': PageSpeedAudit;
        };
    };
    error?: {
        message: string;
        code: number;
    };
}

// Interface de retorno da nossa função
export interface PerformanceMetrics {
    score: number; // 0-100
    fcp: string; // First Contentful Paint
    lcp: string; // Largest Contentful Paint
    tti: string; // Time to Interactive
    cls: string; // Cumulative Layout Shift
    speedIndex: string; // Speed Index
    tbt: string; // Total Blocking Time
    raw: {
        fcp: number;
        lcp: number;
        tti: number;
        cls: number;
        speedIndex: number;
        tbt: number;
    };
    error?: string;
}

/**
 * Analisa a performance de um site usando a API do Google PageSpeed Insights.
 * 
 * @param url URL completa do site a ser analisado
 * @param strategy 'mobile' ou 'desktop' (padrão: 'mobile')
 * @returns Métricas de performance e Core Web Vitals
 */
export async function analyzePerformance(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PerformanceMetrics> {
    console.log(`🚀 Iniciando análise de performance (${strategy}) para: ${url}`);

    if (!env.PAGESPEED_API_KEY) {
        console.error('❌ PAGESPEED_API_KEY não configurada.');
        return createErrorResult('Chave de API PageSpeed não configurada.');
    }

    try {
        // Timeout controller para abortar a requisição se demorar muito (60s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${env.PAGESPEED_API_KEY}&strategy=${strategy}&category=PERFORMANCE`;

        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Erro na API: ${response.status}`);
        }

        const data: PageSpeedResponse = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const audits = data.lighthouseResult.audits;
        const performanceScore = (data.lighthouseResult.categories.performance.score || 0) * 100;

        // Extração e formatação das métricas
        const metrics: PerformanceMetrics = {
            score: Math.round(performanceScore),

            // FCP: Tempo até o primeiro elemento ser renderizado
            fcp: audits['first-contentful-paint'].displayValue || 'N/A',

            // LCP: Tempo até o maior elemento visível ser renderizado (Core Web Vital)
            lcp: audits['largest-contentful-paint'].displayValue || 'N/A',

            // TTI: Tempo até a página estar totalmente interativa
            tti: audits['interactive'].displayValue || 'N/A',

            // CLS: Estabilidade visual da página (Core Web Vital)
            cls: audits['cumulative-layout-shift'].displayValue || '0',

            // Speed Index: Quão rápido o conteúdo é visível durante o carregamento
            speedIndex: audits['speed-index'].displayValue || 'N/A',

            // TBT: Total Blocking Time (Proxy para FID)
            tbt: audits['total-blocking-time'].displayValue || 'N/A',

            // Valores numéricos brutos para cálculos futuros se necessário
            raw: {
                fcp: audits['first-contentful-paint'].numericValue || 0,
                lcp: audits['largest-contentful-paint'].numericValue || 0,
                tti: audits['interactive'].numericValue || 0,
                cls: audits['cumulative-layout-shift'].numericValue || 0,
                speedIndex: audits['speed-index'].numericValue || 0,
                tbt: audits['total-blocking-time'].numericValue || 0,
            }
        };

        console.log(`✅ Análise de performance concluída. Score: ${metrics.score}`);
        return metrics;

    } catch (error: any) {
        console.error('❌ Erro na análise de performance:', error);

        const errorMessage = error.name === 'AbortError'
            ? 'A análise demorou muito tempo (timeout de 60s).'
            : error.message || 'Erro desconhecido na análise de performance.';

        return createErrorResult(errorMessage);
    }
}

/**
 * Helper para criar objeto de erro padronizado
 */
function createErrorResult(message: string): PerformanceMetrics {
    return {
        score: 0,
        fcp: '-',
        lcp: '-',
        tti: '-',
        cls: '-',
        speedIndex: '-',
        tbt: '-',
        raw: { fcp: 0, lcp: 0, tti: 0, cls: 0, speedIndex: 0, tbt: 0 },
        error: message,
    };
}
