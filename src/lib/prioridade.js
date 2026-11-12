import { PRIORIDADES } from './categorias';

// Calcula o indice de prioridade de cada ocorrencia (funcao de 1o grau):
//   indice = peso da prioridade + 15 (se impede passagem) + (2 * apoios)
// - peso: alta = 30, media = 20, baixa = 10
// - impede passagem: soma 15 pontos quando bloqueia cadeira de rodas,
//   andador, bengala ou carrinho de bebe
// - apoios: cada vizinho que confirma o problema soma 2 pontos
export function calcularIndice(ocorrencia) {
  if (ocorrencia.situacao === 'resolvido') {
    return 0;
  }

  var peso = 10;
  if (PRIORIDADES[ocorrencia.prioridade]) {
    peso = PRIORIDADES[ocorrencia.prioridade].peso;
  }

  var bonusPassagem = 0;
  if (ocorrencia.impedePassagem === true) {
    bonusPassagem = 15;
  }

  var quantidadeApoios = ocorrencia.apoios || 0;
  var indiceFinal = peso + bonusPassagem + (2 * quantidadeApoios);

  return indiceFinal;
}
