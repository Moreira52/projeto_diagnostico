import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tempo estimado total para o processo
const ESTIMATED_TOTAL_TIME = 90;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ analysisId: string }> }
) {
    const { analysisId } = await params;

    try {
        const analysis = await prisma.analysis.findUnique({
            where: { id: analysisId },
        });

        if (!analysis) {
            return NextResponse.json(
                { status: 'error', message: 'Análise não encontrada.' },
                { status: 404 }
            );
        }

        // Cálculo do Progresso
        let completedSteps = 0;
        const totalSteps = 4;
        let currentStepMessage = 'Iniciando...';

        if (analysis.scrapedData) {
            completedSteps++;
            currentStepMessage = 'Detectando tecnologias...';
        } else {
            currentStepMessage = 'Coletando dados do site...';
        }

        if (analysis.technologiesData) {
            completedSteps++;
            currentStepMessage = 'Analisando performance...';
        }

        if (analysis.performanceData) {
            completedSteps++;
            currentStepMessage = 'Gerando insights com IA...';
        }

        if (analysis.croInsights) {
            completedSteps++;
            currentStepMessage = 'Análise concluída!';
        }

        // Se houve erro, o progresso para
        if (analysis.status === 'error') {
            currentStepMessage = 'Erro no processamento.';
        }

        const percentage = Math.round((completedSteps / totalSteps) * 100);

        // Estimativa de tempo restante
        let estimatedTimeRemaining = null;
        if (analysis.status === 'processing') {
            const elapsedTime = (Date.now() - analysis.createdAt.getTime()) / 1000;
            estimatedTimeRemaining = Math.max(0, Math.round(ESTIMATED_TOTAL_TIME - elapsedTime));
        } else if (analysis.status === 'completed') {
            estimatedTimeRemaining = 0;
        }

        // Montagem da Resposta
        return NextResponse.json({
            id: analysis.id,
            status: analysis.status,
            progress: {
                current: completedSteps,
                total: totalSteps,
                percentage,
                currentStep: currentStepMessage,
            },
            data: {
                scrapedData: analysis.scrapedData ? JSON.parse(analysis.scrapedData) : null,
                technologiesData: analysis.technologiesData ? JSON.parse(analysis.technologiesData) : null,
                performanceData: analysis.performanceData ? JSON.parse(analysis.performanceData) : null,
                croInsights: analysis.croInsights ? JSON.parse(analysis.croInsights) : null,
            },
            error: analysis.errorMessage,
            completedAt: analysis.completedAt,
            estimatedTimeRemaining,
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0', // Evita cache para garantir dados frescos no polling
            }
        });

    } catch (error: any) {
        console.error(`💥 Erro ao buscar status da análise ${analysisId}:`, error);
        return NextResponse.json(
            { status: 'error', message: 'Erro interno ao buscar status.' },
            { status: 500 }
        );
    }
}
