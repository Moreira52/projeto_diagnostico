import { DiagnosticForm } from '@/components/diagnostic-form';

/**
 * Página inicial da aplicação.
 * Renderiza o formulário de diagnóstico principal.
 *
 * A estrutura da página é mantida simples pois o componente DiagnosticForm
 * gerencia seu próprio layout responsivo (Split Screen no desktop, Stack no mobile).
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black">
      {/*
        O componente DiagnosticForm ocupa toda a tela e fornece a experiência visual completa.
        Ele inclui o header, descrição e o formulário interativo.
      */}
      <DiagnosticForm />
    </main>
  );
}
