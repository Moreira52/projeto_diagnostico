'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE, formatSeconds } from '@/lib/chart-utils';
import type { PerformanceMetrics } from '@/lib/performance-analyzer';

interface PerformanceChartProps {
    data: PerformanceMetrics;
}

/**
 * Limites (Thresholds) para Core Web Vitals (em segundos ou unidade adimensional).
 * Baseado nas diretrizes do Google (Good, Needs Improvement, Poor).
 */
const THRESHOLDS = {
    fcp: { good: 1.8, poor: 3.0 },
    lcp: { good: 2.5, poor: 4.0 },
    tti: { good: 3.8, poor: 7.3 },
    cls: { good: 0.1, poor: 0.25 },
    speedIndex: { good: 3.4, poor: 5.8 },
};

/**
 * Retorna a cor da barra baseada no valor e na métrica.
 */
function getMetricColor(metric: string, value: number): string {
    const limits = THRESHOLDS[metric as keyof typeof THRESHOLDS];
    if (!limits) return CHART_COLORS.neutral;

    if (value <= limits.good) return CHART_COLORS.success;
    if (value >= limits.poor) return CHART_COLORS.danger;
    return CHART_COLORS.warning;
}

/**
 * Gráfico de barras para visualizar as métricas de performance (Core Web Vitals).
 * Mostra FCP, LCP, TTI, CLS e Speed Index com cores indicativas de qualidade.
 */
export function PerformanceChart({ data }: PerformanceChartProps) {
    // Prepara os dados para o Recharts
    const chartData = [
        {
            name: 'FCP',
            fullName: 'First Contentful Paint',
            value: parseFloat(data.fcp),
            description: 'Tempo até o primeiro conteúdo aparecer.',
        },
        {
            name: 'LCP',
            fullName: 'Largest Contentful Paint',
            value: parseFloat(data.lcp),
            description: 'Tempo até o maior conteúdo ser renderizado.',
        },
        {
            name: 'TTI',
            fullName: 'Time to Interactive',
            value: parseFloat(data.tti),
            description: 'Tempo até a página se tornar totalmente interativa.',
        },
        {
            name: 'SI',
            fullName: 'Speed Index',
            value: parseFloat(data.speedIndex),
            description: 'Velocidade visual de carregamento da página.',
        },
        // CLS é removido daqui pois a escala é muito diferente (0-1 vs 0-10s)
        // Idealmente CLS deve ser mostrado em um card separado ou outro gráfico
    ];

    return (
        <div className="h-[350px] w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Métricas de Velocidade</h3>
                <p className="text-sm text-zinc-400">
                    Análise dos Core Web Vitals e tempos de carregamento.
                </p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />

                    <XAxis
                        type="number"
                        stroke="#71717A"
                        fontSize={12}
                        tickFormatter={(val) => `${val}s`}
                    />

                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#FAFAFA"
                        fontSize={12}
                        width={40}
                    />

                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value: number) => [formatSeconds(value), 'Tempo']}
                        labelStyle={{ color: '#E54801', fontWeight: 'bold', marginBottom: '4px' }}
                    />

                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getMetricColor(entry.name === 'SI' ? 'speedIndex' : entry.name.toLowerCase(), entry.value)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legenda Explicativa */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Bom</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>Médio</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Ruim</span>
                </div>
            </div>
        </div>
    );
}
