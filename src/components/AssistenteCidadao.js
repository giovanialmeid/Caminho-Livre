'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleQuestion, X, Send, Loader2 } from 'lucide-react';

// Assistente Cidadao flutuante (mesma estrutura do ChatBot.js do Happy Games):
// - Abre pelo botao flutuante no canto inferior direito
// - Foca no campo de texto automaticamente ao abrir
// - Fecha ao apertar a tecla Escape (WCAG 2.1.1)
// - Traz botoes de perguntas rapidas para facilitar o uso

export default function AssistenteCidadao() {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      remetente: 'assistente',
      texto: 'Olá! Sou o Assistente do Caminho Livre. Posso explicar a fila de prioridade, mostrar dados da cidade ou consultar um protocolo (ex: CL-2026-0001).',
    },
  ]);

  const campoPerguntaRef = useRef(null);
  const fimMensagensRef = useRef(null);

  const sugestoes = [
    'Como funciona a fila de prioridade?',
    'Consultar protocolo CL-2026-0001',
    'Quais problemas mais aparecem na cidade?',
    'Preciso colocar meu CPF ou nome?',
  ];

  // Rola para o final da conversa quando chega mensagem nova
  useEffect(() => {
    if (aberto) {
      fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, aberto]);

  // Foca no campo de pergunta quando abre a janela
  useEffect(() => {
    if (aberto) {
      setTimeout(() => campoPerguntaRef.current?.focus(), 150);
    }
  }, [aberto]);

  // Fecha o chat ao apertar a tecla ESC (WCAG 2.1.1)
  useEffect(() => {
    function tratarEsc(evento) {
      if (evento.key === 'Escape' && aberto) {
        setAberto(false);
      }
    }
    window.addEventListener('keydown', tratarEsc);
    return () => window.removeEventListener('keydown', tratarEsc);
  }, [aberto]);

  async function enviarPergunta(textoPronto) {
    const textoFinal = (textoPronto || pergunta).trim();
    if (!textoFinal || carregando) return;

    const novaMensagemUsuario = {
      id: Date.now(),
      remetente: 'usuario',
      texto: textoFinal,
    };

    const novoHistorico = [...mensagens, novaMensagemUsuario];
    setMensagens(novoHistorico);
    setPergunta('');
    setCarregando(true);

    try {
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: textoFinal,
          historico: novoHistorico,
        }),
      });

      const dados = await resposta.json();

      setMensagens((anterior) => [
        ...anterior,
        {
          id: Date.now() + 1,
          remetente: 'assistente',
          texto: dados.resposta || dados.erro || 'Não consegui responder agora.',
        },
      ]);
    } catch (erro) {
      setMensagens((anterior) => [
        ...anterior,
        {
          id: Date.now() + 1,
          remetente: 'assistente',
          texto: 'Erro de conexão com o servidor. Tente novamente.',
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function submeterFormulario(evento) {
    evento.preventDefault();
    enviarPergunta();
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!aberto && (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="botao-principal shadow-lg rounded-full px-5 py-3.5"
          aria-label="Abrir Assistente Cidadão para tirar dúvidas"
        >
          <MessageCircleQuestion className="w-6 h-6" />
          <span>Dúvidas? Fale com o Assistente</span>
        </button>
      )}

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-assistente"
          className="cartao w-[92vw] max-w-md flex flex-col overflow-hidden shadow-2xl border-2 border-cidade-primaria"
        >
          <div className="bg-cidade-primaria text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h2 id="titulo-assistente" className="font-bold text-base">
                Assistente Caminho Livre
              </h2>
              <p className="text-xs opacity-90">Tira dúvidas e consulta protocolos (ESC para fechar)</p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="p-2 rounded-lg hover:bg-cidade-primariaEscura"
              aria-label="Fechar assistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto space-y-3 bg-slate-50">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl px-3.5 py-2.5 text-sm ${
                  msg.remetente === 'usuario'
                    ? 'bg-cidade-primaria text-white ml-8'
                    : 'bg-white border border-cidade-borda text-cidade-texto mr-6'
                }`}
              >
                {msg.texto}
              </div>
            ))}
            {carregando && (
              <p className="text-sm text-cidade-suave flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando...</span>
              </p>
            )}
            <div ref={fimMensagensRef} />
          </div>

          <div className="px-4 py-2 bg-white border-t border-cidade-borda">
            <p className="text-xs font-bold text-cidade-suave mb-1.5">Perguntas rápidas:</p>
            <div className="flex flex-wrap gap-1.5">
              {sugestoes.map((sugestao, indice) => (
                <button
                  key={indice}
                  type="button"
                  onClick={() => enviarPergunta(sugestao)}
                  disabled={carregando}
                  className="text-xs border border-cidade-borda rounded-full px-2.5 py-1 hover:border-cidade-info bg-slate-50 text-left"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submeterFormulario} className="p-3 bg-white border-t border-cidade-borda flex gap-2">
            <input
              ref={campoPerguntaRef}
              type="text"
              value={pergunta}
              onChange={(evento) => setPergunta(evento.target.value)}
              placeholder="Digite sua dúvida ou protocolo..."
              className="campo py-2 text-sm"
            />
            <button
              type="submit"
              disabled={carregando || !pergunta.trim()}
              className="botao-principal px-4 py-2 min-h-[42px]"
              aria-label="Enviar pergunta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
