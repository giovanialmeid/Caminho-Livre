'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThumbsUp, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { CATEGORIAS, SITUACOES, PRIORIDADES, buscarCategoria } from '@/lib/categorias';
import SeloStatus from '@/components/SeloStatus';

// Pagina que lista todos os problemas da cidade com busca, filtros e botao de apoio
// (mesma estrutura de filtragem da pagina catalogo/page.js do Happy Games)
export default function Ocorrencias() {
  const [listaOcorrencias, setListaOcorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemAviso, setMensagemAviso] = useState('');

  // Estados dos filtros
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('pendentes');
  const [ordenacao, setOrdenacao] = useState('prioridade');
  const [protocolosApoiados, setProtocolosApoiados] = useState([]);

  // Busca as ocorrencias da API quando a pagina carrega
  useEffect(() => {
    const salvos = localStorage.getItem('cl_apoiados');
    if (salvos) {
      try {
        setProtocolosApoiados(JSON.parse(salvos));
      } catch (e) {
        console.error('Erro ao ler apoios salvos:', e);
      }
    }

    async function carregarOcorrencias() {
      try {
        const resposta = await fetch('/api/ocorrencias');
        const dados = await resposta.json();
        if (resposta.ok) {
          setListaOcorrencias(dados.ocorrencias || []);
        } else {
          setMensagemErro(dados.erro || 'Não foi possível carregar os problemas.');
        }
      } catch (erro) {
        setMensagemErro('Erro de conexão ao carregar a lista.');
      } finally {
        setCarregando(false);
      }
    }
    carregarOcorrencias();
  }, []);

  // Funcao para apoiar um problema ("Eu também passo por isso")
  async function apoiarOcorrencia(protocolo) {
    setMensagemAviso('');
    try {
      const resposta = await fetch('/api/apoiar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolo: protocolo }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        setMensagemAviso(dados.erro || 'Não foi possível registrar seu apoio.');
        return;
      }

      // Atualiza o item na lista da tela
      setListaOcorrencias(function (listaAnterior) {
        return listaAnterior.map(function (item) {
          if (item.protocolo === protocolo) {
            return dados.ocorrencia;
          }
          return item;
        });
      });

      const novosApoiados = [...protocolosApoiados, protocolo];
      setProtocolosApoiados(novosApoiados);
      localStorage.setItem('cl_apoiados', JSON.stringify(novosApoiados));
      setMensagemAviso('Obrigado! Seu apoio ao protocolo ' + protocolo + ' foi somado na fila de prioridade.');
    } catch (erro) {
      setMensagemAviso('Não foi possível apoiar agora.');
    }
  }

  // Filtragem e ordenacao simples (mesmo padrao do catalogo/page.js do Happy Games)
  var ocorrenciasFiltradas = [...listaOcorrencias];

  // 1. Filtro por busca (bairro, rua ou descricao)
  if (busca.trim() !== '') {
    var termoBusca = busca.toLowerCase();
    ocorrenciasFiltradas = ocorrenciasFiltradas.filter(function (item) {
      var textoCompleto = (item.bairro + ' ' + item.referencia + ' ' + item.descricao).toLowerCase();
      return textoCompleto.includes(termoBusca);
    });
  }

  // 2. Filtro por tipo de problema (categoria)
  if (filtroCategoria !== '') {
    ocorrenciasFiltradas = ocorrenciasFiltradas.filter(function (item) {
      return item.categoria === filtroCategoria;
    });
  }

  // 3. Filtro por situacao
  if (filtroSituacao === 'pendentes') {
    ocorrenciasFiltradas = ocorrenciasFiltradas.filter(function (item) {
      return item.situacao !== 'resolvido';
    });
  } else if (filtroSituacao !== '') {
    ocorrenciasFiltradas = ocorrenciasFiltradas.filter(function (item) {
      return item.situacao === filtroSituacao;
    });
  }

  // 4. Ordenacao (mais urgentes primeiro ou mais recentes primeiro)
  if (ordenacao === 'prioridade') {
    ocorrenciasFiltradas.sort(function (a, b) {
      return b.indice - a.indice;
    });
  } else {
    ocorrenciasFiltradas.sort(function (a, b) {
      return new Date(b.criadoEm) - new Date(a.criadoEm);
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Problemas da cidade</h1>
      <p className="text-cidade-suave mt-1">
        Viu que alguém já avisou o mesmo problema da sua rua? Clique em <strong>&quot;Eu também passo por isso&quot;</strong>.
        Cada apoio soma +2 pontos na fila de prioridade.
      </p>

      {/* Filtros */}
      <div className="cartao p-4 mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor="campo-busca" className="rotulo">
            Buscar por bairro ou rua
          </label>
          <input
            id="campo-busca"
            type="text"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Ex: Mooca, escola..."
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="filtro-categoria" className="rotulo">
            Tipo do problema
          </label>
          <select
            id="filtro-categoria"
            value={filtroCategoria}
            onChange={(evento) => setFiltroCategoria(evento.target.value)}
            className="campo"
          >
            <option value="">Todos os tipos</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.curto}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-situacao" className="rotulo">
            Situação
          </label>
          <select
            id="filtro-situacao"
            value={filtroSituacao}
            onChange={(evento) => setFiltroSituacao(evento.target.value)}
            className="campo"
          >
            <option value="pendentes">Ainda não resolvidos</option>
            <option value="">Todos</option>
            <option value="aberto">{SITUACOES.aberto.nome}</option>
            <option value="em_analise">{SITUACOES.em_analise.nome}</option>
            <option value="resolvido">{SITUACOES.resolvido.nome}</option>
          </select>
        </div>

        <div>
          <label htmlFor="campo-ordem" className="rotulo">
            Ordenar por
          </label>
          <select
            id="campo-ordem"
            value={ordenacao}
            onChange={(evento) => setOrdenacao(evento.target.value)}
            className="campo"
          >
            <option value="prioridade">Mais urgentes primeiro</option>
            <option value="recentes">Mais recentes primeiro</option>
          </select>
        </div>
      </div>

      {mensagemAviso && (
        <p className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 font-semibold">{mensagemAviso}</p>
      )}

      {!carregando && !mensagemErro && (
        <p className="mt-4 text-cidade-suave">Mostrando {ocorrenciasFiltradas.length} problema(s).</p>
      )}

      {carregando && (
        <p className="mt-6 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando problemas da cidade...</span>
        </p>
      )}

      {mensagemErro && (
        <p className="mt-6 flex items-center gap-2 text-cidade-alerta font-semibold">
          <AlertTriangle className="w-5 h-5" />
          <span>{mensagemErro}</span>
        </p>
      )}

      <ul className="mt-4 grid md:grid-cols-2 gap-4">
        {ocorrenciasFiltradas.map((item) => {
          const jaApoiou = protocolosApoiados.includes(item.protocolo);
          const nomeUrgencia = PRIORIDADES[item.prioridade] ? PRIORIDADES[item.prioridade].nome : 'Média';

          return (
            <li key={item.protocolo} className="cartao p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">{buscarCategoria(item.categoria).curto}</h2>
                  <SeloStatus situacao={item.situacao} />
                </div>

                <p className="mt-2">{item.descricao}</p>

                <p className="mt-2 flex items-start gap-1.5 text-cidade-suave">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>
                    {item.referencia} - {item.bairro}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="border border-cidade-borda rounded-full px-3 py-0.5">Urgência: {nomeUrgencia}</span>
                  {item.impedePassagem && (
                    <span className="border border-amber-400 bg-amber-50 rounded-full px-3 py-0.5 font-semibold">
                      Impede a passagem
                    </span>
                  )}
                  {item.situacao !== 'resolvido' && (
                    <span className="border border-cidade-borda rounded-full px-3 py-0.5">
                      Índice de prioridade: {item.indice}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cidade-borda flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/acompanhar?protocolo=${item.protocolo}`}
                  className="text-cidade-info font-semibold underline"
                >
                  Protocolo {item.protocolo}
                </Link>

                {item.situacao !== 'resolvido' && (
                  <button
                    type="button"
                    onClick={() => apoiarOcorrencia(item.protocolo)}
                    disabled={jaApoiou}
                    className="botao-secundario py-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {jaApoiou ? 'Você apoiou' : 'Eu também passo por isso'} ({item.apoios})
                    </span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
