'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Volume2, VolumeX } from 'lucide-react';

// Barra de acessibilidade no topo do site (mesma estrutura do AccessibilityBar.js do Happy Games):
// - Modo de alto contraste (salvo no localStorage)
// - Aumento do tamanho da fonte (normal -> grande -> muito grande)
// - Leitor de voz nativo do navegador (Web Speech API - SpeechSynthesis)
export default function BarraAcessibilidade() {
  const [modoContraste, setModoContraste] = useState(false);
  const [tamanhoTexto, setTamanhoTexto] = useState('normal');
  const [narradorLigado, setNarradorLigado] = useState(false);

  // Carrega as opcoes que o usuario ja tinha deixado salvas no navegador
  useEffect(() => {
    const contrasteSalvo = localStorage.getItem('cl_alto_contraste') === 'true';
    const fonteSalva = localStorage.getItem('cl_tamanho_fonte') || 'normal';
    const vozSalva = localStorage.getItem('cl_voz_ativa') === 'true';

    setModoContraste(contrasteSalvo);
    setTamanhoTexto(fonteSalva);
    setNarradorLigado(vozSalva);

    if (contrasteSalvo) {
      document.body.classList.add('alto-contraste');
    }
    if (fonteSalva === 'grande') {
      document.body.classList.add('texto-grande');
    }
    if (fonteSalva === 'muito-grande') {
      document.body.classList.add('texto-muito-grande');
    }
  }, []);

  // Quando o leitor de voz esta ligado, le em voz alta os botoes, links e titulos clicados
  useEffect(() => {
    if (!narradorLigado) return;

    const cliqueNarrador = (evento) => {
      var elemento = evento.target;
      while (elemento && elemento !== document.body) {
        if (
          elemento.hasAttribute('data-narrar') ||
          elemento.tagName === 'BUTTON' ||
          elemento.tagName === 'A' ||
          elemento.tagName === 'H1' ||
          elemento.tagName === 'H2' ||
          elemento.tagName === 'H3' ||
          elemento.tagName === 'P'
        ) {
          const textoParaLer = elemento.getAttribute('data-narrar') || elemento.textContent;
          narrar(textoParaLer);
          break;
        }
        elemento = elemento.parentElement;
      }
    };

    document.body.addEventListener('click', cliqueNarrador);
    return () => {
      document.body.removeEventListener('click', cliqueNarrador);
    };
  }, [narradorLigado]);

  // Usa a API nativa de sintese de voz do navegador para falar o texto
  const narrar = (mensagem) => {
    if ('speechSynthesis' in window && mensagem) {
      window.speechSynthesis.cancel();
      const fala = new SpeechSynthesisUtterance(mensagem);
      fala.lang = 'pt-BR';
      fala.rate = 1.0;
      window.speechSynthesis.speak(fala);
    }
  };

  // Liga ou desliga o modo de alto contraste
  const mudarContraste = () => {
    const novoContraste = !modoContraste;
    setModoContraste(novoContraste);
    localStorage.setItem('cl_alto_contraste', novoContraste.toString());

    if (novoContraste) {
      document.body.classList.add('alto-contraste');
    } else {
      document.body.classList.remove('alto-contraste');
    }

    if (narradorLigado) {
      narrar('Modo de contraste alterado.');
    }
  };

  // Volta o tamanho do texto para o padrao
  const resetarFonte = () => {
    setTamanhoTexto('normal');
    localStorage.setItem('cl_tamanho_fonte', 'normal');
    document.body.classList.remove('texto-grande', 'texto-muito-grande');
    if (narradorLigado) {
      narrar('Tamanho da letra voltou ao normal.');
    }
  };

  // Aumenta o tamanho do texto
  const aumentarTexto = () => {
    var novoTamanho = 'normal';
    if (tamanhoTexto === 'normal') {
      novoTamanho = 'grande';
    } else {
      novoTamanho = 'muito-grande';
    }

    setTamanhoTexto(novoTamanho);
    localStorage.setItem('cl_tamanho_fonte', novoTamanho);
    document.body.classList.remove('texto-grande', 'texto-muito-grande');

    if (novoTamanho === 'grande') {
      document.body.classList.add('texto-grande');
    }
    if (novoTamanho === 'muito-grande') {
      document.body.classList.add('texto-muito-grande');
    }

    if (narradorLigado) {
      narrar('Tamanho da letra aumentado.');
    }
  };

  // Liga ou desliga o leitor de voz
  const mudarNarrador = () => {
    const novaVoz = !narradorLigado;
    setNarradorLigado(novaVoz);
    localStorage.setItem('cl_voz_ativa', novaVoz.toString());

    if (novaVoz) {
      narrar('Leitor de voz ligado. Clique nos textos ou botões para ouvir.');
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const estiloBotao =
    'inline-flex items-center gap-1.5 bg-white text-cidade-texto border border-cidade-borda rounded-lg px-3 py-1.5 text-sm font-bold hover:border-cidade-info disabled:opacity-40';

  return (
    <div
      className="bg-slate-100 border-b border-cidade-borda py-2 px-4"
      role="complementary"
      aria-label="Barra de Acessibilidade"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-cidade-suave">Acessibilidade Digital:</span>
          <button
            type="button"
            onClick={mudarContraste}
            className={estiloBotao}
            aria-label="Alternar modo de alto contraste"
          >
            <Eye className="w-4 h-4" />
            <span>{modoContraste ? 'Contraste Normal' : 'Alto Contraste'}</span>
          </button>
          <button
            type="button"
            onClick={mudarNarrador}
            className={estiloBotao}
            aria-label="Alternar leitor de voz"
          >
            {narradorLigado ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{narradorLigado ? 'Desativar Voz' : 'Ouvir Tela'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-cidade-suave">Tamanho do Texto:</span>
          <button
            type="button"
            onClick={resetarFonte}
            className={estiloBotao}
            aria-label="Voltar tamanho da fonte para o padrão"
          >
            A
          </button>
          <button
            type="button"
            onClick={aumentarTexto}
            disabled={tamanhoTexto === 'muito-grande'}
            className={estiloBotao}
            aria-label="Aumentar tamanho do texto"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
