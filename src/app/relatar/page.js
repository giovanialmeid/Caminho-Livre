'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, AlertTriangle, Send, X } from 'lucide-react';
import { CATEGORIAS, PRIORIDADES, buscarCategoria } from '@/lib/categorias';

// Pagina de avisar um problema - formulario dividido em 3 etapas
// (mesma estrutura do formulario de 3 etapas de compra/page.js do Happy Games):
//   Etapa 1: O que esta acontecendo? (texto livre ou exemplo clicavel)
//   Etapa 2: Confira o tipo e a urgencia (sugeridos pela IA, o morador pode mudar)
//   Etapa 3: Onde fica? -> abre modal de revisao (fecha no ESC) -> gera protocolo

const EXEMPLOS_PRONTOS = [
  'Tem um buraco grande na calçada e minha mãe quase caiu.',
  'A esquina não tem rampa e a cadeira de rodas não passa.',
  'O poste da minha rua está apagado faz uma semana.',
];

const LISTA_BAIRROS = [
  'Bela Vista',
  'Capão Redondo',
  'Centro',
  'Itaquera',
  'Lapa',
  'Liberdade',
  'Mooca',
  'Pinheiros',
];

export default function Relatar() {
  const roteador = useRouter();

  const [etapa, setEtapa] = useState(1);
  const [descricao, setDescricao] = useState('');
  const [sugestaoIA, setSugestaoIA] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [impedePassagem, setImpedePassagem] = useState(false);
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // WCAG 2.1.1 - Fecha o modal de confirmacao ao apertar a tecla Escape
  useEffect(() => {
    function tratarTecla(evento) {
      if (evento.key === 'Escape' && mostrarConfirmacao) {
        setMostrarConfirmacao(false);
      }
    }
    window.addEventListener('keydown', tratarTecla);
    return () => window.removeEventListener('keydown', tratarTecla);
  }, [mostrarConfirmacao]);

  // Etapa 1 -> chama a rota /api/classificar e avanca para a Etapa 2
  async function avancarParaEtapa2() {
    setMensagemErro('');
    if (descricao.trim().length < 10) {
      setMensagemErro('Conte um pouco mais sobre o problema (pelo menos 10 letras).');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch('/api/classificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: descricao }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(dados.erro || 'Não foi possível analisar o relato.');
      } else {
        setSugestaoIA(dados);
        setCategoria(dados.categoria);
        setPrioridade(dados.prioridade);
        setImpedePassagem(dados.impedePassagem);
        setEtapa(2);
      }
    } catch (erro) {
      setMensagemErro('Erro ao conversar com o servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // Etapa 2 -> confere se tem categoria escolhida e vai para a Etapa 3
  function avancarParaEtapa3() {
    setMensagemErro('');
    if (!categoria) {
      setMensagemErro('Escolha o tipo do problema.');
      return;
    }
    setEtapa(3);
  }

  // Etapa 3 -> valida bairro e rua e abre o modal de confirmacao
  function abrirModalRevisao(evento) {
    evento.preventDefault();
    setMensagemErro('');

    if (bairro.trim().length < 2) {
      setMensagemErro('Informe o bairro.');
      return;
    }
    if (referencia.trim().length < 5) {
      setMensagemErro('Informe a rua ou um ponto de referência (pelo menos 5 letras).');
      return;
    }

    setMostrarConfirmacao(true);
  }

  // Confirma no modal, salva na API e vai para a pagina de protocolo
  async function confirmarEnvio() {
    setCarregando(true);
    setMensagemErro('');

    try {
      const resposta = await fetch('/api/ocorrencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: descricao,
          categoria: categoria,
          prioridade: prioridade,
          impedePassagem: impedePassagem,
          resumo: sugestaoIA ? sugestaoIA.resumo : '',
          origemClassificacao: sugestaoIA ? sugestaoIA.origem : 'regras',
          bairro: bairro,
          referencia: referencia,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMostrarConfirmacao(false);
        setMensagemErro(dados.erro || 'Não foi possível enviar seu aviso.');
        setCarregando(false);
      } else {
        // Manda apenas o numero do protocolo na URL (sem dados pessoais - LGPD)
        roteador.push('/acompanhar?protocolo=' + dados.protocolo + '&novo=1');
      }
    } catch (erro) {
      setMostrarConfirmacao(false);
      setMensagemErro('Erro ao salvar seu aviso. Tente de novo.');
      setCarregando(false);
    }
  }

  const nomeCategoriaEscolhida = buscarCategoria(categoria).nome;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold">Avisar um problema</h1>
      <p className="text-cidade-suave mt-1">Leva cerca de 1 minuto. Você não precisa se identificar.</p>

      {/* Barra de progresso das 3 etapas */}
      <div className="mt-6 mb-4">
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
          <div
            className="bg-cidade-primaria h-full transition-all duration-300"
            style={{ width: `${(etapa / 3) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm font-bold text-cidade-suave">
          <span className={etapa >= 1 ? 'text-cidade-primaria' : ''}>1. O que aconteceu</span>
          <span className={etapa >= 2 ? 'text-cidade-primaria' : ''}>2. Tipo do problema</span>
          <span className={etapa >= 3 ? 'text-cidade-primaria' : ''}>3. Local</span>
        </div>
      </div>

      <div className="cartao p-6">
        {/* ETAPA 1: DESCRICAO DO PROBLEMA */}
        {etapa === 1 && (
          <div>
            <h2 className="text-2xl font-bold">1. O que está acontecendo?</h2>
            <label htmlFor="campo-descricao" className="rotulo mt-4">
              Descreva o problema com suas palavras
            </label>
            <p className="text-sm text-cidade-suave mb-2">
              Não escreva seu nome, CPF ou e-mail. Se escrever sem querer, o sistema oculta automaticamente.
            </p>
            <textarea
              id="campo-descricao"
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
              maxLength={500}
              rows={4}
              className="campo"
              placeholder="Ex: Tem um buraco grande na calçada em frente ao ponto de ônibus."
            />
            <p className="text-sm text-cidade-suave text-right mt-1">{descricao.length} / 500 letras</p>

            <div className="mt-4">
              <p className="font-bold mb-2">Sem ideia de como escrever? Clique em um exemplo:</p>
              <div className="flex flex-col gap-2">
                {EXEMPLOS_PRONTOS.map((exemplo, indice) => (
                  <button
                    key={indice}
                    type="button"
                    onClick={() => setDescricao(exemplo)}
                    className="text-left border border-cidade-borda rounded-xl px-4 py-3 hover:border-cidade-info bg-slate-50"
                  >
                    {exemplo}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={avancarParaEtapa2} disabled={carregando} className="botao-principal">
                {carregando ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                <span>{carregando ? 'Analisando com a IA...' : 'Continuar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: CONFERIR SUGESTAO DA IA */}
        {etapa === 2 && (
          <div>
            <h2 className="text-2xl font-bold">2. Confira o tipo do problema</h2>

            {sugestaoIA && (
              <div className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <p className="flex items-center gap-2 font-bold text-blue-900">
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {sugestaoIA.origem === 'ia'
                      ? 'Sugestão feita por Inteligência Artificial'
                      : 'Sugestão automática por palavras-chave'}
                  </span>
                </p>
                <p className="mt-1">{sugestaoIA.resumo}</p>
                <p className="mt-1 text-sm text-cidade-suave">
                  Você continua no controle: pode mudar qualquer opção abaixo se preferir.
                </p>
              </div>
            )}

            <div className="mt-5">
              <p className="rotulo">Tipo do problema</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {CATEGORIAS.map((itemCategoria) => (
                  <label
                    key={itemCategoria.id}
                    className={`flex items-start gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                      categoria === itemCategoria.id
                        ? 'border-cidade-primaria bg-emerald-50'
                        : 'border-cidade-borda bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoria"
                      value={itemCategoria.id}
                      checked={categoria === itemCategoria.id}
                      onChange={() => setCategoria(itemCategoria.id)}
                      className="mt-1.5 w-5 h-5"
                    />
                    <span>{itemCategoria.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="rotulo">Qual a urgência?</p>
              <div className="flex flex-wrap gap-2">
                <label
                  className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                    prioridade === 'alta' ? 'border-cidade-primaria bg-emerald-50' : 'border-cidade-borda bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="prioridade"
                    checked={prioridade === 'alta'}
                    onChange={() => setPrioridade('alta')}
                    className="w-5 h-5"
                  />
                  <span>Alta</span>
                </label>

                <label
                  className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                    prioridade === 'media' ? 'border-cidade-primaria bg-emerald-50' : 'border-cidade-borda bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="prioridade"
                    checked={prioridade === 'media'}
                    onChange={() => setPrioridade('media')}
                    className="w-5 h-5"
                  />
                  <span>Média</span>
                </label>

                <label
                  className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer ${
                    prioridade === 'baixa' ? 'border-cidade-primaria bg-emerald-50' : 'border-cidade-borda bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="prioridade"
                    checked={prioridade === 'baixa'}
                    onChange={() => setPrioridade('baixa')}
                    className="w-5 h-5"
                  />
                  <span>Baixa</span>
                </label>
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 border-2 border-amber-300 bg-amber-50 rounded-xl px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={impedePassagem}
                onChange={(evento) => setImpedePassagem(evento.target.checked)}
                className="mt-1.5 w-5 h-5"
              />
              <span>
                <strong>Esse problema impede a passagem</strong> de quem usa cadeira de rodas, andador, bengala ou
                carrinho de bebê, ou obriga a pessoa a andar na rua?
              </span>
            </label>

            <div className="mt-6 flex justify-between gap-2">
              <button type="button" onClick={() => setEtapa(1)} className="botao-secundario">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              <button type="button" onClick={avancarParaEtapa3} className="botao-principal">
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: BAIRRO E RUA */}
        {etapa === 3 && (
          <form onSubmit={abrirModalRevisao}>
            <h2 className="text-2xl font-bold">3. Onde fica?</h2>

            <label htmlFor="campo-bairro" className="rotulo mt-4">
              Bairro
            </label>
            <input
              id="campo-bairro"
              type="text"
              value={bairro}
              onChange={(evento) => setBairro(evento.target.value)}
              maxLength={60}
              list="sugestoes-bairros"
              placeholder="Ex: Bela Vista"
              className="campo"
            />
            <datalist id="sugestoes-bairros">
              {LISTA_BAIRROS.map((nomeBairro) => (
                <option key={nomeBairro} value={nomeBairro} />
              ))}
            </datalist>

            <label htmlFor="campo-referencia" className="rotulo mt-4">
              Rua ou ponto de referência
            </label>
            <input
              id="campo-referencia"
              type="text"
              value={referencia}
              onChange={(evento) => setReferencia(evento.target.value)}
              maxLength={150}
              placeholder="Ex: Rua das Flores, em frente à padaria"
              className="campo"
            />

            <div className="mt-6 flex justify-between gap-2">
              <button type="button" onClick={() => setEtapa(2)} className="botao-secundario">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              <button type="submit" className="botao-principal">
                <span>Revisar aviso</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {mensagemErro && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-cidade-alerta font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>{mensagemErro}</span>
          </p>
        )}
      </div>

      {/* MODAL DE CONFIRMACAO (fecha com a tecla ESC - WCAG 2.1.1) */}
      {mostrarConfirmacao && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-confirmar"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-cidade-borda pb-3">
              <h3 id="titulo-modal-confirmar" className="text-2xl font-bold">
                Confira antes de enviar
              </h3>
              <button
                type="button"
                onClick={() => setMostrarConfirmacao(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Fechar janela de revisão"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold">O que aconteceu:</p>
                <p>{descricao}</p>
              </div>
              <div>
                <p className="font-bold">Tipo do problema:</p>
                <p>{nomeCategoriaEscolhida}</p>
              </div>
              <div>
                <p className="font-bold">Urgência:</p>
                <p>
                  {PRIORIDADES[prioridade] ? PRIORIDADES[prioridade].nome : 'Média'}
                  {impedePassagem ? ' (Impede a passagem)' : ''}
                </p>
              </div>
              <div>
                <p className="font-bold">Local:</p>
                <p>
                  {referencia} - {bairro}
                </p>
              </div>
            </div>

            <p className="text-xs text-cidade-suave">
              Este aviso fica público sem nenhum dado pessoal seu. Você pode apertar ESC para voltar e editar.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setMostrarConfirmacao(false)} className="botao-secundario">
                Voltar e editar
              </button>
              <button type="button" onClick={confirmarEnvio} disabled={carregando} className="botao-principal">
                {carregando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>{carregando ? 'Enviando...' : 'Confirmar e enviar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
