/**
 * Utilitários para formatação e configuração de gráficos (Recharts).
 * Garante consistência visual em todo o dashboard.
 */

// Paleta de cores do sistema
export const CHART_COLORS = {
    primary: '#E54801', // Laranja principal da marca
    secondary: '#3B82F6', // Azul para dados secundários
    success: '#22C55E', // Verde para métricas boas
    warning: '#EAB308', // Amarelo para alertas
    danger: '#EF4444', // Vermelho para erros/críticos
    neutral: '#71717A', // Cinza para dados neutros
    background: '#18181B', // Fundo escuro para tooltips
} as const;

/**
 * Formata um valor numérico para exibição em segundos (ex: 2.5s).
 * Útil para métricas de performance como LCP, FCP.
 */
export function formatSeconds(value: number): string {
    return `${value.toFixed(2)}s`;
}

/**
 * Formata um valor numérico para porcentagem (ex: 85%).
 * Útil para scores e taxas de conversão.
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
}

/**
 * Retorna a cor apropriada baseada em um score (0-100).
 * - Verde: >= 90
 * - Amarelo: >= 50
 * - Vermelho: < 50
 */
export function getScoreColor(score: number): string {
    if (score >= 90) return CHART_COLORS.success;
    if (score >= 50) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
}

/**
 * Prepara dados para gráfico de radar (ex: comparação de métricas).
 * Normaliza valores para escala 0-100.
 */
export function normalizeRadarData(data: Record<string, number>) {
    return Object.entries(data).map(([key, value]) => ({
        subject: key,
        A: value,
        fullMark: 100,
    }));
}

/**
 * Configuração padrão para Tooltips do Recharts (Dark Mode).
 */
export const TOOLTIP_STYLE = {
    backgroundColor: CHART_COLORS.background,
    border: '1px solid #27272A',
    borderRadius: '8px',
    color: '#FAFAFA',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};
