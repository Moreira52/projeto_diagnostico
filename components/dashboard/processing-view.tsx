import { Activity, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingViewProps {
    progress: {
        current: number;
        total: number;
        percentage: number;
        currentStep: string;
    };
    estimatedTime?: number;
}

/**
 * Componente de visualização de progresso da análise.
 * Exibe barra de progresso, etapas concluídas e estimativa de tempo.
 * Inclui efeitos visuais especiais quando a IA entra em ação (>75%).
 */
export function ProcessingView({ progress, estimatedTime }: ProcessingViewProps) {
    const isAdvancedAI = progress.percentage >= 75;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center overflow-hidden relative">

            {/* Background Effects para IA Avançada */}
            {isAdvancedAI && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] animate-pulse rounded-full" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                </div>
            )}

            <div className="relative z-10 w-full max-w-md space-y-8">

                {/* Ícone Central Animado */}
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                    <div className={cn(
                        "absolute h-full w-full rounded-full opacity-75 transition-all duration-1000",
                        isAdvancedAI ? "bg-primary/30 animate-ping duration-700" : "bg-primary/20 animate-ping"
                    )} />

                    <div className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 border-2 transition-all duration-500",
                        isAdvancedAI
                            ? "border-primary shadow-[0_0_50px_rgba(229,72,1,0.8)] scale-110"
                            : "border-primary/50 shadow-[0_0_30px_-5px_rgba(229,72,1,0.5)]"
                    )}>
                        {isAdvancedAI ? (
                            <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
                        ) : (
                            <Activity className="h-10 w-10 text-primary animate-pulse" />
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className={cn(
                        "text-2xl font-bold transition-colors duration-500",
                        isAdvancedAI ? "text-primary drop-shadow-[0_0_10px_rgba(229,72,1,0.5)]" : "text-white"
                    )}>
                        {isAdvancedAI ? "Intensificando Análise com IA..." : "Analisando seu E-commerce"}
                    </h2>

                    <p className="text-zinc-400 animate-pulse font-medium">
                        {isAdvancedAI ? "Processando insights estratégicos avançados..." : progress.currentStep}
                    </p>

                    {/* Barra de Progresso */}
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800 border border-zinc-700">
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-out relative overflow-hidden",
                                isAdvancedAI ? "bg-primary shadow-[0_0_20px_rgba(229,72,1,1)]" : "bg-primary"
                            )}
                            style={{ width: `${progress.percentage}%` }}
                        >
                            {/* Efeito de brilho correndo na barra */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                        </div>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500 font-medium">
                        <span className={isAdvancedAI ? "text-primary" : ""}>{progress.percentage}% concluído</span>
                        {estimatedTime !== undefined && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                ~{estimatedTime}s restantes
                            </span>
                        )}
                    </div>
                </div>

                {/* Checklist de Etapas */}
                <div className="space-y-3 pt-6 text-left bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                    <StepItem
                        label="Coleta de Dados (Scraping)"
                        status={progress.current >= 1 ? 'completed' : 'pending'}
                    />
                    <StepItem
                        label="Detecção de Tecnologias"
                        status={progress.current >= 2 ? 'completed' : progress.current === 1 ? 'processing' : 'pending'}
                    />
                    <StepItem
                        label="Análise de Performance"
                        status={progress.current >= 3 ? 'completed' : progress.current === 2 ? 'processing' : 'pending'}
                    />
                    <StepItem
                        label="Inteligência Artificial (Gemini)"
                        status={progress.current >= 4 ? 'completed' : progress.current === 3 ? 'processing' : 'pending'}
                        isAi={true}
                        isActive={isAdvancedAI}
                    />
                </div>

                <p className="text-xs text-zinc-600 pt-4 max-w-xs mx-auto leading-relaxed">
                    Você pode fechar esta página e voltar depois. <br />
                    Sua análise continuará processando em segundo plano.
                </p>
            </div>
        </div>
    );
}

function StepItem({
    label,
    status,
    isAi = false,
    isActive = false
}: {
    label: string;
    status: 'pending' | 'processing' | 'completed';
    isAi?: boolean;
    isActive?: boolean;
}) {
    return (
        <div className={cn(
            "flex items-center gap-3 text-sm transition-all duration-500",
            status === 'completed' ? "text-green-500" :
                status === 'processing' ? (isAi && isActive ? "text-primary font-bold scale-105" : "text-white") :
                    "text-zinc-600"
        )}>
            {status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : status === 'processing' ? (
                <div className="relative h-4 w-4 shrink-0">
                    <div className={cn(
                        "absolute inset-0 rounded-full border-2 border-t-transparent animate-spin",
                        isAi && isActive ? "border-primary" : "border-white"
                    )} />
                </div>
            ) : (
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-zinc-700" />
            )}
            <span>{label}</span>
        </div>
    );
}
