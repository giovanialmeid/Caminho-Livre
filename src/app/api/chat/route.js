import { lerOcorrencias, ocultarDadosPessoais } from '@/lib/armazenamento';
import { gerarIndicadores } from '@/lib/indicadores';
import { buscarCategoria, SITUACOES } from '@/lib/categorias';

// Resposta local (Plano B) caso nao haja GEMINI_API_KEY ou a API falhe
function responderLocalmente(pergunta, lista, indicadores) {
  const texto = pergunta.toLowerCase();

  // Verifica se o cidadao digitou um numero de protocolo (ex: CL-2026-0001)
  const buscaProtocolo = pergunta.toUpperCase().match(/CL-\d{4}-\d{4}/);
  if (buscaProtocolo) {
    const codigo = buscaProtocolo[0];
    const encontrada = lista.find(function (o) {
      return o.protocolo === codigo;
    });

    if (!encontrada) {
      return 'Procurei o protocolo ' + codigo + ' e não encontrei. Confira os 4 últimos números na aba "Acompanhar protocolo".';
    }

    const nomeSituacao = SITUACOES[encontrada.situacao] ? SITUACOES[encontrada.situacao].nome : 'Recebido';
    return (
      'Encontrei o protocolo ' + encontrada.protocolo + '! ' +
      'Tipo: ' + buscarCategoria(encontrada.categoria).nome + ' no bairro ' + encontrada.bairro + ' (' + encontrada.referencia + '). ' +
      'Situação atual: ' + nomeSituacao + ', com ' + encontrada.apoios + ' apoio(s) da vizinhança.'
    );
  }

  if (texto.includes('prioridade') || texto.includes('indice') || texto.includes('índice') || texto.includes('fila')) {
    return (
      'No Caminho Livre, a fila é ordenada pelo impacto nas pessoas! ' +
      'A fórmula é: Índice = Peso da Urgência (Alta = 30, Média = 20, Baixa = 10) + 15 pontos se impede a passagem (cadeira de rodas, andador, bengala ou carrinho de bebê) + 2 pontos por cada vizinho que clica em "Eu também passo por isso".'
    );
  }

  if (texto.includes('problema') || texto.includes('pareto') || texto.includes('bairro') || texto.includes('cidade')) {
    return (
      'Hoje temos ' + indicadores.total + ' problemas avisados na cidade, sendo ' + indicadores.resolvidas + ' já resolvidos. ' +
      'Pela Análise de Pareto (80/20), os problemas mais frequentes são: ' + indicadores.vitais.join(', ') + '.'
    );
  }

  if (texto.includes('cpf') || texto.includes('nome') || texto.includes('anonimo') || texto.includes('anônimo') || texto.includes('lgpd')) {
    return (
      'Você não precisa informar nome, CPF, telefone ou e-mail! ' +
      'O aviso é anônimo (LGPD) e você acompanha tudo apenas pelo número de protocolo.'
    );
  }

  return (
    'Olá! Sou o Assistente do Caminho Livre. Hoje acompanhamos ' + indicadores.total + ' relatos na cidade (' + indicadores.resolvidas + ' resolvidos). ' +
    'Posso explicar como funciona a fila de prioridade, mostrar os dados da cidade ou consultar um protocolo (ex: CL-2026-0001)!'
  );
}

// Rota do Assistente Cidadao (mesma estrutura do /api/chat do Happy Games)
export async function POST(requisicao) {
  try {
    const corpo = await requisicao.json();
    const mensagem = ocultarDadosPessoais(corpo.mensagem || '');
    const historico = Array.isArray(corpo.historico) ? corpo.historico : [];

    if (!mensagem) {
      return Response.json({ erro: 'Digite uma pergunta para o assistente.' }, { status: 400 });
    }

    const lista = lerOcorrencias();
    const indicadores = gerarIndicadores(lista);

    // Se nao tiver chave de API configurada, responde com o Plano B local
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        resposta: responderLocalmente(mensagem, lista, indicadores),
      });
    }

    const resumoOcorrencias = lista
      .map(function (o) {
        return (
          o.protocolo + ': ' + buscarCategoria(o.categoria).curto +
          ' no bairro ' + o.bairro + ' (' + o.referencia + ') - Situação: ' + o.situacao +
          ', Urgência: ' + o.prioridade + ', Apoios: ' + o.apoios
        );
      })
      .join('\n');

    const promptSistema =
      'Você é o Assistente Cidadão do Caminho Livre, uma plataforma de zeladoria colaborativa e acessível.\n\n' +
      'BASE DE CONHECIMENTO (OCORRÊNCIAS REAIS DA CIDADE):\n' +
      resumoOcorrencias + '\n\n' +
      'REGRAS DO SISTEMA (Padrão ReAct):\n' +
      '1. Seja acolhedor, direto e use linguagem simples.\n' +
      '2. Nunca invente protocolos ou bairros que não estejam na lista acima.\n' +
      '3. Explique que a fila usa a fórmula: Peso da Urgência (Alta 30, Média 20, Baixa 10) + 15 se impede passagem + 2 por apoio.\n' +
      '4. Nunca peça dados pessoais (CPF, nome, e-mail ou telefone).';

    const conteudos = [];
    const historicoRecente = historico.slice(-6);

    for (var i = 0; i < historicoRecente.length; i++) {
      const item = historicoRecente[i];
      if (item.texto) {
        conteudos.push({
          role: item.remetente === 'usuario' ? 'user' : 'model',
          parts: [{ text: item.texto }],
        });
      }
    }

    conteudos.push({
      role: 'user',
      parts: [{ text: mensagem }],
    });

    const modelo = 'gemini-3.8-flash';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent';

    const respostaIA = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: promptSistema }] },
        contents: conteudos,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!respostaIA.ok) {
      return Response.json({
        resposta: responderLocalmente(mensagem, lista, indicadores),
      });
    }

    const dadosIA = await respostaIA.json();
    const textoResposta =
      dadosIA.candidates?.[0]?.content?.parts?.[0]?.text ||
      responderLocalmente(mensagem, lista, indicadores);

    return Response.json({ resposta: textoResposta });
  } catch (erro) {
    console.error('Erro na rota do assistente:', erro);
    return Response.json({ erro: 'Falha ao processar a pergunta.' }, { status: 500 });
  }
}
