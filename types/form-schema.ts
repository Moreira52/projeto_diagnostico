import { z } from 'zod';

/**
 * Schema de validação para o formulário de diagnóstico.
 * Utiliza Zod para garantir a integridade dos dados antes do envio.
 */
export const formSchema = z.object({
    // Nome: Identificação do usuário.
    // Obrigatório, mínimo de 3 caracteres para evitar nomes muito curtos ou inválidos.
    name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),

    // Email: Principal canal de contato e envio do relatório.
    // Deve ser um formato de e-mail válido.
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),

    // Empresa: Nome da empresa ou organização.
    // Obrigatório, mínimo de 2 caracteres.
    empresa: z.string().min(2, { message: 'O nome da empresa deve ter pelo menos 2 caracteres.' }),

    // Website URL: O alvo do diagnóstico.
    // Deve ser uma URL válida e incluir o protocolo (http:// ou https://).
    websiteUrl: z
        .string()
        .url({ message: 'Insira uma URL válida (ex: https://www.exemplo.com.br).' })
        .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
            message: 'A URL deve começar com http:// ou https://',
        }),

    // Telefone: Contato secundário (WhatsApp/Telefone).
    // Opcional. Se preenchido, deve seguir estritamente o formato brasileiro de celular: (XX) XXXXX-XXXX.
    // A lógica .optional().or(z.literal('')) permite que o campo seja enviado vazio.
    phone: z
        .string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
            message: 'O telefone deve estar no formato (DD) 99999-9999',
        })
        .optional()
        .or(z.literal('')),
});

// Tipo TypeScript inferido automaticamente a partir do schema Zod.
// Isso garante que o tipo do formulário esteja sempre sincronizado com a validação.
export type FormSchema = z.infer<typeof formSchema>;
