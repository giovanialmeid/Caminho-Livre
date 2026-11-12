import fs from 'fs';
import path from 'path';
import { calcularIndice } from './prioridade';

// Persistencia em arquivo JSON (conceito do Cap. 06 - "De voláteis a persistentes").
// Diferente do cadastro da pagina /sobre do Happy Games (que sumia ao apertar F5
// porque ficava so na memoria do React), aqui lemos e gravamos no arquivo
// data/ocorrencias.json no servidor.

const CAMINHO_ARQUIVO = path.join(process.cwd(), 'data', 'ocorrencias.json');

// Le a lista de ocorrencias do arquivo JSON
export function lerOcorrencias() {
  try {
    const textoArquivo = fs.readFileSync(CAMINHO_ARQUIVO, 'utf-8');
    const lista = JSON.parse(textoArquivo);
    return lista;
  } catch (erro) {
    console.error('Erro ao ler o arquivo ocorrencias.json:', erro);
    return [];
  }
}

// Salva a lista atualizada no arquivo JSON
export function salvarOcorrencias(lista) {
  try {
    const textoJson = JSON.stringify(lista, null, 2);
    fs.writeFileSync(CAMINHO_ARQUIVO, textoJson, 'utf-8');
  } catch (erro) {
    console.error('Erro ao salvar no arquivo ocorrencias.json:', erro);
  }
}

// Gera um numero de protocolo sequencial no formato CL-2026-0016
export function gerarProtocolo(lista) {
  const anoAtual = new Date().getFullYear();
  const proximoNumero = lista.length + 1;
  const numeroFormatado = String(proximoNumero).padStart(4, '0');
  return 'CL-' + anoAtual + '-' + numeroFormatado;
}

// Adiciona o indice calculado na ocorrencia antes de mandar para a tela
export function adicionarIndice(ocorrencia) {
  return {
    ...ocorrencia,
    indice: calcularIndice(ocorrencia),
  };
}

// Protecao de dados (LGPD): se a pessoa digitar e-mail ou CPF sem querer no
// relato, trocamos por [dado ocultado] antes de salvar ou enviar para a IA.
export function ocultarDadosPessoais(texto) {
  if (!texto) return '';
  var textoLimpo = String(texto).trim();
  // Oculta formato de e-mail
  textoLimpo = textoLimpo.replace(/\S+@\S+\.\S+/g, '[e-mail ocultado]');
  // Oculta formato de CPF (000.000.000-00)
  textoLimpo = textoLimpo.replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '[CPF ocultado]');
  return textoLimpo;
}
