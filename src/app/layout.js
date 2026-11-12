import './globals.css';
import BarraAcessibilidade from '@/components/BarraAcessibilidade';
import Navegacao from '@/components/Navegacao';
import Rodape from '@/components/Rodape';
import AssistenteCidadao from '@/components/AssistenteCidadao';

// Informacoes da pagina
export const metadata = {
  title: 'Caminho Livre - Zeladoria Colaborativa e Acessível',
  description:
    'Avise em 1 minuto sobre calçadas quebradas, falta de rampa, postes apagados e outros problemas da cidade.',
};

// Componente principal que envolve toda a aplicacao
export default function LayoutPrincipal({ children }) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        {/* WCAG 2.4.1 - Atalho para teclado pular direto para o conteudo principal */}
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-3 focus:bg-cidade-info focus:text-white focus:font-bold focus:rounded-xl"
        >
          Pular para o conteúdo principal
        </a>
        <BarraAcessibilidade />
        <Navegacao />
        <main id="conteudo-principal" className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <Rodape />
        <AssistenteCidadao />
      </body>
    </html>
  );
}
