import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS condicionalmente e resolve conflitos do Tailwind.
 *
 * Dependências utilizadas:
 * - clsx: Permite construir strings de classes condicionalmente (ex: cn('base', condition && 'active')).
 * - tailwind-merge: Resolve conflitos de classes do Tailwind (ex: cn('p-4', 'p-2') resulta em 'p-2' em vez de 'p-4 p-2').
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
