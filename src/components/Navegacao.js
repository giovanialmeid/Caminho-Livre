'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Footprints } from 'lucide-react';

const LISTA_LINKS = [
  { caminho: '/', texto: 'Início' },
  { caminho: '/relatar', texto: 'Avisar um problema' },
  { caminho: '/ocorrencias', texto: 'Problemas da cidade' },
  { caminho: '/acompanhar', texto: 'Acompanhar protocolo' },
  { caminho: '/painel', texto: 'Painel' },
];

export default function Navegacao() {
  const caminhoAtual = usePathname();

  return (
    <header className="bg-white border-b border-cidade-borda">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-cidade-primaria font-extrabold text-xl rounded-lg">
          <Footprints className="w-7 h-7" />
          <span>Caminho Livre</span>
        </Link>

        <nav aria-label="Menu principal">
          <ul className="flex flex-wrap gap-1">
            {LISTA_LINKS.map((item) => {
              const ativo = item.caminho === '/' ? caminhoAtual === '/' : caminhoAtual.startsWith(item.caminho);
              return (
                <li key={item.caminho}>
                  <Link
                    href={item.caminho}
                    className={`block px-3 py-2 rounded-lg font-semibold min-h-[44px] leading-7 ${
                      ativo ? 'bg-cidade-primaria text-white' : 'text-cidade-texto hover:bg-slate-100'
                    }`}
                  >
                    {item.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
