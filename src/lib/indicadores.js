import { CATEGORIAS, SITUACOES, buscarCategoria } from './categorias';
import { calcularIndice } from './prioridade';

// Calcula os indicadores do Painel da Cidade (conceitos de BI do Cap. 02
// e Analise de Pareto 80/20 do Cap. 01) usando lacos for simples e ordenacao.
export function gerarIndicadores(lista) {
  var total = lista.length;
  var resolvidas = 0;
  var emAnalise = 0;
  var abertas = 0;
  var impedemPassagem = 0;
  var totalApoios = 0;

  // 1. Contagem geral das ocorrencias
  for (var i = 0; i < lista.length; i++) {
    var item = lista[i];
    if (item.situacao === 'resolvido') {
      resolvidas = resolvidas + 1;
    } else if (item.situacao === 'em_analise') {
      emAnalise = emAnalise + 1;
    } else {
      abertas = abertas + 1;
    }

    if (item.impedePassagem === true) {
      impedemPassagem = impedemPassagem + 1;
    }

    totalApoios = totalApoios + (item.apoios || 0);
  }

  var porSituacao = [
    { id: 'aberto', nome: SITUACOES.aberto.nome, quantidade: abertas },
    { id: 'em_analise', nome: SITUACOES.em_analise.nome, quantidade: emAnalise },
    { id: 'resolvido', nome: SITUACOES.resolvido.nome, quantidade: resolvidas },
  ];

  // 2. Contagem por categoria para montar o Diagrama de Pareto (80/20)
  var listaCategoriasContadas = [];
  for (var c = 0; c < CATEGORIAS.length; c++) {
    var categoriaAtual = CATEGORIAS[c];
    var qtdCategoria = 0;

    for (var j = 0; j < lista.length; j++) {
      if (lista[j].categoria === categoriaAtual.id) {
        qtdCategoria = qtdCategoria + 1;
      }
    }

    if (qtdCategoria > 0) {
      listaCategoriasContadas.push({
        id: categoriaAtual.id,
        nome: categoriaAtual.curto,
        quantidade: qtdCategoria,
      });
    }
  }

  // Ordena da categoria com mais problemas para a com menos problemas
  listaCategoriasContadas.sort(function (a, b) {
    return b.quantidade - a.quantidade;
  });

  // Calcula a porcentagem simples e a porcentagem acumulada (Pareto)
  var acumulado = 0;
  var pareto = [];
  var vitais = [];

  for (var p = 0; p < listaCategoriasContadas.length; p++) {
    var catItem = listaCategoriasContadas[p];
    acumulado = acumulado + catItem.quantidade;

    var percentual = total > 0 ? (catItem.quantidade / total) * 100 : 0;
    var percentualAcumulado = total > 0 ? (acumulado / total) * 100 : 0;

    pareto.push({
      id: catItem.id,
      nome: catItem.nome,
      quantidade: catItem.quantidade,
      percentual: percentual,
      percentualAcumulado: percentualAcumulado,
    });
  }

  // Pega as categorias que somam ate ~80% dos problemas
  for (var v = 0; v < pareto.length; v++) {
    vitais.push(pareto[v].nome);
    if (pareto[v].percentualAcumulado >= 80) {
      break;
    }
  }

  // 3. Contagem de problemas abertos por bairro
  var mapaBairros = {};
  for (var b = 0; b < lista.length; b++) {
    if (lista[b].situacao !== 'resolvido') {
      var nomeBairro = lista[b].bairro;
      if (!mapaBairros[nomeBairro]) {
        mapaBairros[nomeBairro] = 0;
      }
      mapaBairros[nomeBairro] = mapaBairros[nomeBairro] + 1;
    }
  }

  var nomesBairros = Object.keys(mapaBairros);
  var rankingBairros = [];
  for (var nb = 0; nb < nomesBairros.length; nb++) {
    var bairroChave = nomesBairros[nb];
    rankingBairros.push({
      nome: bairroChave,
      quantidade: mapaBairros[bairroChave],
    });
  }

  rankingBairros.sort(function (a, b) {
    return b.quantidade - a.quantidade;
  });
  rankingBairros = rankingBairros.slice(0, 5);

  // 4. Fila de prioridade: as 5 ocorrencias pendentes com maior indice
  var pendentes = [];
  for (var f = 0; f < lista.length; f++) {
    if (lista[f].situacao !== 'resolvido') {
      pendentes.push({
        ...lista[f],
        indice: calcularIndice(lista[f]),
        nomeCategoria: buscarCategoria(lista[f].categoria).curto,
      });
    }
  }

  pendentes.sort(function (a, b) {
    return b.indice - a.indice;
  });
  var filaPrioridade = pendentes.slice(0, 5);

  return {
    total: total,
    porSituacao: porSituacao,
    resolvidas: resolvidas,
    taxaResolucao: total > 0 ? (resolvidas / total) * 100 : 0,
    impedemPassagem: impedemPassagem,
    percentualImpede: total > 0 ? (impedemPassagem / total) * 100 : 0,
    totalApoios: totalApoios,
    pareto: pareto,
    vitais: vitais,
    rankingBairros: rankingBairros,
    filaPrioridade: filaPrioridade,
  };
}
