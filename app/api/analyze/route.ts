```
import { NextResponse } from 'next/server';
import { after } from 'next/server'; // Next.js 15+ experimental/RC
import { formSchema } from '@/types/form-schema';
import { prisma } from '@/lib/prisma';
import { scrapeSite } from '@/lib/scraper';
import { detectTechnologies } from '@/lib/technology-detector';
import { analyzePerformance } from '@/lib/performance-analyzer';
import { analyzeCRO } from '@/lib/cro-analyzer';

// Tempo estimado total para o processo (para feedback de UI)
const ESTIMATED_TOTAL_TIME = 90;

export async function POST(request: Request) {
  try {
    // 1. Parse e Validação do Body
    const body = await request.json();
    const validationResult = formSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { status: 'error', message: 'Dados inválidos', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, empresa, websiteUrl, phone } = validationResult.data;

    // 2. Criação do Registro no Banco de Dados (Status: Processing)
    const analysis = await prisma.analysis.create({
      data: {
        name,
        email,
        empresa,
        websiteUrl,
        phone,
        status: 'processing',
      },
    });

    console.log(`[${ analysis.id }] Análise iniciada para ${ websiteUrl } `);

    // 3. Processamento Assíncrono em Background
    // A função after() permite que o código continue rodando após a resposta ser enviada.
    // Isso é ideal para tarefas longas em serverless, evitando timeout da requisição inicial.
    after(async () => {
      await processAnalysis(analysis.id, websiteUrl);
    });

    // 4. Resposta Imediata
    return NextResponse.json({
      analysisId: analysis.id,
      status: 'processing',
      estimatedTime: ESTIMATED_TOTAL_TIME,
      message: 'Análise iniciada em background.',
    });

  } catch (error: any) {
    console.error('💥 Erro ao iniciar análise:', error);
    return NextResponse.json(
      { status: 'error', message: 'Erro interno ao iniciar análise.', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Função worker que executa todas as etapas da análise sequencialmente.
 * Atualiza o banco de dados a cada passo para permitir polling de progresso.
 */
async function processAnalysis(analysisId: string, websiteUrl: string) {
  console.log(`⚙️[${ analysisId }] Worker iniciado.`);
  
  try {
    // Etapa 1: Scraping
    console.time(`scraping - ${ analysisId } `);
    const scrapedData = await scrapeSite(websiteUrl);
    console.timeEnd(`scraping - ${ analysisId } `);

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        scrapedData: JSON.stringify(scrapedData),
        // Mantemos status processing
      }
    });

    // Etapa 2: Tecnologias
    console.time(`tech - ${ analysisId } `);
    const technologiesData = await detectTechnologies(websiteUrl);
    console.timeEnd(`tech - ${ analysisId } `);

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        technologiesData: JSON.stringify(technologiesData) 
      }
    });

    // Etapa 3: Performance
    // Rate Limit do PageSpeed é generoso, mas bom ter cuidado
    console.time(`perf - ${ analysisId } `);
    const performanceData = await analyzePerformance(websiteUrl);
    console.timeEnd(`perf - ${ analysisId } `);

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        performanceData: JSON.stringify(performanceData) 
      }
    });

    // Etapa 4: CRO com Gemini
    // Esta é a etapa mais crítica e cara
    console.time(`cro - ${ analysisId } `);
    const croInsights = await analyzeCRO(
      scrapedData, 
      technologiesData.technologies, // Passamos apenas o array de tecnologias
      performanceData
    );
    console.timeEnd(`cro - ${ analysisId } `);

    // Finalização com Sucesso
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        croInsights: JSON.stringify(croInsights),
        status: 'completed',
        completedAt: new Date()
      }
    });

    console.log(`[${ analysisId }] Análise concluída com sucesso!`);

  } catch (error: any) {
    console.error(`[${ analysisId }] Falha no worker: `, error);
    
    // Registro do erro no banco para o frontend saber
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        status: 'error',
        errorMessage: error.message || 'Erro desconhecido durante o processamento.'
      }
    });
  }
}
```
