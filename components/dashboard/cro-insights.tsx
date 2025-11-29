import {
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    Download,
    ChevronDown,
    ChevronUp,
    Target,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CROAnalysis } from '@/lib/cro-analyzer';
import { getScoreColor } from '@/lib/chart-utils';

interface CROInsightsProps {
    analysis: CROAnalysis;
}

/**
 * Componente para exibir os resultados da análise de CRO gerada pela IA.
 * Inclui Score, Pontos Fortes, Oportunidades e Insights Estratégicos.
 */
export function CROInsights({ analysis }: CROInsightsProps) {
    const [expandedSection, setExpandedSection] = useState<'strengths' | 'opportunities' | 'insights' | 'all'>('all');

    const toggleSection = (section: 'strengths' | 'opportunities' | 'insights') => {
        setExpandedSection(prev => prev === section ? 'all' : section);
    };

    const scoreColor = getScoreColor(analysis.scoreCRO.nota);

    return (
        <div className="space-y-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">

            {/* Cabeçalho com Score */}
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                        <Target className="h-6 w-6 text-primary" />
                        Análise de Conversão (CRO)
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Diagnóstico gerado por IA com base em dados reais.
                    </p>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                    <div className="text-right">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Score CRO</p>
                        <p className="text-xs text-zinc-400 max-w-[150px] truncate" title={analysis.scoreCRO.justificativa}>
                            {analysis.scoreCRO.justificativa}
                        </p>
                    </div>
                    <div
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-xl font-bold"
                        style={{ borderColor: scoreColor, color: scoreColor }}
                    >
                        {analysis.scoreCRO.nota}
                    </div>
                </div>
            </div>

            {/* Seções de Conteúdo */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Pontos Fortes */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="mb-4 flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <h3 className="font-semibold">Pontos Fortes</h3>
                    </div>
                    <ul className="space-y-3">
                        {analysis.pontoFortes.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Oportunidades de Melhoria */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 md:col-span-2 lg:col-span-1">
                    <div className="mb-4 flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold">Oportunidades</h3>
                    </div>
                    <div className="space-y-4">
                        {analysis.oportunidadesMelhoria.map((op, idx) => (
                            <div key={idx} className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-zinc-200 text-sm">{op.titulo}</h4>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold",
                                        op.impacto === 'alto' ? 'bg-red-500/10 text-red-500' :
                                            op.impacto === 'médio' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-blue-500/10 text-blue-500'
                                    )}>
                                        {op.impacto}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {op.descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights Estratégicos */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 md:col-span-2 lg:col-span-1">
                    <div className="mb-4 flex items-center gap-2 text-purple-500">
                        <Lightbulb className="h-5 w-5" />
                        <h3 className="font-semibold">Estratégia</h3>
                    </div>
                    <div className="space-y-3">
                        {analysis.insightsEstrategicos.map((insight, idx) => (
                            <div key={idx} className="flex gap-3 rounded-lg bg-purple-500/5 p-3 border border-purple-500/10">
                                <TrendingUp className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
                                <p className="text-sm text-zinc-300 italic">
                                    "{insight}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Botão de Ação */}
            <div className="flex justify-end pt-4 border-t border-zinc-800">
                <button
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                    onClick={() => alert('Funcionalidade de exportação PDF em breve!')}
                >
                    <Download className="h-4 w-4" />
                    Exportar Relatório Completo
                </button>
            </div>
        </div>
    );
}
