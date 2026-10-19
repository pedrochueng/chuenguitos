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

  // Especialidades e profissionais num carrossel só: cada cartão é uma especialidade,
  // com o profissional quando houver (sem profissional, o cartão mostra o nome da especialidade)
  const visiveis = especialidadesVisiveis(CLINICA.especialidades, demo);
  const faixa = document.getElementById("carrossel-faixa");
  const equipe = []; // dados de cada cartão, usados na legenda e nas abas
  visiveis.forEach((esp) => {
    const p = profissionalDe(esp, demo);
    const card = el("li", "pessoa");
    const foto = el("figure", "pessoa__foto");
    if (p && p.foto) {
      const img = el("img");
      img.src = p.foto;
      img.alt = `${p.exemplo ? "Foto ilustrativa de" : "Foto de"} ${p.nome}`;
      img.width = 640;
      img.height = 800;
      img.loading = "lazy";
      foto.append(img);
    } else {
      const palavras = (p ? p.nome : esp.nome).trim().split(/\s+/);
      const iniciais = palavras[0][0] + (palavras.length > 1 ? palavras.at(-1)[0] : "");
      const marca = el("span", "pessoa__iniciais", iniciais.toUpperCase()); // sem profissional: inicial da especialidade
      marca.setAttribute("aria-hidden", "true");
      foto.append(marca);
    }
    card.append(foto);
    faixa.append(card);

    const minusculo = esp.nome.toLowerCase();
    equipe.push({
      aba: esp.nome,
      titulo: p ? p.nome : esp.nome,
      area: p ? esp.nome : "",
      exemplo: p ? p.exemplo : !esp.ativa,
      registro: p ? p.registro : "",
      descricao: esp.descricao,
      bio: p ? p.bio : "",
      whatsapp: (p && p.whatsapp) || esp.whatsapp || CLINICA.whatsappGeral, // do profissional, da especialidade ou da clínica
      mensagem: p
        ? `Olá! Gostaria de obter informações sobre agendamento com ${p.nome} (${minusculo}) na clínica.`
        : esp.mensagem,
      rotulo: p ? `Agendar com ${p.nome}` : `Agendar ${minusculo}`,
      rotuloAcessivel: p ? `Agendar com ${p.nome} pelo WhatsApp` : `Agendar ${minusculo} pelo WhatsApp`,
    });
  });
  const temEquipe = faixa.children.length > 0;  document.getElementById("carrossel").hidden = !temEquipe;

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
    if (!/^a definir/i.test(c.endereco || "")) {
      const mapa = el("a", "contato__mapa", "Abrir no mapa");
      mapa.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`;
      mapa.target = "_blank";
      mapa.rel = "noopener noreferrer";
      bloco.append(document.createElement("br"), mapa);
    }
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

  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Alterna pausa/play num botão com aria-pressed e devolve o estado
  const ligarPausa = (botao, rotuloPausar, rotuloRetomar, aoMudar) => {
    botao.hidden = false;
    botao.addEventListener("click", () => {
      const pausado = botao.getAttribute("aria-pressed") !== "true";
      botao.setAttribute("aria-pressed", String(pausado));
      botao.setAttribute("aria-label", pausado ? rotuloRetomar : rotuloPausar);
      aoMudar(pausado);
    });
  };

  // Carrossel 3D (coverflow), portado do componente React: posição fracionária no centro,
  // giro e recuo que suavizam com a distância, anel circular, arrastar com inércia e teclado.
  if (temEquipe) {
    const quadro = document.getElementById("carrossel-quadro");
    const legenda = document.getElementById("carrossel-legenda");
    const abas = document.getElementById("abas");
    const cartoes = [...faixa.children];
    const n = cartoes.length;
    const circular = n > 2; // com 1 ou 2 itens não há anel para girar
    const P = { giro: 44, profundidade: 0.6, falloff: 0.56, fade: 0.1, vao: 0.05 };
    let pos = 0; // índice fracionário do cartão no centro: única fonte de verdade
    let alvo = 0;
    let largura = 0;
    let raf = null;
    let selecionado = -1;
    let arraste = null;

    const indiceDe = (x) => ((Math.round(x) % n) + n) % n;
    const limitar = (x) => (circular ? x : Math.max(0, Math.min(n - 1, x)));

    const mostrarLegenda = (i) => {
      const d = equipe[i];
      const nome = el("h3", "pessoa__nome", d.titulo);
      if (d.exemplo) nome.append(seloExemplo());
      legenda.replaceChildren(nome);
      if (d.area) legenda.append(el("p", "pessoa__area", d.area));
      if (d.registro) legenda.append(el("p", "pessoa__registro", d.registro));
      if (d.descricao) legenda.append(el("p", "pessoa__descricao", d.descricao));
      if (d.bio) legenda.append(el("p", "pessoa__bio", d.bio));
      legenda.append(botaoWhatsApp(d.whatsapp, d.mensagem, d.rotulo, d.rotuloAcessivel));
    };
    const selecionar = (i) => {
      if (i === selecionado) return;
      selecionado = i;
      cartoes.forEach((c, k) => (k === i ? c.setAttribute("aria-current", "true") : c.removeAttribute("aria-current")));
      [...abas.children].forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
      mostrarLegenda(i);
    };

    // Desenha direto no DOM: 60 atualizações por segundo não precisam de re-render
    const pintar = () => {
      if (!largura) return;
      const passo = largura * (1 + P.vao);
      cartoes.forEach((c, i) => {
        let d = i - pos;
        if (circular) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n; // dá a volta pelo caminho mais curto
        }
        const dist = Math.abs(d);
        const rampa = Math.pow(dist, P.falloff); // giro e recuo crescem cada vez menos com a distância
        const giro = Math.min(P.giro * rampa, 82) * Math.sign(d);
        c.style.transform =
          `translateX(calc(-50% + ${d * passo}px)) translateZ(${-P.profundidade * largura * rampa}px) rotateY(${-giro}deg)`;
        // o cartão que cruza o anel na metade da volta precisa ter sumido antes do salto
        const borda = circular ? Math.min(1, Math.max(0, n / 2 - dist)) : 1;
        c.style.opacity = String(Math.max(0, 1 - P.fade * dist) * borda);
        c.style.zIndex = String(100 - Math.round(dist));
      });
    };

    const assentar = (destino) => {
      if (raf !== null) cancelAnimationFrame(raf);
      alvo = destino;
      selecionar(indiceDe(destino));
      if (reduzido) {
        pos = destino;
        pintar();
        raf = null;
        return;
      }
      const passo = () => {
        const falta = destino - pos;
        if (Math.abs(falta) < 0.0004) {
          pos = destino;
          pintar();
          raf = null;
          return;
        }
        pos += falta * 0.16; // desaceleração exponencial
        pintar();
        raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    };
    const irPara = (i) => assentar(limitar(circular ? i + Math.round((alvo - i) / n) * n : i));
    const empurrar = (por) => assentar(limitar(Math.round(alvo) + por));

    // Arrastar: só captura o ponteiro depois de 5px, para o clique num vizinho continuar funcionando
    quadro.addEventListener("pointerdown", (e) => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      alvo = pos;
      arraste = { id: e.pointerId, x: e.clientX, pos, v: 0, t: performance.now(), movendo: false };
    });
    quadro.addEventListener("pointermove", (e) => {
      if (!arraste || arraste.id !== e.pointerId) return;
      if (!arraste.movendo && Math.abs(e.clientX - arraste.x) > 5) {
        arraste.movendo = true;
        quadro.setPointerCapture(e.pointerId);
      }
      if (!arraste.movendo || !largura) return;
      const agora = performance.now();
      const antes = pos;
      pos = limitar(arraste.pos - (e.clientX - arraste.x) / (largura * (1 + P.vao)));
      arraste.v = ((pos - antes) / Math.max(agora - arraste.t, 1)) * 1000; // cartões por segundo
      arraste.t = agora;
      selecionar(indiceDe(pos));
      pintar();
    });
    const soltar = (e) => {
      if (!arraste || arraste.id !== e.pointerId) return;
      const a = arraste;
      arraste = null;
      if (!a.movendo) {
        // Clique: o navegador não encontra os cartões girados pelo hit-test, então resolvemos pela posição na tela
        const sob = cartoes
          .filter((c) => {
            const r = c.getBoundingClientRect();
            return Number(c.style.opacity) > 0.05 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          })
          .sort((x, y) => y.style.zIndex - x.style.zIndex)[0];
        if (sob) irPara(cartoes.indexOf(sob));
        return;
      }
      const levado = Math.max(-2, Math.min(2, a.v * 0.18)); // um arremesso leva até 2 cartões
      assentar(limitar(Math.round(pos + levado)));
    };
    quadro.addEventListener("pointerup", soltar);
    quadro.addEventListener("pointercancel", soltar);
    quadro.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") empurrar(-1);
      else if (e.key === "ArrowRight") empurrar(1);
      else return;
      e.preventDefault();
    });

    // A largura do cartão define passo, profundidade e perspectiva
    new ResizeObserver(() => {
      largura = cartoes[0].offsetWidth;
      pintar();
    }).observe(quadro);
    cartoes.forEach((c, i) => {
      c.setAttribute("role", "group");
      c.setAttribute("aria-roledescription", "slide");
      c.setAttribute("aria-label", `${i + 1} de ${n}`);
    });
    if (n > 1) {
      // Abas: um nome por especialidade; tocar leva o carrossel até ela
      equipe.forEach((d, i) => {
        const aba = el("button", "aba", d.aba);
        aba.type = "button";
        aba.addEventListener("click", () => irPara(i));
        abas.append(aba);
      });
      abas.hidden = false;
    }
    largura = cartoes[0].offsetWidth;
    selecionar(0);
    if (!reduzido) pos = 2.6; // começa aberto em leque e se fecha ao entrar na tela
    pintar();
    if (!reduzido) {
      new IntersectionObserver((es, obs) => {
        if (!es[0].isIntersecting) return;
        obs.disconnect();
        assentar(0);
      }, { threshold: 0.3 }).observe(quadro);
    }

    if (n > 1) {

      // Troca automática: nunca com movimento reduzido; para ao interagir (mouse, foco, arrasto) ou quando sai da tela
      if (!reduzido) {
        let interagindo = false;
        let visivel = false;
        const regiao = document.getElementById("carrossel");
        regiao.addEventListener("pointerenter", () => (interagindo = true));
        regiao.addEventListener("pointerleave", () => (interagindo = false));
        regiao.addEventListener("focusin", () => (interagindo = true));
        regiao.addEventListener("focusout", () => (interagindo = false));
        new IntersectionObserver((es) => (visivel = es[0].isIntersecting)).observe(regiao);
        setInterval(() => {
          if (!interagindo && visivel && !document.hidden && !arraste) empurrar(1);
        }, 4500);
      }
    }
  }
  // Fotos do hero: troca sozinha (fade), com botão de pausa; parada com movimento reduzido
  const fotos = [...document.querySelectorAll("#hero-fotos img")];
  if (fotos.length > 1 && !reduzido) {
    let f = 0;
    let pausada = false;
    ligarPausa(document.getElementById("hero-pausa"), "Pausar a troca de fotos", "Retomar a troca de fotos", (p) => (pausada = p));
    setInterval(() => {
      if (pausada || document.hidden) return;
      fotos[f].classList.remove("ativa");
      fotos[f].setAttribute("aria-hidden", "true");
      f = (f + 1) % fotos.length;
      fotos[f].classList.add("ativa");
      fotos[f].removeAttribute("aria-hidden");
    }, 5000);
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

  // Menu: marca a seção que está na altura do meio da tela
  const pares = [...document.querySelectorAll(".menu ul a")]
    .map((a) => [a, document.querySelector(a.getAttribute("href"))])
    .filter(([, secao]) => secao);
  if ("IntersectionObserver" in window) {
    const espiao = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          pares.forEach(([a, secao]) =>
            secao === e.target ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")
          );
        }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    pares.forEach(([, secao]) => espiao.observe(secao));
  }

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

  // ===== Movimento (o CSS correspondente está na seção "Movimento" de style.css) =====
  // Título do hero: cada palavra sobe de uma máscara, uma depois da outra
  const dividirTexto = (raiz) => {
    let i = 0;
    const percorrer = (no) =>
      [...no.childNodes].forEach((filho) => {
        if (filho.nodeType === 1) return percorrer(filho);
        if (filho.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach((parte) => {
          if (!parte) return;
          if (/^\s+$/.test(parte)) return frag.append(parte);
          const dentro = el("span", "pal__in", parte);
          dentro.style.setProperty("--i", i++);
          const mascara = el("span", "pal");
          mascara.append(dentro);
          frag.append(mascara);
        });
        filho.replaceWith(frag);
      });
    percorrer(raiz);
  };
  const tituloHero = document.getElementById("titulo-hero");
  if (!reduzido) {
    dividirTexto(tituloHero);
    tituloHero.classList.add("dividido");
  }

  // Frase de impacto: as palavras acendem conforme a rolagem (com movimento reduzido, já nasce acesa)
  const frase = document.getElementById("interludio");
  let palavrasFrase = [];
  if (frase) {
    const todas = frase.textContent.trim().split(/\s+/);
    frase.textContent = "";
    todas.forEach((w, i) => {
      frase.append(el("span", reduzido ? "pl acesa" : "pl", w));
      if (i < todas.length - 1) frase.append(" ");
    });
    palavrasFrase = [...frase.children];
  }

  // Listas que entram escalonadas (fases e passos)
  document.querySelectorAll(".fases__lista, .passos__lista").forEach((lista) =>
    [...lista.children].forEach((li, i) => li.style.setProperty("--atraso", `${i * (lista.classList.contains("passos__lista") ? 1.5 : 0.14)}s`))
  );

  if (!reduzido) {
    // Um só laço de rolagem: barra de progresso, parallax da foto do hero e a frase acendendo
    const barra = document.getElementById("progresso");
    const visualHero = document.querySelector(".hero__visual");
    let agendado = false;
    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => {
        agendado = false;
        const max = document.documentElement.scrollHeight - innerHeight;
        barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
        visualHero.style.setProperty("--py", `${Math.min(scrollY, 900) * -0.07}px`);
        if (palavrasFrase.length) {
          const r = frase.getBoundingClientRect();
          const prog = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
          const ate = prog * palavrasFrase.length * 1.15;
          palavrasFrase.forEach((s, i) => s.classList.toggle("acesa", i < ate));
        }
      });
    };
    addEventListener("scroll", aoRolar, { passive: true });
    addEventListener("resize", aoRolar);
    aoRolar();

    // Botões atraídos de leve pelo cursor (só com mouse)
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let ultimo = null;
      const soltar = (b) => b && (b.style.removeProperty("--mx"), b.style.removeProperty("--my"));
      document.addEventListener("pointermove", (e) => {
        const b = e.target.closest && e.target.closest(".botao:not(.botao--pendente)");
        if (b !== ultimo) soltar(ultimo);
        ultimo = b;
        if (!b) return;
        const r = b.getBoundingClientRect();
        const limite = (v) => Math.max(-8, Math.min(8, v));
        b.style.setProperty("--mx", `${limite((e.clientX - (r.left + r.width / 2)) * 0.18)}px`);
        b.style.setProperty("--my", `${limite((e.clientY - (r.top + r.height / 2)) * 0.18)}px`);
      });
    }
  }

  // Por último: se algo acima falhar (ex.: erro em dados.js), a página fica no modo sem JS, com tudo visível.
  document.documentElement.classList.add("js");
}
