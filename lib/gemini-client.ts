import { GoogleGenAI } from '@google/genai';
import { env } from './env';

/**
 * Cliente configurado para a API do Google Gemini (Generative AI).
 * Utiliza o novo SDK unificado @google/genai.
 */

// Validação da chave de API é feita no módulo env.ts, mas reforçamos aqui.
if (!env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY não está configurada nas variáveis de ambiente.');
}

// Inicializa o cliente com a chave de API
export const genAI = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

/**
 * Modelos disponíveis e suas características:
 * 
 * 1. gemini-2.0-flash-exp (Recomendado para Velocidade)
 *    - O modelo mais rápido e eficiente.
 *    - Ideal para tarefas de alto volume e baixa latência.
 *    - Gratuito (atualmente em preview).
 *    - Rate Limit: 15 RPM (Requisições por Minuto).
 * 
 * 2. gemini-1.5-pro (Recomendado para Qualidade/Raciocínio)
 *    - Modelo mais capaz para tarefas complexas e raciocínio lógico.
 *    - Janela de contexto massiva (até 2M tokens).
 *    - Mais lento que o Flash.
 *    - Rate Limit: 2 RPM (no tier gratuito).
 * 
 * 3. gemini-1.5-flash (Balanceado)
 *    - Ótimo equilíbrio entre velocidade e capacidade.
 *    - Mais barato/eficiente que o Pro.
 *    - Rate Limit: 15 RPM.
 */

// Exporta constantes para facilitar o uso dos modelos corretos em toda a aplicação
export const MODELS = {
    FLASH_2_0: 'gemini-2.0-flash-exp',
    PRO_1_5: 'gemini-1.5-pro',
    FLASH_1_5: 'gemini-1.5-flash',
} as const;
