'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { formSchema, type FormSchema } from '@/types/form-schema';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

export function DiagnosticForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            empresa: '',
            websiteUrl: '',
            phone: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Chamada à API de Análise
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao iniciar análise.');
            }

            // Redireciona para a página de dashboard/loading com o ID gerado
            router.push(`/dashboard/${data.analysisId}`);

        } catch (error: any) {
            console.error('Erro na submissão:', error);
            alert(`Erro: ${error.message}`); // Idealmente usar um Toast aqui
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Lado Esquerdo - Copy e Visual */}
            <div className="relative hidden lg:flex flex-col justify-center p-12 bg-zinc-900 overflow-hidden">
                {/* Efeito de fundo sutil */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(229,72,1,0.15),transparent_50%)]" />

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        IA de Diagnóstico V1.0
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight text-white mb-6">
                        Diagnóstico de E-commerce
                    </h1>

                    <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                        Identifique gargalos de performance, SEO e UX em segundos. Nossa IA analisa seu site e entrega um plano de ação personalizado para aumentar suas vendas.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Análise de Performance & Core Web Vitals',
                            'Auditoria de SEO Técnico e Conteúdo',
                            'Verificação de UX e Conversão',
                            'Relatório detalhado com plano de ação'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-zinc-300">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex flex-col justify-center p-6 lg:p-12 bg-black">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-2">Solicitar Diagnóstico Gratuito</h2>
                        <p className="text-zinc-400">Preencha os dados abaixo para iniciar a varredura.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                                Nome Completo <span className="text-primary">*</span>
                            </label>
                            <input
                                {...register('name')}
                                id="name"
                                type="text"
                                placeholder="Ex: João Silva"
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    errors.name && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                                )}
                            />
                            {errors.name && (
                                <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                E-mail Corporativo <span className="text-primary">*</span>
                            </label>
                            <input
                                {...register('email')}
                                id="email"
                                type="email"
                                placeholder="joao@empresa.com.br"
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    errors.email && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                                )}
                            />
                            {errors.email && (
                                <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Empresa */}
                        <div className="space-y-2">
                            <label htmlFor="empresa" className="text-sm font-medium text-zinc-300">
                                Nome da Empresa <span className="text-primary">*</span>
                            </label>
                            <input
                                {...register('empresa')}
                                id="empresa"
                                type="text"
                                placeholder="Sua Empresa Ltda"
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    errors.empresa && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                                )}
                            />
                            {errors.empresa && (
                                <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.empresa.message}
                                </p>
                            )}
                        </div>

                        {/* Website URL */}
                        <div className="space-y-2">
                            <label htmlFor="websiteUrl" className="text-sm font-medium text-zinc-300">
                                URL do Site <span className="text-primary">*</span>
                            </label>
                            <input
                                {...register('websiteUrl')}
                                id="websiteUrl"
                                type="url"
                                placeholder="https://www.sualoja.com.br"
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    errors.websiteUrl && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                                )}
                            />
                            {errors.websiteUrl && (
                                <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.websiteUrl.message}
                                </p>
                            )}
                        </div>

                        {/* Telefone */}
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                                WhatsApp / Telefone <span className="text-zinc-500 text-xs font-normal ml-1">(Opcional)</span>
                            </label>
                            <input
                                {...register('phone')}
                                id="phone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    errors.phone && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                                )}
                            />
                            {errors.phone && (
                                <p className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,72,1,0.3)] hover:shadow-[0_0_30px_rgba(229,72,1,0.5)]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    Iniciar Diagnóstico
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-zinc-500 mt-4">
                            Ao clicar em Iniciar, você concorda com nossos termos de uso e política de privacidade.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
