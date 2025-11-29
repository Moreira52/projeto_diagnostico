import { env } from './env';

// Interfaces para a resposta da API BuiltWith
interface BuiltWithTechnology {
    Name: string;
    Description?: string;
    Link?: string;
    Tag: string; // Categoria principal
    FirstDetected: number; // Timestamp em ms
    LastDetected: number; // Timestamp em ms
    IsPremium?: string;
    Categories?: string[]; // Categorias adicionais
}

interface BuiltWithPath {
    Domain: string;
    Url: string;
    SubDomain: string;
    Technologies: BuiltWithTechnology[];
}

interface BuiltWithResult {
    IsDB: boolean;
    Spend?: number;
    Paths: BuiltWithPath[];
}

interface BuiltWithResponse {
    Results: Array<{
        Result: BuiltWithResult;
    }>;
    Errors?: Array<{
        Message: string;
    }>;
}

// Interfaces para o retorno da nossa função
export interface DetectedTechnology {
    name: string;
    category: string;
    firstDetected: string; // Data formatada
    lastDetected: string; // Data formatada
    categories: string[];
}

export interface TechnologyAnalysis {
    technologies: DetectedTechnology[];
    groupedByCategory: Record<string, DetectedTechnology[]>;
    totalTechnologies: number;
    lastUpdated: string;
    error?: string;
}

/**
 * Extrai o domínio limpo de uma URL (ex: https://www.exemplo.com.br/pagina -> exemplo.com.br)
 */
function extractDomain(url: string): string {
    try {
        // Adiciona protocolo se não existir para o URL constructor funcionar
        const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
        const hostname = new URL(urlWithProtocol).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        console.warn('Falha ao extrair domínio, usando string original:', url);
        return url;
    }
}

/**
 * Formata timestamp para data legível (pt-BR)
 */
function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Detecta tecnologias usadas em um site usando a API BuiltWith.
 * 
 * @param url URL completa ou domínio do site
 * @returns Análise detalhada das tecnologias encontradas
 */
export async function detectTechnologies(url: string): Promise<TechnologyAnalysis> {
    const domain = extractDomain(url);
    console.log(`🔍 Iniciando detecção de tecnologias para: ${domain}`);

    // Validação da API Key
    if (!env.BUILTWITH_API_KEY) {
        console.error('❌ BUILTWITH_API_KEY não configurada.');
        return {
            technologies: [],
            groupedByCategory: {},
            totalTechnologies: 0,
            lastUpdated: new Date().toISOString(),
            error: 'Chave de API BuiltWith não configurada.',
        };
    }

    try {
        // Rate Limiting: Aguarda 1 segundo para respeitar limites da API (especialmente Free Tier)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const apiUrl = `https://api.builtwith.com/v21/api.json?KEY=${env.BUILTWITH_API_KEY}&LOOKUP=${domain}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Erro na requisição BuiltWith: ${response.status} ${response.statusText}`);
        }

        const data: BuiltWithResponse = await response.json();

        // Verifica erros retornados pela API
        if (data.Errors && data.Errors.length > 0) {
            throw new Error(`Erro da API BuiltWith: ${data.Errors[0].Message}`);
        }

        // Processa os resultados
        // A API pode retornar múltiplos caminhos, pegamos o primeiro que contém tecnologias
        const result = data.Results?.[0]?.Result;
        const pathWithTech = result?.Paths?.find(p => p.Technologies && p.Technologies.length > 0);

        if (!pathWithTech || !pathWithTech.Technologies) {
            console.log('⚠️ Nenhuma tecnologia detectada para este domínio.');
            return {
                technologies: [],
                groupedByCategory: {},
                totalTechnologies: 0,
                lastUpdated: new Date().toISOString(),
            };
        }

        // Mapeia para nosso formato
        const technologies: DetectedTechnology[] = pathWithTech.Technologies.map(tech => ({
            name: tech.Name,
            category: tech.Tag,
            firstDetected: formatDate(tech.FirstDetected),
            lastDetected: formatDate(tech.LastDetected),
            categories: tech.Categories || [tech.Tag],
        }));

        // Agrupa por categoria
        const groupedByCategory: Record<string, DetectedTechnology[]> = {};
        technologies.forEach(tech => {
            const cat = tech.category || 'Outros';
            if (!groupedByCategory[cat]) {
                groupedByCategory[cat] = [];
            }
            groupedByCategory[cat].push(tech);
        });

        console.log(`✅ Detecção concluída: ${technologies.length} tecnologias encontradas.`);

        return {
            technologies,
            groupedByCategory,
            totalTechnologies: technologies.length,
            lastUpdated: new Date().toISOString(),
        };

    } catch (error: any) {
        console.error('❌ Erro ao detectar tecnologias:', error);
        return {
            technologies: [],
            groupedByCategory: {},
            totalTechnologies: 0,
            lastUpdated: new Date().toISOString(),
            error: error.message || 'Erro desconhecido ao buscar tecnologias.',
        };
    }
}
