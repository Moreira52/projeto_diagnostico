import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    className?: string;
}

/**
 * Componente de cartão para exibir métricas individuais no dashboard.
 * Exibe um ícone, valor principal, título e opcionalmente uma tendência.
 */
export function MetricCard({
    title,
    value,
    icon,
    trend,
    description,
    className,
}: MetricCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm transition-all hover:border-zinc-700 hover:shadow-md',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Container do Ícone com fundo sutil */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>

                    <div>
                        <p className="text-sm font-medium text-zinc-400">{title}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                            {value}
                        </h3>
                    </div>
                </div>

                {/* Indicador de Tendência (Opcional) */}
                {trend && (
                    <div
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            trend === 'up' && 'bg-green-500/10 text-green-500',
                            trend === 'down' && 'bg-red-500/10 text-red-500',
                            trend === 'neutral' && 'bg-zinc-500/10 text-zinc-500'
                        )}
                    >
                        {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                        {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                        {trend === 'neutral' && <Minus className="h-3 w-3" />}
                        <span className="capitalize">{trend}</span>
                    </div>
                )}
            </div>

            {/* Descrição (Opcional) */}
            {description && (
                <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Efeito de brilho no fundo (decorativo) */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        </div>
    );
}
