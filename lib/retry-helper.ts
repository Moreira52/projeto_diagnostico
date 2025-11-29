/**
 * Utilitário para retentativas com backoff exponencial.
 * Projetado principalmente para lidar com Rate Limits (429/RESOURCE_EXHAUSTED) de APIs como Gemini.
 */

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
}

/**
 * Executa uma função assíncrona com retentativas automáticas em caso de erro de Rate Limit.
 * 
 * @param fn Função assíncrona a ser executada.
 * @param options Configurações de retentativa (maxRetries, initialDelay).
 * @returns O resultado da função fn.
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, initialDelay = 1000 } = options;
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;

            // Verifica se o erro é relacionado a Rate Limit (RESOURCE_EXHAUSTED ou 429)
            const isRateLimitError =
                error?.message?.includes('RESOURCE_EXHAUSTED') ||
                error?.status === 429 ||
                error?.code === 429;

            if (!isRateLimitError || attempt > maxRetries) {
                throw error;
            }

            // Calcula o tempo de espera: initialDelay * 2^(tentativa - 1)
            // Ex: 1000ms, 2000ms, 4000ms...
            const delay = initialDelay * Math.pow(2, attempt - 1);

            console.warn(
                `⚠️ Rate Limit detectado. Tentativa ${attempt}/${maxRetries}. Aguardando ${delay}ms...`
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
