import { lerOcorrencias, salvarOcorrencias, adicionarIndice } from '@/lib/armazenamento';

// POST /api/apoiar -> soma +1 apoio ("Eu também passo por isso") na ocorrencia
export async function POST(requisicao) {
  try {
    const corpo = await requisicao.json();
    const protocolo = String(corpo.protocolo || '').toUpperCase().trim();

    if (!protocolo) {
      return Response.json({ erro: 'Informe o protocolo.' }, { status: 400 });
    }

    const lista = lerOcorrencias();
    var posicao = -1;

    for (var i = 0; i < lista.length; i++) {
      if (lista[i].protocolo === protocolo) {
        posicao = i;
        break;
      }
    }

    if (posicao === -1) {
      return Response.json({ erro: 'Ocorrência não encontrada.' }, { status: 404 });
    }

    if (lista[posicao].situacao === 'resolvido') {
      return Response.json({ erro: 'Essa ocorrência já foi resolvida.' }, { status: 400 });
    }

    lista[posicao].apoios = (lista[posicao].apoios || 0) + 1;
    lista[posicao].atualizadoEm = new Date().toISOString();

    salvarOcorrencias(lista);

    return Response.json({ ocorrencia: adicionarIndice(lista[posicao]) });
  } catch (erro) {
    console.error('Erro ao registrar apoio:', erro);
    return Response.json({ erro: 'Não foi possível registrar seu apoio agora.' }, { status: 500 });
  }
}
