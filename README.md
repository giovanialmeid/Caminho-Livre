# Caminho Livre — CitizenTech (Global Solution FIAP)

Plataforma Web de **zeladoria colaborativa e acessível** criada para a **Global Solution (CitizenTech)** da FIAP. O sistema permite que qualquer cidadão avise, em cerca de 1 minuto e sem precisar de cadastro, sobre problemas reais nas calçadas e espaços públicos (buracos, falta de rampa para cadeirantes, calçadas bloqueadas, postes apagados e alagamentos), priorizando o que afeta a autonomia de **idosos e pessoas com deficiência**.

---

## Sobre o Projeto e o Problema Real (Dados do IBGE)

Segundo dados oficiais do **Censo Demográfico 2022** e da **PNAD Contínua 2022 (IBGE)**:
- Apenas **18,8%** dos moradores urbanos vivem em ruas com calçadas livres de obstáculos;
- Apenas **15,2%** vivem em vias que possuem rampa para cadeirantes (**68,8%** não têm rampa na rua);
- O Brasil possui **18,6 milhões** de pessoas com deficiência e **32,1 milhões** de idosos (60+ anos).

O **Caminho Livre** substitui formulários burocráticos por um fluxo simples em 3 etapas, apoiado por **Inteligência Artificial Generativa**, **validação comunitária** e **Análise de Pareto (80/20)**.

### Conexão com os ODS da ONU (Agenda 2030)
- **ODS 3:** Saúde e bem-estar (prevenção de quedas e acidentes no trajeto urbano)
- **ODS 9:** Indústria, inovação e infraestrutura
- **ODS 10:** Redução das desigualdades (prioridade para barreiras que impedem a locomoção)
- **ODS 11:** Cidades e comunidades sustentáveis e inclusivas

---

## Principais Funcionalidades

1. **Relato Anônimo em 3 Etapas (`/relatar`):**
   - **Etapa 1:** Descrição em linguagem natural ou exemplos prontos com 1 clique.
   - **Etapa 2:** Classificação automática de categoria e urgência via **Google Gemini (`gemini-3.8-flash`)** com justificativa simples (**IA Explicável - XAI**) e **Plano B local** por palavras-chave caso o projeto rode sem chave de API.
   - **Etapa 3:** Localização por bairro e ponto de referência, revisão em modal acessível (fecha com `ESC`) e geração de protocolo (`CL-2026-NNNN`).
2. **Apoio da Vizinhança e Fila de Prioridade Social (`/ocorrencias`):**
   - Botão **"Eu também passo por isso"** para confirmar problemas já relatados sem duplicar chamados.
   - Cálculo transparente do Índice de Prioridade:
     `indice = peso da urgencia (Alta 30, Media 20, Baixa 10) + 15 (se impede a passagem) + (2 * apoios)`
3. **Consulta de Protocolo (`/acompanhar`):**
   - Acompanhamento em 3 estágios (`Recebido`, `Em análise`, `Resolvido`) sem expor dados pessoais.
4. **Painel da Cidade com BI e Análise de Pareto 80/20 (`/painel`):**
   - Indicadores em tempo real, curva de Pareto destacando os problemas que concentram 80% dos relatos, tabela HTML acessível para leitores de tela, Top 5 prioridades e ranking de bairros.
5. **Assistente Cidadão Conversacional (`AssistenteCidadao.js`):**
   - Chat flutuante no padrão **ReAct** que tira dúvidas e consulta protocolos diretamente na conversa.
6. **Acessibilidade Digital (WCAG 2.1 AA) e Segurança (LGPD):**
   - Barra fixa com **Alto Contraste**, **Tamanho do Texto (`A` / `A+`)**, **Leitor de Voz nativo (`SpeechSynthesis`)**, **Skip Link** no `Tab` e fechamento por `Escape`.
   - Ocultação automática de e-mail e CPF caso o morador digite no texto por engano (`ocultarDadosPessoais`) e proteção da `GEMINI_API_KEY` no servidor.

---

## Tecnologias Utilizadas

- **Front-end e Back-end:** Next.js 14 (App Router & Route Handlers), React 18, JavaScript (ES6+)
- **Estilização e Ícones:** Tailwind CSS 3, Lucide React
- **Inteligência Artificial:** Google Gemini API (`gemini-3.8-flash` via AIaaS) + Classificador Local de Contingência
- **Persistência de Dados:** Arquivo JSON estruturado no servidor (`data/ocorrencias.json` via módulo `fs`) e `localStorage` no navegador
- **Acessibilidade por Voz:** Web Speech API nativa (`window.speechSynthesis`)

---

## Como Executar Localmente

```bash
# 1. Instale as dependências
npm install

# 2. (Opcional) Configure a chave gratuita do Google Gemini
# Copie o arquivo .env.example para .env.local e adicione sua GEMINI_API_KEY.
# Mesmo sem o .env.local, o sistema funciona 100% usando o classificador local!

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:3000`
