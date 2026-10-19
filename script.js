/* Lógica do site. Os dados ficam em dados.js. */

const WHATSAPP_VALIDO = /^55\d{10,11}$/;

// Retorna o link oficial do WhatsApp ou null se o número não estiver configurado/válido.
function linkWhatsApp(numero, mensagem) {
  const digitos = String(numero || "").replace(/\D/g, "");
  if (!WHATSAPP_VALIDO.test(digitos)) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem || "")}`;
}

// Rejeita vírgula e ponto e vírgula: impedem que um "e-mail" vire vários destinatários.
const EMAIL_VALIDO = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

// Monta o mailto: da mensagem, ou null se o e-mail for inválido. Quebras de linha viram CRLF.
function montarMailto(email, nome, mensagem) {
  if (!EMAIL_VALIDO.test(String(email || ""))) return null;
  const corpo = `Olá! Meu nome é ${nome}.\n\n${mensagem}`.replace(/\r?\n/g, "\r\n");
  return `mailto:${email}?subject=${encodeURIComponent("Contato pelo site")}&body=${encodeURIComponent(corpo)}`;
}

// Fora do modo de apresentação, só especialidades ativas e só profissionais reais.
function especialidadesVisiveis(lista, modoApresentacao) {
  return (lista || []).filter(
    (e) => e.ativa === true || (modoApresentacao === true && Boolean(e.profissionalExemplo))
  );
}

function profissionalDe(esp, modoApresentacao) {
  if (esp.profissional && esp.profissional.nome) return { ...esp.profissional, exemplo: false };
  if (modoApresentacao === true && esp.profissionalExemplo) return { ...esp.profissionalExemplo, exemplo: true };
  return null;
}

if (typeof document !== "undefined") {
  const el = (tag, classe, texto) => {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto) n.textContent = texto;
    return n;
  };

  const icone = (id) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icone");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `assets/icons/icones.svg#${id}`);
    svg.append(use);
    return svg;
  };

  // Botão de WhatsApp, ou aviso sem link quando o número está pendente.
  const botaoWhatsApp = (numero, mensagem, rotulo, rotuloAcessivel) => {
    const href = linkWhatsApp(numero, mensagem);
    if (!href) return el("span", "botao botao--pendente", "Agendamento em breve");
    const a = el("a", "botao");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", `${rotuloAcessivel} (abre o WhatsApp em nova aba)`);
    a.append(icone("i-mensagem"), document.createTextNode(rotulo));
    return a;
  };

  const demo = CLINICA.modoApresentacao === true;
  const seloExemplo = () => el("span", "selo-exemplo", "Exemplo");

  if (demo) {
    const faixa = el("p", "faixa-apresentacao", "Versão de apresentação: profissionais e registros são ilustrativos.");
    faixa.setAttribute("role", "note");
    document.body.prepend(faixa);
  }

  // Especialidades
  const lista = document.getElementById("lista-especialidades");
  const visiveis = especialidadesVisiveis(CLINICA.especialidades, demo);
  lista.classList.toggle("especialidades__lista--unica", visiveis.length === 1);
  visiveis.forEach((esp, i) => {
    const item = el("li", "especialidade revelar");
    item.id = `esp-${esp.id}`;
    item.append(el("span", "especialidade__numero", String(i + 1).padStart(2, "0")));

    const corpo = el("div", "especialidade__corpo");
    const nome = el("h3", "especialidade__nome", esp.nome);
    if (!esp.ativa) nome.append(seloExemplo());
    corpo.append(nome);
    if (esp.descricao) corpo.append(el("p", "especialidade__descricao", esp.descricao));
    const p = profissionalDe(esp, demo);
    if (p) {
      const prof = el("p", "especialidade__profissional", p.nome);
      if (p.registro) prof.append(el("span", "", ` · ${p.registro}`));
      corpo.append(prof);
    }
    item.append(corpo);

    const nomeMinusculo = esp.nome.toLowerCase();
    item.append(
      botaoWhatsApp(
        esp.whatsapp || CLINICA.whatsappGeral,
        esp.mensagem,
        `Agendar ${nomeMinusculo}`,
        `Agendar ${nomeMinusculo} pelo WhatsApp`
      )
    );
    lista.append(item);
  });

  // Carrossel de profissionais: só aparece se houver ao menos um
  const faixa = document.getElementById("carrossel-faixa");
  visiveis.forEach((esp) => {
    const p = profissionalDe(esp, demo);
    if (!p) return;
    const card = el("li", "pessoa");
    const foto = el("figure", "pessoa__foto");
    if (p.foto) {
      const img = el("img");
      img.src = p.foto;
      img.alt = `${p.exemplo ? "Foto ilustrativa de" : "Foto de"} ${p.nome}`;
      img.width = 640;
      img.height = 800;
      img.loading = "lazy";
      foto.append(img);
    } else {
      const palavras = p.nome.trim().split(/\s+/);
      const iniciais = palavras[0][0] + (palavras.length > 1 ? palavras.at(-1)[0] : "");
      const marca = el("span", "pessoa__iniciais", iniciais.toUpperCase());
      marca.setAttribute("aria-hidden", "true");
      foto.append(marca);
    }
    const nome = el("h3", "pessoa__nome", p.nome);
    if (p.exemplo) nome.append(seloExemplo());
    card.append(foto, nome, el("p", "pessoa__area", esp.nome));
    if (p.registro) card.append(el("p", "pessoa__registro", p.registro));
    if (p.bio) card.append(el("p", "pessoa__bio", p.bio));
    faixa.append(card);
  });
  const temEquipe = faixa.children.length > 0;
  document.getElementById("carrossel").hidden = !temEquipe;

  // E-mail: a seção só aparece se houver endereço (real, ou de exemplo no modo de apresentação)
  const emailReal = CLINICA.email || "";
  const emailUsado = emailReal || (demo ? CLINICA.emailExemplo || "" : "");
  if (EMAIL_VALIDO.test(emailUsado)) {
    document.getElementById("email").hidden = false;
    const form = document.getElementById("form-email");
    form.hidden = false;
    if (!emailReal) document.getElementById("titulo-email").append(seloExemplo());
    const aviso = document.getElementById("email-aviso");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const href = montarMailto(emailUsado, form.nome.value.trim(), form.mensagem.value.trim());
      aviso.textContent = `Abrindo seu aplicativo de e-mail… Se nada abrir, escreva para ${emailUsado}.`;
      if (href) location.href = href;
    });
  }

  // Contato: mostra apenas campos preenchidos
  const c = CLINICA.contato || {};
  const dl = document.getElementById("dados-contato");
  const linha = (rotulo, idIcone, conteudo) => {
    const grupo = el("div", "contato__item");
    const dt = el("dt");
    dt.append(icone(idIcone), document.createTextNode(rotulo));
    const dd = el("dd");
    dd.append(conteudo);
    grupo.append(dt, dd);
    dl.append(grupo);
  };
  const local = [c.endereco, c.cidade].filter(Boolean).join(" — ");
  if (local) {
    const bloco = el("span", "", local);
    const mapa = el("a", "contato__mapa", "Abrir no mapa");
    mapa.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`;
    mapa.target = "_blank";
    mapa.rel = "noopener noreferrer";
    bloco.append(document.createElement("br"), mapa);
    linha("Endereço", "i-local", bloco);
  }
  if (c.horarios) linha("Horários", "i-relogio", c.horarios);
  if (EMAIL_VALIDO.test(emailReal)) {
    const a = el("a", "", emailReal);
    a.href = `mailto:${emailReal}`;
    linha("E-mail", "i-email", a);
  }
  const usuarioInsta = String(c.instagram || "").replace(/[^\w.]/g, "");
  if (usuarioInsta) {
    const a = el("a", "", `@${usuarioInsta}`);
    a.href = `https://www.instagram.com/${usuarioInsta}/`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    linha("Instagram", "i-instagram", a);
  }
  if (c.orientacoes) linha("Como chegar", "i-local", c.orientacoes);
  if (!dl.children.length) document.getElementById("contato-pendente").hidden = false;

  document
    .getElementById("contato-whatsapp")
    .append(
      botaoWhatsApp(
        CLINICA.whatsappGeral,
        "Olá! Gostaria de obter informações sobre agendamento na clínica.",
        "Conversar pelo WhatsApp",
        "Conversar com a clínica pelo WhatsApp"
      )
    );

  // Carrossel: rolagem nativa (scroll-snap) + botões; sem rotação automática
  if (temEquipe) {
    const controles = document.getElementById("carrossel-controles");
    const [ant, prox] = controles.querySelectorAll("button");
    const atualizarSetas = () => {
      ant.disabled = faixa.scrollLeft < 4;
      prox.disabled = faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 4;
    };
    const passo = (dir) =>
      faixa.scrollBy({
        left: dir * (faixa.firstElementChild.offsetWidth + parseFloat(getComputedStyle(faixa).columnGap)),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    ant.addEventListener("click", () => passo(-1));
    prox.addEventListener("click", () => passo(1));
    faixa.addEventListener("scroll", atualizarSetas, { passive: true });
    addEventListener("resize", atualizarSetas);
    controles.hidden = false;
    atualizarSetas();
  }

  // Menu mobile
  const botaoMenu = document.getElementById("botao-menu");
  const menu = document.getElementById("menu");
  const definirMenu = (aberto) => {
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("aberto", aberto);
  };
  botaoMenu.addEventListener("click", () =>
    definirMenu(botaoMenu.getAttribute("aria-expanded") !== "true")
  );
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) definirMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("aberto")) {
      definirMenu(false);
      botaoMenu.focus();
    }
  });
  matchMedia("(min-width: 900px)").addEventListener("change", () => definirMenu(false));

  // Cabeçalho compacto após rolar
  const cabecalho = document.querySelector(".cabecalho");
  const marcarRolagem = () => cabecalho.classList.toggle("rolado", scrollY > 12);
  addEventListener("scroll", marcarRolagem, { passive: true });
  marcarRolagem();

  // Revelação na rolagem
  const revelaveis = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visivel");
            obs.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    revelaveis.forEach((n) => obs.observe(n));
  } else {
    revelaveis.forEach((n) => n.classList.add("visivel"));
  }

  document.getElementById("ano").textContent = new Date().getFullYear();

  // Por último: se algo acima falhar (ex.: erro em dados.js), a página fica no modo sem JS, com tudo visível.
  document.documentElement.classList.add("js");
}
