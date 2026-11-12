'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { gerarIndicadores } from '@/lib/indicadores';
import { PRIORIDADES } from '@/lib/categorias';

// Painel da Cidade: mostra os indicadores de Business Intelligence (Cap. 02)
// e a Analise de Pareto 80/20 (Cap. 01) para ajudar a comunidade e a prefeitura.
export default function Painel() {
  const [listaOcorrencias, setListaOcorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch('/api/ocorrencias');
        if (resposta.ok) {
          const dados = await resposta.json();
          setListaOcorrencias(dados.ocorrencias || []);
        }
      } catch (erro) {
        console.error('Erro ao carregar dados do painel:', erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  if (carregando) {
    return (
      <p className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Carregando indicadores do painel...</span>
      </p>
    );
  }

  const indicadores = gerarIndicadores(listaOcorrencias);
  const maiorQuantidadePareto = indicadores.pareto.length > 0 ? indicadores.pareto[0].quantidade : 1;

  const cartoesResumo = [
    { rotulo: 'Problemas avisados', valor: indicadores.total },
    {
      rotulo: 'Resolvidos',
      valor: indicadores.resolvidas + ' (' + indicadores.taxaResolucao.toFixed(1) + '%)',
    },
    {
      rotulo: 'Impedem a passagem',
      valor: indicadores.impedemPassagem + ' (' + indicadores.percentualImpede.toFixed(1) + '%)',
    },
    { rotulo: 'Apoios da vizinhança', valor: indicadores.totalApoios },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold">Painel da cidade</h1>
        <p className="text-cidade-suave mt-1">
          Indicadores atualizados a cada relato para orientar a comunidade e o poder público sobre o que resolver
          primeiro.
        </p>
      </div>

      {/* Cartoes de indicadores (KPIs) */}
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cartoesResumo.map((cartao) => (
          <li key={cartao.rotulo} className="cartao p-5">
            <p className="text-cidade-suave font-semibold">{cartao.rotulo}</p>
            <p className="text-3xl font-extrabold mt-1">{cartao.valor}</p>
          </li>
        ))}
      </ul>

      {/* Analise de Pareto (Regra 80/20) */}
      <section className="cartao p-6">
        <h2 className="text-2xl font-bold">Quais problemas mais aparecem (Análise de Pareto 80/20)</h2>
        <p className="text-cidade-suave mt-1">
          Pela regra de Pareto que estudamos em Gestão da Qualidade, poucos tipos de problema concentram cerca de 80%
          das ocorrências.
        </p>

        {/* Barras visuais em CSS */}
        <div className="mt-5 space-y-3">
          {indicadores.pareto.map((item) => {
            const larguraBarra = Math.round((item.quantidade / maiorQuantidadePareto) * 100);
            return (
              <div key={item.id}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>{item.nome}</span>
                  <span>
                    {item.quantidade} ({item.percentual.toFixed(1)}%) - acumulado:{' '}
                    {item.percentualAcumulado.toFixed(1)}%
                  </span>
                </div>
                <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="barra-grafico h-full bg-cidade-primaria rounded-full"
                    style={{ width: `${larguraBarra}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
          <strong>Foco prioritário (80% dos relatos):</strong> {indicadores.vitais.join(', ')}.
        </p>

        {/* Tabela acessivel para leitores de tela */}
        <div className="overflow-x-auto mt-5">
          <table className="w-full text-left border-collapse">
            <caption className="text-left font-bold mb-2">Tabela detalhada da Análise de Pareto</caption>
            <thead>
              <tr className="border-b-2 border-cidade-borda">
                <th scope="col" className="py-2 pr-2">Tipo de problema</th>
                <th scope="col" className="py-2 pr-2">Quantidade</th>
                <th scope="col" className="py-2 pr-2">% do total</th>
                <th scope="col" className="py-2">% acumulado</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.pareto.map((item) => (
                <tr key={item.id} className="border-b border-cidade-borda">
                  <td className="py-2 pr-2 font-semibold">{item.nome}</td>
                  <td className="py-2 pr-2">{item.quantidade}</td>
                  <td className="py-2 pr-2">{item.percentual.toFixed(1)}%</td>
                  <td className="py-2">{item.percentualAcumulado.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fila de prioridade e Ranking de bairros */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="cartao p-6">
          <h2 className="text-2xl font-bold">Fila de prioridade (Top 5)</h2>
          <p className="text-cidade-suave mt-1 text-sm">
            Fórmula: Peso da urgência (Alta 30, Média 20, Baixa 10) + 15 se impede a passagem + (2 x apoios).
          </p>
          <ol className="mt-4 space-y-3">
            {indicadores.filaPrioridade.map((ocorrencia, indice) => (
              <li key={ocorrencia.protocolo} className="flex gap-3 items-start border-b border-cidade-borda pb-3">
                <span className="text-2xl font-extrabold text-cidade-primaria w-8">{indice + 1}º</span>
                <div className="flex-1">
                  <p className="font-bold">
                    {ocorrencia.nomeCategoria} - {ocorrencia.bairro}
                  </p>
                  <p className="text-sm text-cidade-suave">
                    {ocorrencia.referencia} | Urgência:{' '}
                    {PRIORIDADES[ocorrencia.prioridade] ? PRIORIDADES[ocorrencia.prioridade].nome : 'Média'}
                    {ocorrencia.impedePassagem ? ' | Impede a passagem' : ''} | {ocorrencia.apoios} apoios
                  </p>
                  <Link
                    href={`/acompanhar?protocolo=${ocorrencia.protocolo}`}
                    className="text-sm text-cidade-info underline"
                  >
                    Protocolo {ocorrencia.protocolo}
                  </Link>
                </div>
                <span className="font-extrabold text-lg">{ocorrencia.indice} pts</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="cartao p-6">
          <h2 className="text-2xl font-bold">Bairros com mais pendências</h2>
          <ol className="mt-4 space-y-2">
            {indicadores.rankingBairros.map((bairroItem, indice) => (
              <li key={bairroItem.nome} className="flex justify-between border-b border-cidade-borda pb-2">
                <span>
                  <strong>{indice + 1}º</strong> {bairroItem.nome}
                </span>
                <span className="font-bold">{bairroItem.quantidade} pendente(s)</span>
              </li>
            ))}
          </ol>

          <h3 className="text-xl font-bold mt-6">Situação geral dos avisos</h3>
          <ul className="mt-3 space-y-2">
            {indicadores.porSituacao.map((sit) => (
              <li key={sit.id} className="flex justify-between border-b border-cidade-borda pb-2">
                <span>{sit.nome}</span>
                <span className="font-bold">{sit.quantidade}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
