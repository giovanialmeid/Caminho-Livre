import { CATEGORIAS } from './categorias';

// Classificador local por palavras-chave (Plano B).
// Se a API do Gemini estiver sem chave ou fora do ar (erro 503),
// esta funcao analisa as palavras do texto para o morador nao ficar travado.

const PALAVRAS_URGENCIA = [
  'idoso', 'idosa', 'caiu', 'queda', 'perigo', 'risco', 'crianca', 'criança',
  'escola', 'hospital', 'posto de saude', 'posto de saúde', 'acidente', 'cadeirante', 'cego', 'bengala'
];

const PALAVRAS_IMPEDE = [
  'nao da pra passar', 'não dá pra passar', 'nao consigo passar', 'não consigo passar',
  'cadeira de rodas', 'cadeirante', 'carrinho de bebe', 'carrinho de bebê',
  'bengala', 'andador', 'muleta', 'andar na rua', 'bloqueada', 'bloqueando'
];

export function classificarPorPalavras(descricao) {
  var texto = descricao.toLowerCase();

  // Procura qual categoria tem mais palavras presentes no relato
  var categoriaEscolhida = 'outro';
  var maiorPontuacao = 0;

  for (var i = 0; i < CATEGORIAS.length; i++) {
    var cat = CATEGORIAS[i];
    var pontos = 0;

    for (var j = 0; j < cat.palavras.length; j++) {
      if (texto.includes(cat.palavras[j])) {
        pontos = pontos + 1;
      }
    }

    if (pontos > maiorPontuacao) {
      maiorPontuacao = pontos;
      categoriaEscolhida = cat.id;
    }
  }

  // Verifica se tem palavra de urgencia
  var ehUrgente = false;
  for (var k = 0; k < PALAVRAS_URGENCIA.length; k++) {
    if (texto.includes(PALAVRAS_URGENCIA[k])) {
      ehUrgente = true;
      break;
    }
  }

  // Verifica se impede a passagem
  var impedePassagem = false;
  if (categoriaEscolhida === 'sem_rampa') {
    impedePassagem = true;
  } else {
    for (var m = 0; m < PALAVRAS_IMPEDE.length; m++) {
      if (texto.includes(PALAVRAS_IMPEDE[m])) {
        impedePassagem = true;
        break;
      }
    }
  }

  var prioridade = 'media';
  if (ehUrgente || impedePassagem) {
    prioridade = 'alta';
  } else if (categoriaEscolhida === 'lixo_entulho' || categoriaEscolhida === 'outro') {
    prioridade = 'baixa';
  }

  return {
    categoria: categoriaEscolhida,
    prioridade: prioridade,
    impedePassagem: impedePassagem,
    resumo: 'Sugestão automática feita pelas palavras do relato. Confira e mude se precisar.',
    origem: 'regras',
  };
}
