/**
 * Módulo de gerenciamento e validação de variáveis de ambiente.
 * Garante que todas as chaves de API necessárias estejam presentes antes da execução.
 */

const requiredEnvs = [
    'GEMINI_API_KEY',
    'BUILTWITH_API_KEY',
    'PAGESPEED_API_KEY',
] as const;

type EnvConfig = Record<typeof requiredEnvs[number], string>;

function validateEnv(): EnvConfig {
    const missingEnvs: string[] = [];
    const config: Partial<EnvConfig> = {};

    for (const env of requiredEnvs) {
        const value = process.env[env];
        if (!value) {
            missingEnvs.push(env);
        } else {
            config[env] = value;
        }
    }

    if (missingEnvs.length > 0) {
        throw new Error(
            `❌ Variáveis de ambiente faltando: ${missingEnvs.join(', ')}\n` +
            `Verifique se o arquivo .env.local está configurado corretamente.`
        );
    }

    return config as EnvConfig;
}

/**
 * Objeto contendo as variáveis de ambiente validadas.
 * O acesso a env.NOME_DA_VARIAVEL é seguro e tipado.
 */
export const env = validateEnv();
