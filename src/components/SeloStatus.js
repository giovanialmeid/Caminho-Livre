import { SITUACOES } from '@/lib/categorias';

const CORES_SITUACAO = {
  aberto: 'bg-amber-100 text-amber-900 border-amber-300',
  em_analise: 'bg-blue-100 text-blue-900 border-blue-300',
  resolvido: 'bg-emerald-100 text-emerald-900 border-emerald-300',
};

// Mostra a situacao em texto claro (nao depende so da cor - WCAG 1.4.1)
export default function SeloStatus({ situacao }) {
  const cor = CORES_SITUACAO[situacao] || CORES_SITUACAO.aberto;
  const texto = SITUACOES[situacao] ? SITUACOES[situacao].nome : 'Recebido';

  return (
    <span className={`inline-block border rounded-full px-3 py-0.5 text-sm font-bold ${cor}`}>
      {texto}
    </span>
  );
}
