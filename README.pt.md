<div align="center">

<img src="public/icon-512.png" alt="Logo do SpotiPaper" width="120" height="120">

# SpotiPaper

**Wallpapers das suas músicas e álbuns favoritos do Spotify.**<br>
Um PNG 1080×1920 montado com as cores da capa. Funciona sem login.

[![Demo ao vivo](https://img.shields.io/badge/Demo_ao_vivo-abrir-1DB954?style=for-the-badge&logo=vercel&logoColor=white)](https://spotipaper.vercel.app)

[![CI](https://github.com/obrenoalvim/spoti-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/obrenoalvim/spoti-paper/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/obrenoalvim/spoti-paper?style=flat&logo=github&color=1db954)](https://github.com/obrenoalvim/spoti-paper/stargazers)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](#dependências-principais)

[English](README.md) · **Português**

[Funcionalidades](#funcionalidades) · [Como executar](#como-executar) · [Como usar](#como-usar) · [Detalhes técnicos](#detalhes-técnicos-relevantes) · [Perguntas frequentes](#perguntas-frequentes)

</div>

---

Aplicação web que gera wallpapers 1080×1920 a partir de músicas e álbuns do Spotify, usando as cores da capa. O app extrai a paleta de cores da capa, cria um layout minimalista e permite baixar em PNG. Funciona mesmo sem login (via oEmbed), com dados mais completos quando autenticado.

**Demo ao vivo:** [spotipaper.vercel.app](https://spotipaper.vercel.app)

## Funcionalidades

- Autenticação OAuth2 com PKCE (client-side) para acesso à Spotify Web API
- Fallback via oEmbed quando não autenticado (sem duração total, metadados básicos)
- Extração de cores com ColorThief (cor dominante + paleta de 5 cores)
- Renderização em Canvas (1080×1920) com gradiente, paleta, duração, título, artista, capa arredondada e Spotify Code
- Interface responsiva com download em PNG

## Requisitos

- Node.js 18+ (Vite 5)
- Conta no Spotify Developer (para usar autenticação e dados completos)

## Como executar

1) Instale as dependências
```bash
npm install
```

2) Configure as variáveis de ambiente (raiz do projeto). Crie um arquivo `.env` com as chaves abaixo. Ajuste o `REDIRECT_URI` conforme seu ambiente (desenvolvimento e produção) e inclua os mesmos valores na aba Redirect URIs do app no Spotify Developer Dashboard.
```env
VITE_CLIENT_ID=SEU_CLIENT_ID_DO_SPOTIFY
VITE_REDIRECT_URI=http://localhost:5173
VITE_SCOPES=user-read-private
```

3) Ambiente de desenvolvimento
```bash
npm run dev
```

4) Build de produção e preview
```bash
npm run build
npm run preview
```

Após subir em produção, lembre-se de atualizar o `VITE_REDIRECT_URI` e o Redirect URI no dashboard da Spotify.

## Como usar

- Opcional: clique em "Conectar com Spotify" para autenticar e obter metadados completos (ex.: duração)
- Cole a URL de uma música ou de um álbum do Spotify, por exemplo:
  - `https://open.spotify.com/track/...`
  - `https://open.spotify.com/album/...`
- Clique em "Gerar Wallpaper" e aguarde a extração da paleta e a renderização
- Clique em "Baixar PNG" para salvar o resultado

Sem login, a aplicação usa oEmbed do Spotify para obter metadados básicos (sem duração). Com login, usa a Web API para obter dados completos (músicas e álbuns, incluindo soma de duração das faixas de um álbum).

## Estrutura do projeto

- Raiz
  - `index.html`: HTML de entrada (Vite)
  - `package.json`: scripts e dependências
  - `vercel.json`: configuração de deploy (opcional)
  - `.env`: variáveis locais (não commitar)
  - `dist/`: artefatos de build
- `src/`
  - `main.js`: bootstrap do app
  - `styles/main.css`: estilos da interface
  - `js/config.js`: constantes (`PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `ORIENTATION_LAYOUTS`, fontes, cores) e `SPOTIFY_CONFIG`
  - `js/app.js`: classe principal `SpotifyWallpaperApp`
  - `js/services/`
    - `spotify-auth.js`: fluxo OAuth2 PKCE (login, token)
    - `spotify-api.js`: chamadas à Spotify Web API e oEmbed
    - `canvas-renderer.js`: desenho no Canvas (layout do wallpaper)
  - `js/utils/`
    - `color-utils.js`: extração de paleta via ColorThief
    - `format-utils.js`: formatação (tempo, quebra de texto)
    - `spotify-utils.js`: parse de URLs e Spotify Codes
    - `crypto-utils.js`: utilitários PKCE (SHA-256, challenge)
    - `ui-utils.js`: loading, erro, metadados, download

Observação: a pasta `dist/` contém a versão empacotada pelo Vite; não edite arquivos nela manualmente.

## Detalhes técnicos relevantes

- **Autenticação**: PKCE (sem client secret) com code_verifier/code_challenge. Token guardado em sessionStorage; expiração derruba sessão e exige novo login.
- **Fallback oEmbed**: sem necessidade de token; retorna thumbnail da capa e título/autor.
- **Canvas e ColorThief**: as imagens são carregadas com `crossOrigin='anonymous'` e `referrerPolicy='no-referrer'`. A extração de cores e o export PNG dependem de CORS correto nas imagens de capa.
- **Spotify Codes**: o código é renderizado via a URL pública `scannables.scdn.co`; verifique os termos de uso do Spotify Codes antes de usar em produção.

## Limitações e troubleshooting

- CORS em capas: se a imagem não permitir CORS, a extração de cores e/ou o download do canvas podem falhar. Tente outra faixa/álbum ou hospede/roteie imagens com cabeçalhos adequados.
- Redirect URI: precisa ser idêntico ao configurado no Spotify Dashboard (inclusive protocolo/porta). Em dev, use `http://localhost:5173`.
- Token expirado: ao receber 401, a app faz logout e pede novo login.
- oEmbed: fornece metadados limitados; duração pode aparecer como um traço.

## Personalização rápida

- Dimensões/layout: `src/js/config.js` (`PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `ORIENTATION_LAYOUTS`)
- Cores e fontes: `src/js/config.js` (`COLOR_CONFIG`, `FONT_CONFIG`)
- Lógica de desenho: `src/js/services/canvas-renderer.js`

## Dependências principais

- Vite 5 (bundler e dev server)
- ColorThief (extração de paleta)
- Spotify Web API e oEmbed

## Contribuição

- Abra issues/PRs descrevendo claramente a mudança
- Mantenha o padrão de código e a separação por camadas (services/utils)
- Atualize este README quando alterar comportamento de build/execução

## Avisos

- Respeite termos e políticas do Spotify (Web API e Spotify Codes)
- Não commitar `.env` e credenciais
- Teste em navegadores modernos (Canvas, Web Crypto, ES Modules)

---

## Perguntas frequentes

**Preciso de conta no Spotify?**
Não. Sem login o app usa o oEmbed do Spotify para metadados básicos (sem duração). Com login (OAuth2 com PKCE) ele usa a Web API para dados completos, inclusive a duração somada de um álbum.

**Meu token do Spotify fica salvo?**
O token fica no `sessionStorage`. Quando expira, a sessão termina e o app pede um novo login. Não há client secret.

**Por que o download ou a extração de cores falha em algumas capas?**
A extração de cores e a exportação em PNG precisam de CORS correto na imagem da capa. Tente outra música ou álbum, ou sirva a imagem por um proxy com os cabeçalhos certos.

**Posso mudar o layout ou as cores?**
Pode. Dimensões, cores e fontes ficam em `src/js/config.js`, e a lógica de desenho está em `src/js/services/canvas-renderer.js`. Veja [Personalização rápida](#personalização-rápida).

## Mais geradores de poster do mesmo autor

- [**github-wrapped**](https://github.com/obrenoalvim/github-wrapped): um poster estilo Spotify Wrapped para o seu ano no GitHub.
- [**claude-code-wrapped**](https://github.com/obrenoalvim/claude-code-wrapped): seu histórico do Claude Code como um poster compartilhável.

## Licença

MIT, veja [LICENSE](LICENSE).

---

<div align="center">

Se o SpotiPaper fez um wallpaper que você guardou, uma ⭐ ajuda outras pessoas a encontrá-lo.

<sub>**Tópicos:** spotify · spotify-api · wallpaper-generator · album-art · color-palette · colorthief · canvas · oauth2 · pkce · vite · javascript</sub>

</div>
