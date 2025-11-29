import { Layers, ShoppingCart, BarChart3, Code2, Server, Globe, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetectedTechnology } from '@/lib/technology-detector';

interface TechnologiesListProps {
    technologies: DetectedTechnology[];
}

/**
 * Mapeamento de ícones e cores por categoria de tecnologia.
 */
const CATEGORY_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
    'CMS': { icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'Ecommerce': { icon: ShoppingCart, color: 'text-green-500', bg: 'bg-green-500/10' },
    'Analytics': { icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'JavaScript Frameworks': { icon: Code2, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    'Web Server': { icon: Server, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    'CDN': { icon: Globe, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'default': { icon: Tag, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
};

/**
 * Obtém o estilo da categoria (ícone e cores).
 */
function getCategoryStyle(category: string) {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES['default'];
}

/**
 * Componente para listar as tecnologias detectadas no site.
 * Agrupa por categoria e exibe detalhes como versão e confiança.
 */
export function TechnologiesList({ technologies }: TechnologiesListProps) {
    // Ordena por categoria e depois por nome
    const sortedTechnologies = [...technologies].sort((a, b) => {
        if (a.category === b.category) return a.name.localeCompare(b.name);
        return a.category.localeCompare(b.category);
    });

    // Agrupa tecnologias por categoria
    const groupedTechnologies = sortedTechnologies.reduce((acc, tech) => {
        if (!acc[tech.category]) acc[tech.category] = [];
        acc[tech.category].push(tech);
        return acc;
    }, {} as Record<string, DetectedTechnology[]>);

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Stack Tecnológico</h3>
                <p className="text-sm text-zinc-400">
                    Ferramentas e frameworks identificados no site.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedTechnologies).map(([category, techs]) => {
                    const style = getCategoryStyle(category);
                    const Icon = style.icon;

                    return (
                        <div
                            key={category}
                            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700"
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <div className={cn("rounded-lg p-2", style.bg, style.color)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <h4 className="font-medium text-zinc-200">{category}</h4>
                            </div>

                            <div className="space-y-2">
                                {techs.map((tech) => (
                                    <div
                                        key={tech.name}
                                        className="flex items-center justify-between rounded-md bg-zinc-900/50 px-3 py-2 text-sm border border-zinc-800/50"
                                    >
                                        <span className="font-medium text-zinc-300">{tech.name}</span>
                                        {tech.version && (
                                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                                                v{tech.version}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {technologies.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-zinc-500">
                    Nenhuma tecnologia detectada.
                </div>
            )}
        </div>
    );
}
