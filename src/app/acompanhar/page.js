'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';
import { SITUACOES, PRIORIDADES, buscarCategoria } from '@/lib/categorias';
import SeloStatus from '@/components/SeloStatus';

// Componente interno que le os parametros da URL (mesmo padrao do obrigado/page.js do Happy Games)
function ConteudoAcompanhar() {
  const parametros = useSearchParams();
  const protocoloInicial = parametros.get('protocolo') || '';
  const acabouDeCriar = parametros.get('novo') === '1';

  const [protocoloDigitado, setProtocoloDigitado] = useState(protocoloInicial);
  const [ocorrenciaEncontrada, setOcorrenciaEncontrada] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Procura o protocolo na lista de ocorrencias da API
  async function buscarProtocolo(codigoParaBuscar) {
    const codigo = String(codigoParaBuscar || '').trim().toUpperCase();
    setMensagemErro('');
    setOcorrenciaEncontrada(null);

    if (!codigo) {
      setMensagemErro('Digite o número do protocolo (ex: CL-2026-0001).');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch('/api/ocorrencias');
      const dados = await resposta.json();
      const lista = dados.ocorrencias || [];

      const achou = lista.find(function (item) {
        return item.protocolo.toUpperCase() === codigo;
      });

      if (!achou) {
        setMensagemErro('Protocolo não encontrado. Confira se digitou no formato CL-2026-0001.');
      } else {
        setOcorrenciaEncontrada(achou);
      }
    } catch (erro) {
      setMensagemErro('Não foi possível consultar agora.');
    } finally {
      setCarregando(false);
    }
  }

  // Se ja veio com ?protocolo= na URL, consulta automaticamente ao abrir a pagina
  useEffect(() => {
    if (protocoloInicial) {
      buscarProtocolo(protocoloInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submeterConsulta(evento) {
    evento.preventDefault();
    buscarProtocolo(protocoloDigitado);
  }

  const ordemAtual =
    ocorrenciaEncontrada && SITUACOES[ocorrenciaEncontrada.situacao]
      ? SITUACOES[ocorrenciaEncontrada.situacao].ordem
      : 1;

  const listaEtapas = [
    { id: 'aberto', nome: SITUACOES.aberto.nome, ordem: 1 },
    { id: 'em_analise', nome: SITUACOES.em_analise.nome, ordem: 2 },
    { id: 'resolvido', nome: SITUACOES.resolvido.nome, ordem: 3 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold">Acompanhar protocolo</h1>
      <p className="text-cidade-suave mt-1">Digite o número que você recebeu quando avisou o problema.</p>

      {acabouDeCriar && ocorrenciaEncontrada && (
        <div className="mt-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
          <p className="text-xl font-bold text-cidade-primariaEscura">Aviso enviado com sucesso!</p>
          <p className="mt-1">
            Guarde o seu número de protocolo:{' '}
            <strong className="text-2xl">{ocorrenciaEncontrada.protocolo}</strong>
          </p>
          <p className="text-sm text-cidade-suave mt-1">
            Você não precisou informar nenhum dado pessoal. Use esse código para acompanhar quando quiser.
          </p>
        </div>
      )}

      <form onSubmit={submeterConsulta} className="cartao p-5 mt-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label htmlFor="campo-protocolo" className="rotulo">
            Número do protocolo
          </label>
          <input
            id="campo-protocolo"
            type="text"
            value={protocoloDigitado}
            onChange={(evento) => setProtocoloDigitado(evento.target.value)}
            placeholder="Ex: CL-2026-0001"
            className="campo uppercase"
          />
        </div>
        <button type="submit" disabled={carregando} className="botao-principal">
          {carregando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>Consultar</span>
        </button>
      </form>

      {mensagemErro && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-cidade-alerta font-semibold">
          <AlertTriangle className="w-5 h-5" />
          <span>{mensagemErro}</span>
        </p>
      )}

      {ocorrenciaEncontrada && (
        <div className="cartao p-6 mt-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl font-bold">{buscarCategoria(ocorrenciaEncontrada.categoria).nome}</h2>
            <SeloStatus situacao={ocorrenciaEncontrada.situacao} />
          </div>

          <p className="mt-3">{ocorrenciaEncontrada.descricao}</p>
          <p className="mt-2 text-cidade-suave">
            Local: {ocorrenciaEncontrada.referencia} - {ocorrenciaEncontrada.bairro}
          </p>
          <p className="mt-2 text-sm">
            Urgência:{' '}
            <strong>
              {PRIORIDADES[ocorrenciaEncontrada.prioridade]
                ? PRIORIDADES[ocorrenciaEncontrada.prioridade].nome
                : 'Média'}
            </strong>{' '}
            | Apoios da vizinhança: <strong>{ocorrenciaEncontrada.apoios}</strong>
            {ocorrenciaEncontrada.situacao !== 'resolvido' && (
              <span>
                {' '}
                | Índice de prioridade: <strong>{ocorrenciaEncontrada.indice}</strong>
              </span>
            )}
          </p>

          <h3 className="font-bold mt-6 mb-3">Andamento da solicitação</h3>
          <ol className="space-y-3">
            {listaEtapas.map((etapaItem) => {
              const concluida = etapaItem.ordem <= ordemAtual;
              return (
                <li key={etapaItem.id} className="flex items-center gap-3">
                  {concluida ? (
                    <CheckCircle2 className="w-6 h-6 text-cidade-primaria" />
                  ) : (
                    <Circle className="w-6 h-6 text-cidade-borda" />
                  )}
                  <span className={concluida ? 'font-bold' : 'text-cidade-suave'}>
                    {etapaItem.nome} {concluida ? '(concluído)' : '(pendente)'}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function Acompanhar() {
  return (
    <Suspense fallback={<p>Carregando consulta de protocolo...</p>}>
      <ConteudoAcompanhar />
    </Suspense>
  );
}
