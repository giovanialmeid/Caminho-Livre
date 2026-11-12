import Link from 'next/link';
import { Megaphone, ClipboardList, BarChart3, Search, MessageSquareText, ListChecks, Wrench } from 'lucide-react';
import { lerOcorrencias } from '@/lib/armazenamento';

export const dynamic = 'force-dynamic';

// Dados reais do IBGE que mostram o tamanho do problema
const DADOS = [
  { numero: '18,8%', texto: 'dos moradores de áreas urbanas vivem em ruas com calçadas livres de obstáculos.', fonte: 'IBGE, Censo 2022 - Entorno dos Domicílios' },
  { numero: '15,2%', texto: 'vivem em ruas com rampa para cadeirantes.', fonte: 'IBGE, Censo 2022 - Entorno dos Domicílios' },
  { numero: '18,6 milhões', texto: 'de brasileiros com 2 anos ou mais têm algum tipo de deficiência.', fonte: 'IBGE, PNAD Contínua 2022' },
  { numero: '32,1 milhões', texto: 'de pessoas têm 60 anos ou mais no Brasil (15,6% da população).', fonte: 'IBGE, Censo 2022' },
];

export default async function Inicio() {
  let total = 0;
  let resolvidas = 0;
  try {
    const lista = await lerOcorrencias();
    total = lista.length;
    resolvidas = lista.filter((o) => o.status === 'resolvido').length;
  } catch {
    // Se o arquivo falhar, a pagina inicial continua funcionando sem os numeros
  }

  return (
    <div className="space-y-12">
      <section className="cartao p-6 md:p-10" aria-labelledby="titulo-inicio">
        <h1 id="titulo-inicio" className="text-3xl md:text-4xl font-extrabold leading-tight">
          Viu uma calçada quebrada, uma esquina sem rampa ou um poste apagado?
        </h1>
        <p className="mt-4 text-lg text-cidade-suave max-w-3xl">
          Avise em 1 minuto, sem cadastro. O Caminho Livre organiza os relatos da vizinhança e mostra quais problemas
          precisam ser resolvidos primeiro, dando prioridade ao que tira a autonomia de idosos e pessoas com deficiência.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/relatar" className="botao-principal text-lg">
            <Megaphone className="w-5 h-5" aria-hidden="true" /> Avisar um problema
          </Link>
          <Link href="/ocorrencias" className="botao-secundario text-lg">
            <ClipboardList className="w-5 h-5" aria-hidden="true" /> Ver problemas da cidade
          </Link>
        </div>
        {total > 0 && (
          <p className="mt-6 text-cidade-suave">
            Até agora: <strong className="text-cidade-texto">{total} problemas avisados</strong> e{' '}
            <strong className="text-cidade-texto">{resolvidas} resolvidos</strong>.
          </p>
        )}
      </section>

      <section aria-labelledby="titulo-como">
        <h2 id="titulo-como" className="text-2xl font-bold mb-4">Como funciona</h2>
        <ol className="grid md:grid-cols-3 gap-4">
          <li className="cartao p-5">
            <MessageSquareText className="w-8 h-8 text-cidade-primaria" aria-hidden="true" />
            <h3 className="font-bold text-lg mt-2">1. Conte o que aconteceu</h3>
            <p className="text-cidade-suave">Escreva do seu jeito ou fale pelo microfone. Não precisa saber termos técnicos.</p>
          </li>
          <li className="cartao p-5">
            <ListChecks className="w-8 h-8 text-cidade-primaria" aria-hidden="true" />
            <h3 className="font-bold text-lg mt-2">2. Confira a sugestão</h3>
            <p className="text-cidade-suave">O sistema sugere o tipo e a urgência do problema. Você confere e pode mudar.</p>
          </li>
          <li className="cartao p-5">
            <Wrench className="w-8 h-8 text-cidade-primaria" aria-hidden="true" />
            <h3 className="font-bold text-lg mt-2">3. Acompanhe pelo protocolo</h3>
            <p className="text-cidade-suave">Você recebe um número de protocolo e vê quando o problema entra em análise e é resolvido.</p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="titulo-dados">
        <h2 id="titulo-dados" className="text-2xl font-bold mb-4">Por que isso importa</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DADOS.map((dado) => (
            <li key={dado.numero} className="cartao p-5">
              <p className="text-3xl font-extrabold text-cidade-primaria">{dado.numero}</p>
              <p className="mt-1">{dado.texto}</p>
              <p className="mt-2 text-sm text-cidade-suave">Fonte: {dado.fonte}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid md:grid-cols-2 gap-4" aria-label="Outros atalhos">
        <Link href="/acompanhar" className="cartao p-5 flex items-center gap-4 hover:border-cidade-info">
          <Search className="w-8 h-8 text-cidade-primaria" aria-hidden="true" />
          <span>
            <span className="block font-bold text-lg">Acompanhar meu protocolo</span>
            <span className="text-cidade-suave">Veja em que etapa está o problema que você avisou.</span>
          </span>
        </Link>
        <Link href="/painel" className="cartao p-5 flex items-center gap-4 hover:border-cidade-info">
          <BarChart3 className="w-8 h-8 text-cidade-primaria" aria-hidden="true" />
          <span>
            <span className="block font-bold text-lg">Painel da cidade</span>
            <span className="text-cidade-suave">Números e prioridades para a comunidade e o poder público.</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
