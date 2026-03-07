# CONDOCONNECT - SISTEMA PARA CONDOMÍNIOS
Versão: 1.0

## ESTRUTURA DAS PÁGINAS (MAPEAMENTO REACT)
- **/**: Página inicial/mural (`index.html`)
- **/reservas**: Gestão de reservas (`pagina-reservas.html`)
- **/solicitacoes**: Solicitações e ocorrências (`pagina-solicitacoes.html`)
- **/votacoes**: Votações do condomínio (`pagina-votacoes.html`)
- **/sindico**: Controle do síndico (`painel-sindico.html`)
- **/cadastro**: Cadastro de moradores (`pagina-cadastro.html`)
- **/documentos**: Documentos e contatos (`pagina-documentos.html`)

## COMO SUBIR PARA HOSPEDAGEM

### 1. Preparação dos Arquivos
- Execute `npm run build` para gerar a pasta `dist/`.
- Faça upload de todos os arquivos da pasta `dist/` para a pasta pública do seu host (public_html, www, etc).

### 2. Configuração do Banco de Dados (Firebase)
- O sistema já está integrado ao Firebase.
- Se desejar usar seu próprio projeto:
  1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
  2. Ative o **Firestore Database** e **Authentication** (Google Login).
  3. Obtenha suas credenciais e atualize o arquivo `firebase-applet-config.json`.

### 3. Hospedagem Recomendada
- **Testes**: GitHub Pages ou Netlify (Gratuito).
- **Profissional**: HostGator, Locaweb ou Vercel.

### 4. Imagens
- Todas as imagens do sistema foram otimizadas.
- Para substituir, coloque suas imagens na pasta `public/imagens/` e atualize as referências no código.

---
Desenvolvido por Apsilva Assessoria
