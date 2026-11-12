# Caminho Livre - CitizenTech (Global Solution FIAP)

Plataforma Web de zeladoria colaborativa e acessível focada em problemas reais das calçadas e espaços públicos (buracos, ausência de rampas, bloqueios de passagem, iluminação pública e alagamentos), priorizando ocorrências que afetam a autonomia de idosos e pessoas com deficiência.

- **Curso:** Sistemas de Informação - FIAP (Turma 1SIOA)
- **Equipe:** Grupo 5 (Giovani, Yuri, Edmar e Luan)
- **ODS conectados:** ODS 3 (Saúde e bem-estar), ODS 9 (Inovação e infraestrutura), ODS 10 (Redução das desigualdades) e ODS 11 (Cidades e comunidades sustentáveis).

## Como rodar o projeto

1. Abra o terminal na pasta `GlobalSolution/caminho-livre`:
   ```bash
   cd GlobalSolution/caminho-livre
   ```
2. Caso a pasta `node_modules` não esteja presente, instale as dependências:
   ```bash
   npm install
   ```
3. (Opcional) Para usar a classificação e o assistente via Google Gemini (`gemini-3.8-flash`), copie `.env.example` para `.env.local` e coloque sua `GEMINI_API_KEY`. **Mesmo sem chave de API configurada**, todas as páginas funcionam 100% usando o classificador e o assistente locais por palavras-chave (Plano B).
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse no navegador: `http://localhost:3000`