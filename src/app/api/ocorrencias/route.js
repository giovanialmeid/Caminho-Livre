import { CATEGORIAS, PRIORIDADES } from '@/lib/categorias';
import {
  lerOcorrencias,
  salvarOcorrencias,
  gerarProtocolo,
  adicionarIndice,
  ocultarDadosPessoais,
} from '@/lib/armazenamento';

// GET /api/ocorrencias -> devolve a lista de problemas ordenada pelo indice de prioridade
export async function GET() {
  const lista = lerOcorrencias();

  const listaComIndice = lista.map(function (ocorrencia) {
    return adicionarIndice(ocorrencia);
  });

  listaComIndice.sort(function (a, b) {
    return b.indice - a.indice;
  });

  return Response.json({ ocorrencias: listaComIndice });
}

// POST /api/ocorrencias -> salva um novo relato no arquivo ocorrencias.json
export async function POST(requisicao) {
  try {
    const corpo = await requisicao.json();

    const descricao = ocultarDadosPessoais(corpo.descricao || '');
    const bairro = (corpo.bairro || '').trim();
    const referencia = ocultarDadosPessoais(corpo.referencia || '');
    const resumo = (corpo.resumo || '').trim();

    // Validacao dos campos no servidor
    const categoriaValida = CATEGORIAS.find(function (c) {
      return c.id === corpo.categoria;
    });

    if (descricao.length < 10) {
      return Response.json({ erro: 'Descreva o problema com pelo menos 10 letras.' }, { status: 400 });
    }
    if (!categoriaValida) {
      return Response.json({ erro: 'Escolha um tipo de problema válido.' }, { status: 400 });
    }
    if (!PRIORIDADES[corpo.prioridade]) {
      return Response.json({ erro: 'Escolha uma urgência válida.' }, { status: 400 });
    }
    if (bairro.length < 2) {
      return Response.json({ erro: 'Informe o bairro.' }, { status: 400 });
    }
    if (referencia.length < 5) {
      return Response.json({ erro: 'Informe a rua ou um ponto de referência.' }, { status: 400 });
    }

    const lista = lerOcorrencias();
    const novoProtocolo = gerarProtocolo(lista);
    const dataAtual = new Date().toISOString();

    const novaOcorrencia = {
      protocolo: novoProtocolo,
      categoria: corpo.categoria,
      prioridade: corpo.prioridade,
      impedePassagem: corpo.impedePassagem === true,
      descricao: descricao,
      resumo: resumo,
      bairro: bairro,
      referencia: referencia,
      situacao: 'aberto',
      apoios: 0,
      origemClassificacao: corpo.origemClassificacao === 'ia' ? 'ia' : 'regras',
      criadoEm: dataAtual,
      atualizadoEm: dataAtual,
    };

    lista.push(novaOcorrencia);
    salvarOcorrencias(lista);

    return Response.json({ protocolo: novoProtocolo });
  } catch (erro) {
    console.error('Erro ao salvar ocorrência:', erro);
    return Response.json({ erro: 'Não conseguimos salvar seu aviso agora.' }, { status: 500 });
  }
}
