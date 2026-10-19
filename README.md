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
robots.txt
assets/fonts/       Poppins e Fraunces (locais, licença OFL, inclusa)
assets/icons/       favicon.svg (marca provisória) e icones.svg (Lucide, ISC)
assets/images/      Composições gráficas provisórias (substituíveis por fotos)
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
- [ ] Número oficial de WhatsApp (e de cada profissional, se houver)
- [ ] Nome da psicóloga e número do CRP (exigido pelo Código de Ética do psicólogo em divulgações)
- [ ] Endereço, cidade, horários, Instagram e orientações de chegada
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

## Decisões

- **Fonte de títulos:** a Le Major é comercial e não tem licença web gratuita. Usamos a Fraunces (OFL), serifada editorial semelhante. Com a licença web da Le Major, basta trocar o `@font-face` e `--fonte-titulo`.
- **Contraste:** o terracota `#B7631D` tem 4,4:1 no branco e serve apenas a títulos grandes e detalhes. Textos pequenos e botões usam `#94501A` (6,1:1). Caramelo e oliva são decorativos.
- **Mapa:** não incluído, pois o endereço está pendente. Se incluído, prefira um link "Abrir no mapa" a um iframe (sem impacto de privacidade e CSP).

## Testes executados (19/10/2026)

- `node tests/whatsapp.test.mjs`: links, codificação da mensagem, números inválidos e filtro de especialidades ativas — passou.
- Playwright, Chromium: sem rolagem horizontal em 320, 375, 390, 430, 768, 1024, 1366 e 1920 px; menu mobile abre, fecha com Esc e devolve o foco; âncoras internas existem; com número de teste, os botões geram `https://wa.me/...` com a mensagem da especialidade e `rel="noopener noreferrer"`; sem número, nenhum link `wa.me` é publicado; com `prefers-reduced-motion`, todo conteúdo fica visível e sem animação; foco visível e link "Pular para o conteúdo"; fontes locais carregadas; nenhum erro no console.
- **Não testado:** Safari/iOS e Firefox, leitor de tela real, cabeçalhos em produção (dependem do deploy), WhatsApp abrindo em celular real.
