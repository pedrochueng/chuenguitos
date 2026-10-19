# Site institucional — Clínica Multidisciplinar (nome provisório)

Site estático em HTML, CSS e JavaScript puro. Sem frameworks, sem dependências em produção, sem banco de dados e sem serviços externos carregados pela página.

## Estrutura

```
index.html          Página principal
privacy.html        Política de privacidade (modelo-base, revisar antes de publicar)
style.css           Identidade visual, layout e responsividade (cores em :root)
dados.js            ÚNICO arquivo de dados: WhatsApp, contato e especialidades
script.js           Renderização, links de WhatsApp, menu e animações
_headers            Cabeçalhos de segurança (Cloudflare Pages / Netlify)
vercel.json         Mesmos cabeçalhos para a Vercel (a Vercel NÃO lê o _headers). Inclui noindex enquanto for demo
robots.txt
assets/fonts/       Poppins e Cormorant Garamond (locais, licença OFL, inclusa)
assets/icons/       favicon.svg (marca provisória) e icones.svg (Lucide, ISC)
assets/images/      hero/ (4 fotos do slideshow), clinica.webp e equipe/: fotos de EXEMPLO (Unsplash), trocar pelas da cliente
tests/              Teste do gerador de links de WhatsApp
```

## Rodar localmente

```powershell
pnpm dlx serve -l 5173 .
# abrir http://localhost:5173
node tests/whatsapp.test.mjs   # teste dos links e do filtro de especialidades
```

O `_headers` não é aplicado pelo servidor local; ele vale na hospedagem.

## Como editar

- **WhatsApp, endereço, horários, Instagram:** `dados.js`. Campo vazio não aparece no site.
- **Número de WhatsApp:** apenas dígitos, `55` + DDD + número (ex.: `5511912345678`). Número vazio ou inválido mostra "Agendamento em breve", sem link.
- **Nova especialidade:** em `dados.js`, preencha `descricao`, `profissional` e mude `ativa` para `true`. Pode ter número próprio em `whatsapp`; se vazio, usa `whatsappGeral`.
- **Nome da clínica:** substitua "Clínica Multidisciplinar" em `index.html` e `privacy.html` (título, metadados, cabeçalho e rodapé).
- **Cores:** variáveis em `:root` no início de `style.css`.
- **Imagens:** troque os SVGs em `assets/images/` por fotos autorizadas (WebP, até ~1600 px), mantendo `width`/`height` e preenchendo `alt`.

## Dados pendentes da cliente

- [ ] Nome definitivo da clínica e logotipo
- [x] WhatsApp: `5521970766187` está em `whatsappGeral` (clínica, especialidades e profissionais). A cliente confirma se é o número oficial; se um profissional tiver número próprio, vai em `profissional.whatsapp`.
- [x] Instagram: `psicologa_neusavalle` está em `contato.instagram` (a cliente confirma)
- [ ] E-mail oficial da clínica
- [ ] Nome da psicóloga e número do CRP (exigido pelo Código de Ética do psicólogo em divulgações)
- [ ] Endereço (hoje aparece como "A definir", sem link de mapa), cidade, horários e orientações de chegada. O Instagram já está cadastrado.
- [ ] Domínio (para canonical, `og:url`, `og:image` e `sitemap.xml`)
- [ ] Fotografias autorizadas (opcional)
- [ ] Dados da política de privacidade: responsável, CPF/CNPJ, contato, provedor, prazo de retenção das conversas
- [ ] Revisão e aprovação de todos os textos institucionais

## Publicação (Cloudflare Pages, recomendado)

1. Envie a pasta para um repositório no GitHub.
2. Cloudflare Pages → Create project → conecte o repositório.
3. Build command: vazio. Output directory: `/`.
4. Adicione o domínio próprio. O HTTPS é automático.
5. Confira os cabeçalhos em https://securityheaders.com.

Netlify também lê `_headers`. **GitHub Pages não permite cabeçalhos personalizados**: nesse caso as proteções do `_headers` não são aplicadas.

## Segurança

**No código:** sem `eval`, sem `innerHTML` (só `textContent`/`createElement`), links do WhatsApp só para `wa.me` com número validado e mensagem via `encodeURIComponent`, links externos com `rel="noopener noreferrer"`, nenhum script, fonte ou imagem de terceiros, nenhum formulário e nenhum segredo.

**Na hospedagem (`_headers`):** CSP restritiva (só recursos do próprio domínio, sem frames e sem formulários), `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS e COOP.

Nenhum site é absolutamente seguro. Mapa embutido, analytics ou formulário futuros exigem ajustar a CSP e a política de privacidade.

## Modo de apresentação e fotos de exemplo

- `modoApresentacao: true` em `dados.js` mostra 4 profissionais fictícios (registros zerados), a seção Equipe e uma faixa de aviso. **Antes de publicar, mude para `false`.**
- As fotos de exemplo vêm do Unsplash (licença livre, inclusive comercial, sem exigir crédito): `clinica.webp` de [Simona Sergi](https://unsplash.com/photos/cozy-living-room-with-natural-elements-and-warm-tones-8fF_tF2ZMSQ) e o slideshow do hero (`hero/hero-1..4.webp`: [Clay Banks](https://unsplash.com/photos/cozy-armchair-by-a-window-with-a-garden-view-CjmHORCoIfw), [corredor](https://unsplash.com/photos/mISkLiMzypI), [poltrona laranja](https://unsplash.com/photos/skLqGtLrYKc) e [Archee Lal](https://unsplash.com/photos/warm-light-illuminates-a-bedroom-with-a-bed-and-plant-hkCXcR2mcds)). Não são do espaço da clínica: trocar antes de publicar.
- **Hero:** as fotos de `#hero-fotos` (em `index.html`) trocam sozinhas a cada 5 s com fade e têm botão de pausa. A primeira aparece sem JavaScript. Para mais fotos, copie um `<img>` (WebP quadrada, 1000×1000, com `alt`).
- **Especialidades e profissionais num bloco só** (seção Especialidades): carrossel 3D (coverflow) montado a partir de `dados.js`, um cartão por especialidade ativa. Com profissional cadastrado, mostra foto em arco, nome, registro e mini-bio; sem profissional, mostra a inicial da especialidade e o botão "Agendar {especialidade}". Abaixo do cartão vão a descrição da especialidade e o botão de WhatsApp. Com 2 ou mais especialidades, aparecem abas com os nomes, que levam o carrossel até o cartão. Troca sozinho a cada 4,5 s, mas para ao passar o mouse, quando sai da tela ou no botão de pausa. Também funciona com setas, botões, clique no vizinho e deslizar. Sem `foto`, mostra as iniciais. Só aparece se houver ao menos um profissional (real, ou de exemplo no modo de apresentação).
- **Movimento reduzido:** com essa preferência ligada no aparelho, nada troca sozinho (nem o hero, nem o carrossel) e os botões de pausa não aparecem. Todo o movimento abaixo também é desligado.
- **Movimento:** título do hero em palavras que sobem de uma máscara; foto do hero que abre em folha e acompanha a rolagem; frase de impacto cujas palavras acendem com a rolagem (texto em `#interludio`, em `index.html`); carrossel que abre em leque; botões com varredura de cor e leve atração do cursor; linhas que se desenham (títulos, fases, passos); foto da clínica em cortina; barra de progresso no topo. Só `transform` e `opacity`; o CSS está na seção "Movimento" de `style.css` e o JavaScript no fim de `script.js`.
- As 5 fotos de `assets/images/equipe/` são retratos de **pessoas reais de um banco de imagens (Unsplash), usados só para apresentação**. Não representam a equipe. **Antes de publicar, apague essa pasta** (o modo desligado já não as carrega, mas os arquivos continuariam públicos no site) e use `foto` apenas com fotos autorizadas por escrito pelo profissional.
- Para um profissional real: preencha `profissional` (nome, registro, bio e `foto`) em `dados.js`, com foto em WebP, 4:5 (ex.: 640×800).
- **E-mail:** a seção "Prefere escrever por e-mail?" só aparece se `email` estiver preenchido em `dados.js` (no modo de apresentação usa `emailExemplo`). O formulário não envia nada pelo site: monta um `mailto:` e abre o aplicativo de e-mail da pessoa. Se a cliente quiser receber mensagens direto, sem a pessoa abrir o e-mail dela, é preciso um serviço externo (ex.: Formspree ou Web3Forms). Isso exige ajustar a CSP em `_headers` e a política de privacidade, e o site passa a tratar os dados enviados.

## Decisões

- **Fonte de títulos:** a Le Major é comercial e não tem licença web gratuita. Usamos a Cormorant Garamond (OFL), serifada fina e de alto contraste, a mais próxima gratuita. Com a licença web da Le Major, basta trocar o `@font-face` e `--fonte-titulo`.
- **Contraste:** o terracota `#B7631D` tem 4,4:1 no branco e serve apenas a títulos grandes e detalhes. Textos pequenos e botões usam `#94501A` (6,1:1). Caramelo e oliva são decorativos.
- **Mapa:** não incluído, pois o endereço está pendente. Se incluído, prefira um link "Abrir no mapa" a um iframe (sem impacto de privacidade e CSP).

## Testes executados (19/10/2026)

- `node tests/whatsapp.test.mjs`: links, codificação da mensagem, números inválidos e filtro de especialidades ativas — passou.
- Playwright, Chromium: sem rolagem horizontal em 320, 375, 390, 430, 768, 1024, 1366 e 1920 px; menu mobile abre, fecha com Esc e devolve o foco; âncoras internas existem; com número de teste, os botões geram `https://wa.me/...` com a mensagem da especialidade e `rel="noopener noreferrer"`; sem número, nenhum link `wa.me` é publicado; com `prefers-reduced-motion`, todo conteúdo fica visível e sem animação; foco visível e link "Pular para o conteúdo"; fontes locais carregadas; nenhum erro no console.
- **Não testado:** Safari/iOS e Firefox, leitor de tela real, cabeçalhos em produção (dependem do deploy), WhatsApp abrindo em celular real.

## Vercel (demo no ar)

- `vercel.json` aplica os cabeçalhos de segurança e `X-Robots-Tag: noindex, nofollow`. `robots.txt` está em `Disallow: /`. **Antes do lançamento real:** remover o `noindex` do `vercel.json`, trocar o `robots.txt` para `Allow: /` + `Sitemap:`, criar `sitemap.xml`, `canonical`/`og:url`/`og:image` com o domínio e `modoApresentacao: false`.
- Deploy: `vercel --prod` na pasta do projeto.
