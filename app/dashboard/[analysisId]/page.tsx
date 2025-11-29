'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, Clock, Activity } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { TechnologiesList } from '@/components/dashboard/technologies-list';
import { CROInsights } from '@/components/dashboard/cro-insights';
import { ProcessingView } from '@/components/dashboard/processing-view';
import { cn } from '@/lib/utils';

// Tipos para os dados da análise
interface AnalysisData {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: {
        current: number;
        total: number;
        percentage: number;
        currentStep: string;
    };
    data: {
        scrapedData: any;
        technologiesData: any;
        performanceData: any;
        croInsights: any;
    };
    error?: string;
    estimatedTimeRemaining?: number;
}

/**
 * Página principal do Dashboard que gerencia o estado da análise (Polling).
 * Exibe Loading, Erro ou o Dashboard Completo.
 */
export default function DashboardPage({ params }: { params: Promise<{ analysisId: string }> }) {
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [isPolling, setIsPolling] = useState(true);
    const router = useRouter();
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Desembrulha params (Next.js 15)
    useEffect(() => {
        params.then((p) => setAnalysisId(p.analysisId));
    }, [params]);

    useEffect(() => {
        if (!analysisId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/analyze/${analysisId}`);

                if (res.status === 404) {
                    setIsPolling(false);
                    setAnalysisData({ status: 'error', error: 'Análise não encontrada.' } as any);
                    return;
                }

                const data = await res.json();
                setAnalysisData(data);

                // Lógica de parada do Polling
                if (data.status === 'completed' || data.status === 'error') {
                    setIsPolling(false);
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                }
            } catch (error) {
                console.error('Erro ao buscar status:', error);
            }
        };

        // Fetch inicial imediato
        fetchStatus();

        // Configura polling apenas se necessário
        if (isPolling) {
            pollingInterval.current = setInterval(fetchStatus, 3000);
        }

        // Cleanup ao desmontar ou parar polling
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [analysisId, isPolling]);

    // Renderização Condicional baseada no Status

    // 1. Loading Inicial (antes do primeiro fetch)
    if (!analysisData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Processando (Loading View com Progresso)
    if (analysisData.status === 'processing' || analysisData.status === 'pending') {
        return (
            <ProcessingView
                progress={analysisData.progress}
                estimatedTime={analysisData.estimatedTimeRemaining}
            />
        );
    }

    // 3. Erro
    if (analysisData.status === 'error') {
        return (
            <ErrorView
                message={analysisData.error || 'Ocorreu um erro desconhecido.'}
                onRetry={() => router.push('/')}
            />
        );
    }

    // 4. Dashboard Completo (Completed)
    return <CompletedDashboard data={analysisData.data} />;
}

// --- Sub-componentes ---


function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
            <div className="rounded-full bg-red-500/10 p-4 mb-6">
                <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Falha na Análise</h2>
            <p className="text-zinc-400 max-w-md mb-8">{message}</p>
            <button
                onClick={onRetry}
                className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
            >
                Tentar Novamente
            </button>
        </div>
    );
}

function CompletedDashboard({ data }: { data: any }) {
    const { performanceData, technologiesData, croInsights, scrapedData } = data;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-12">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-zinc-800 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Relatório de Diagnóstico</h1>
                    <p className="text-zinc-400">
                        Análise completa para <span className="text-primary font-medium">{scrapedData?.url}</span>
                    </p>
                </div>

                {/* KPIs Principais */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Performance Score"
                        value={performanceData.score}
                        icon={<Activity className="h-6 w-6" />}
                        trend={performanceData.score >= 90 ? 'up' : performanceData.score < 50 ? 'down' : 'neutral'}
                        description="Pontuação geral do PageSpeed"
                    />
                    <MetricCard
                        title="Tecnologias"
                        value={technologiesData.technologies.length}
                        icon={<Activity className="h-6 w-6" />}
                        description="Ferramentas detectadas"
                    />
                    <MetricCard
                        title="LCP"
                        value={`${performanceData.lcp}s`}
                        icon={<Clock className="h-6 w-6" />}
                        trend={parseFloat(performanceData.lcp) < 2.5 ? 'up' : 'down'}
                        description="Largest Contentful Paint"
                    />
                    <MetricCard
                        title="Score CRO"
                        value={croInsights.scoreCRO.nota}
                        icon={<Activity className="h-6 w-6" />}
                        trend="up"
                        description="Potencial de conversão"
                    />
                </div>

                {/* Gráficos e Listas */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <PerformanceChart data={performanceData} />
                    <TechnologiesList technologies={technologiesData.technologies} />
                </div>

                {/* Insights de IA (Full Width) */}
                <CROInsights analysis={croInsights} />

            </div>
        </div>
    );
}
