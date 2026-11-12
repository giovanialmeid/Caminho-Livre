// Lista oficial de categorias aceitas pelo sistema.
// Mesma ideia da trava do Happy Games (/api/recomendar): a IA so pode
// escolher um id que exista nesta lista.
export const CATEGORIAS = [
  {
    id: 'calcada_quebrada',
    nome: 'Calçada quebrada ou com buraco',
    curto: 'Calçada quebrada',
    palavras: ['buraco', 'quebrada', 'quebrado', 'rachada', 'desnivel', 'desnível', 'solta', 'afundada', 'raiz'],
  },
  {
    id: 'obstaculo_calcada',
    nome: 'Algo bloqueando a calçada (entulho, carro, mesa, poste)',
    curto: 'Calçada bloqueada',
    palavras: ['bloqueada', 'bloqueando', 'estacionado', 'carro na calcada', 'carro na calçada', 'mesa', 'cadeira', 'tapume'],
  },
  {
    id: 'sem_rampa',
    nome: 'Falta de rampa ou rampa danificada',
    curto: 'Sem rampa',
    palavras: ['rampa', 'cadeirante', 'cadeira de rodas', 'guia rebaixada', 'meio-fio', 'degrau'],
  },
  {
    id: 'iluminacao',
    nome: 'Iluminação pública apagada ou fraca',
    curto: 'Iluminação',
    palavras: ['luz', 'lampada', 'lâmpada', 'poste apagado', 'apagada', 'escuro', 'escura', 'iluminacao', 'iluminação', 'breu'],
  },
  {
    id: 'sinalizacao',
    nome: 'Faixa de pedestre, semáforo ou piso tátil com problema',
    curto: 'Sinalização',
    palavras: ['faixa', 'semaforo', 'semáforo', 'farol', 'sinal', 'piso tatil', 'piso tátil', 'placa', 'travessia', 'sonoro'],
  },
  {
    id: 'lixo_entulho',
    nome: 'Lixo ou entulho acumulado',
    curto: 'Lixo e entulho',
    palavras: ['lixo', 'entulho', 'sujeira', 'descarte', 'sofa', 'sofá', 'mau cheiro'],
  },
  {
    id: 'alagamento',
    nome: 'Alagamento ou bueiro entupido',
    curto: 'Alagamento',
    palavras: ['alagamento', 'alagada', 'enchente', 'bueiro', 'boca de lobo', 'agua parada', 'água parada', 'poça', 'chuva'],
  },
  {
    id: 'outro',
    nome: 'Outro problema no espaço público',
    curto: 'Outro',
    palavras: [],
  },
];

// Pesos de urgencia usados no calculo do indice de prioridade
export const PRIORIDADES = {
  alta: { nome: 'Alta', peso: 30 },
  media: { nome: 'Média', peso: 20 },
  baixa: { nome: 'Baixa', peso: 10 },
};

// Situacoes possiveis de cada ocorrencia
export const SITUACOES = {
  aberto: { nome: 'Recebido', ordem: 1 },
  em_analise: { nome: 'Em análise', ordem: 2 },
  resolvido: { nome: 'Resolvido', ordem: 3 },
};

// Procura uma categoria pelo id. Se nao achar, devolve "outro".
export function buscarCategoria(id) {
  for (var i = 0; i < CATEGORIAS.length; i++) {
    if (CATEGORIAS[i].id === id) {
      return CATEGORIAS[i];
    }
  }
  return CATEGORIAS[CATEGORIAS.length - 1];
}
