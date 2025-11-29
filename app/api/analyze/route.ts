import { NextResponse } from 'next/server';
import { formSchema } from '@/types/form-schema';
import { scrapeSite, type ScrapedData } from '@/lib/scraper';
import { detectTechnologies, type TechnologyAnalysis } from '@/lib/technology-detector';
import { analyzePerformance, type PerformanceMetrics } from '@/lib/performance-analyzer';
import { analyzeCRO, type CROAnalysis } from '@/lib/cro-analyzer';

// Tempo máximo de execução para Vercel Pro é 60s (Hobby é 10s).
// Para operações longas, recomenda-se processamento assíncrono (Queue/Polling).
export const maxDuration = 60;

export async function POST(request: Request) {
    const startTime = Date.now();
    const analysisId = crypto.randomUUID();

    console.log(`🚀 [${analysisId}] Iniciando nova análise...`);

    try {
        // 1. Parse e Validação do Body
        const body = await request.json();
        const validationResult = formSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Dados inválidos',
                    errors: validationResult.error.flatten()
                },
                { status: 400 }
            );
        }

        const { websiteUrl } = validationResult.data;
        console.log(`target: ${websiteUrl}`);

        // Resultados parciais
        let scrapedData: ScrapedData | null = null;
        let technologiesData: TechnologyAnalysis | null = null;
        let performanceData: PerformanceMetrics | null = null;
        let croAnalysis: CROAnalysis | null = null;

        const errors: Record<string, string> = {};

        // 2. Execução Sequencial das Etapas
        // Optamos por sequencial para evitar sobrecarga de recursos e facilitar debug,
        // mas Promise.all seria mais rápido se o hardware permitir.

        // a) Scraping (Puppeteer)
        try {
            console.time('scraping');
            scrapedData = await scrapeSite(websiteUrl);
            console.timeEnd('scraping');
        } catch (error: any) {
            console.error(`❌ [${analysisId}] Erro no Scraping:`, error);
            errors.scraping = error.message;
        }

        // b) Detecção de Tecnologias (BuiltWith)
        try {
            console.time('technologies');
            technologiesData = await detectTechnologies(websiteUrl);
            console.timeEnd('technologies');
        } catch (error: any) {
            console.error(`❌ [${analysisId}] Erro na Detecção de Tech:`, error);
            errors.technologies = error.message;
        }

        // c) Análise de Performance (PageSpeed)
        try {
            console.time('performance');
            performanceData = await analyzePerformance(websiteUrl);
            console.timeEnd('performance');
        } catch (error: any) {
            console.error(`❌ [${analysisId}] Erro na Performance:`, error);
            errors.performance = error.message;
        }

        // d) Análise de CRO (Gemini AI)
        // Só executa se tivermos dados suficientes (pelo menos scraping e performance)
        if (scrapedData && performanceData) {
            try {
                console.time('cro');
                // Se technologies falhou, passamos array vazio
                const techList = technologiesData?.technologies || [];

                croAnalysis = await analyzeCRO(scrapedData, techList, performanceData);
                console.timeEnd('cro');
            } catch (error: any) {
                console.error(`❌ [${analysisId}] Erro na Análise CRO:`, error);
                errors.cro = error.message;
            }
        } else {
            errors.cro = 'Análise de CRO pulada devido a falhas nas etapas anteriores (Scraping ou Performance).';
        }

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`✅ [${analysisId}] Análise finalizada em ${duration}s`);

        // 3. Montagem da Resposta
        return NextResponse.json({
            analysisId,
            status: 'completed',
            duration: `${duration}s`,
            data: {
                scrapedData: scrapedData ? { ...scrapedData, screenshot: '... (base64 omitido no log)' } : null, // Omitir base64 grande se for salvar logs
                // Na resposta real enviamos o screenshot
                screenshot: scrapedData?.screenshot,
                technologies: technologiesData,
                performance: performanceData,
                cro: croAnalysis,
            },
            errors: Object.keys(errors).length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error(`💥 [${analysisId}] Erro Crítico na API:`, error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Erro interno no servidor ao processar análise.',
                error: error.message
            },
            { status: 500 }
        );
    }
}
