import { CATEGORIAS, PRIORIDADES } from '@/lib/categorias';
import { classificarPorPalavras } from '@/lib/classificadorLocal';
import { ocultarDadosPessoais } from '@/lib/armazenamento';

// Rota de classificacao automatica usando IA (API do Google Gemini).
// Segue a mesma estrutura da rota /api/recomendar do Happy Games:
// 1) So manda o texto do problema pra API, ocultando e-mail ou CPF se houver (LGPD).
// 2) Confere no servidor se a categoria que a IA devolveu realmente existe
//    na nossa lista (anti-alucinacao).
// 3) Se nao tiver chave no .env.local ou a API falhar, usa o classificador
//    local por palavras-chave como plano B.
export async function POST(requisicao) {
  const corpo = await requisicao.json();
  const descricao = ocultarDadosPessoais(corpo.descricao || '');

  if (descricao.length < 10) {
    return Response.json(
      { erro: 'Conte um pouco mais sobre o problema (pelo menos 10 letras).' },
      { status: 400 }
    );
  }

  // Se nao tiver chave de API configurada, usa o classificador local (Plano B)
  if (!process.env.GEMINI_API_KEY) {
    const resultadoLocal = classificarPorPalavras(descricao);
    return Response.json(resultadoLocal);
  }

  const listaCategorias = CATEGORIAS.map(function (c) {
    return { id: c.id, nome: c.nome };
  });

  const promptSistema =
    'Você ajuda a classificar relatos de moradores sobre problemas em calçadas e espaços públicos. ' +
    'Você SÓ pode escolher uma categoria da lista abaixo: ' +
    JSON.stringify(listaCategorias) + '. ' +
    'Escolha também a prioridade ("alta", "media" ou "baixa") e diga se impede a passagem de cadeirantes ou idosos (true ou false). ' +
    'Responda SOMENTE em JSON no formato: {"categoria": "id", "prioridade": "alta", "impedePassagem": true, "resumo": "frase curta explicando a escolha"}.';

  const modelo = 'gemini-3.8-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent';

  try {
    const respostaIA = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: promptSistema }] },
        contents: [{ parts: [{ text: descricao }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: 'minimal' },
        },
      }),
    });

    if (!respostaIA.ok) {
      return Response.json(classificarPorPalavras(descricao));
    }

    const dadosIA = await respostaIA.json();
    const textoResposta = dadosIA.candidates[0].content.parts[0].text;
    const escolha = JSON.parse(textoResposta);

    // Confere se a categoria devolvida pela IA existe na nossa lista
    const categoriaValida = CATEGORIAS.find(function (c) {
      return c.id === escolha.categoria;
    });

    if (!categoriaValida || !PRIORIDADES[escolha.prioridade]) {
      return Response.json(classificarPorPalavras(descricao));
    }

    return Response.json({
      categoria: escolha.categoria,
      prioridade: escolha.prioridade,
      impedePassagem: escolha.impedePassagem === true,
      resumo: escolha.resumo || 'Sugestão feita pela IA. Confira e mude se precisar.',
      origem: 'ia',
    });
  } catch (erro) {
    console.error('Erro na classificação por IA, usando plano B:', erro);
    return Response.json(classificarPorPalavras(descricao));
  }
}
