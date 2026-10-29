/* Luiz Felipe — interações e animações (sem servidor) */
(function () {
  "use strict";

  var cfg = window.LF_CONFIG || {};
  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MSG_PADRAO = "Olá, Luiz Felipe! Vi sua página e quero um orçamento de show de pagode para o meu evento.";

  function linkWhats(msg) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(msg || MSG_PADRAO);
  }
  window.LF_linkWhats = linkWhats;

  /* ---------- Contatos vindos do config.js ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = linkWhats(a.getAttribute("data-msg"));
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    a.href = "https://instagram.com/" + cfg.instagram;
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-ig-texto]").forEach(function (el) { el.textContent = "@" + cfg.instagram; });
  document.querySelectorAll("[data-wa-texto]").forEach(function (el) { el.textContent = cfg.whatsappExibicao; });
  document.querySelectorAll("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Preloader ---------- */
  function liberar() { document.body.classList.add("carregado"); }
  // só o tempo da animação do logo; não espera os vídeos baixarem
  var jaViu = false;
  try { jaViu = !!sessionStorage.getItem("lf-visto"); sessionStorage.setItem("lf-visto", "1"); } catch (e) {}
  setTimeout(liberar, jaViu ? 150 : 900);

  /* ---------- Header + barras fixas ---------- */
  var header = document.querySelector(".header");
  var waFlut = document.querySelector(".wa-flutuante");
  var barraMob = document.querySelector(".barra-mobile");
  var ultimoY = 0;
  function aoRolar() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("rolou", y > 30);
      header.classList.toggle("escondido", y > 400 && y > ultimoY && !document.body.classList.contains("menu-aberto"));
    }
    var mostrar = y > window.innerHeight * 0.5;
    if (waFlut) waFlut.classList.toggle("visivel", mostrar);
    if (barraMob) barraMob.classList.toggle("visivel", mostrar);
    ultimoY = y;
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ---------- Menu mobile ---------- */
  var ham = document.querySelector(".hamburguer");
  if (ham) {
    ham.addEventListener("click", function () {
      var aberto = document.body.classList.toggle("menu-aberto");
      ham.setAttribute("aria-expanded", aberto);
    });
    document.querySelectorAll(".menu a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-aberto"); });
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  var revelaveis = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window && !reduzMovimento) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revelaveis.forEach(function (el) { io.observe(el); });
  } else {
    revelaveis.forEach(function (el) { el.classList.add("visivel"); });
  }

  /* ---------- Partículas douradas ---------- */
  var part = document.querySelector(".particulas");
  if (part && !reduzMovimento) {
    var qtd = window.innerWidth < 700 ? 14 : 28;
    for (var i = 0; i < qtd; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 7 + Math.random() * 10 + "s";
      p.style.animationDelay = -Math.random() * 15 + "s";
      p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      var t = 1 + Math.random() * 3;
      p.style.width = p.style.height = t + "px";
      part.appendChild(p);
    }
  }

  /* ---------- Luz que segue o cursor + brilho nos cards ---------- */
  var luz = document.querySelector(".cursor-luz");
  if (luz && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", function (e) {
      luz.style.left = e.clientX + "px";
      luz.style.top = e.clientY + "px";
    }, { passive: true });
  }
  document.querySelectorAll(".beneficio").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (!reduzMovimento) {
        var rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
      }
    });
    card.addEventListener("mouseleave", function () { card.style.transform = ""; });
  });

  /* ---------- Parallax leve ---------- */
  var parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduzMovimento) {
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        parallax.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var v = parseFloat(el.getAttribute("data-parallax")) || 0.1;
          var desloc = (r.top + r.height / 2 - window.innerHeight / 2) * v;
          el.style.transform = "translate3d(0," + desloc.toFixed(1) + "px,0)";
        });
        tick = false;
      });
    }, { passive: true });
  }

  /* ---------- Som do vídeo do hero ---------- */
  var somBtn = document.querySelector(".hero-celular .som");
  if (somBtn) {
    var vHero = document.querySelector(".hero-celular video");
    var icMudo = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7z"/></svg>';
    var icSom = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
    somBtn.innerHTML = icMudo;
    somBtn.addEventListener("click", function () {
      vHero.muted = !vHero.muted;
      if (!vHero.muted) { vHero.currentTime = 0; vHero.play(); }
      somBtn.innerHTML = vHero.muted ? icMudo : icSom;
      somBtn.setAttribute("aria-label", vHero.muted ? "Ativar som" : "Desativar som");
    });
  }

  /* ---------- Prévia muda no hover dos cards de vídeo ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".video-card[data-video]").forEach(function (card) {
      var previa;
      card.addEventListener("mouseenter", function () {
        if (!previa) {
          previa = document.createElement("video");
          previa.className = "previa";
          previa.src = card.getAttribute("data-video");
          previa.muted = true; previa.loop = true; previa.playsInline = true;
          previa.setAttribute("preload", "auto");
          card.insertBefore(previa, card.querySelector(".play"));
        }
        previa.currentTime = 0;
        var pr = previa.play(); if (pr && pr.catch) pr.catch(function () {});
      });
      card.addEventListener("mouseleave", function () { if (previa) previa.pause(); });
    });
  }

  /* ---------- Lightbox (vídeos e fotos) ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button class="fechar" aria-label="Fechar">✕</button><button class="nav ant" aria-label="Anterior">‹</button><button class="nav prox" aria-label="Próximo">›</button><div class="conteudo"></div><div class="legenda-lb"></div>';
  document.body.appendChild(lb);
  var lbConteudo = lb.querySelector(".conteudo");
  var lbLegenda = lb.querySelector(".legenda-lb");
  var grupo = [], indice = 0;

  function mostrar(i) {
    indice = (i + grupo.length) % grupo.length;
    var el = grupo[indice];
    var video = el.getAttribute("data-video");
    lbConteudo.innerHTML = "";
    if (video) {
      var v = document.createElement("video");
      v.src = video; v.controls = true; v.autoplay = true; v.playsInline = true;
      var poster = el.querySelector("img");
      if (poster) v.poster = poster.currentSrc || poster.src;
      lbConteudo.appendChild(v);
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    } else {
      var img = document.createElement("img");
      var src = el.querySelector("img");
      img.src = el.getAttribute("data-full") || (src && (src.currentSrc || src.src));
      img.alt = src ? src.alt : "";
      lbConteudo.appendChild(img);
    }
    lbLegenda.textContent = el.getAttribute("data-legenda") || "";
    var multiplo = grupo.length > 1;
    lb.querySelector(".ant").style.display = multiplo ? "" : "none";
    lb.querySelector(".prox").style.display = multiplo ? "" : "none";
  }
  function abrir(el) {
    var nome = el.getAttribute("data-grupo");
    grupo = nome ? Array.prototype.slice.call(document.querySelectorAll('[data-grupo="' + nome + '"]:not(.oculto)')) : [el];
    mostrar(grupo.indexOf(el));
    lb.classList.add("aberto");
    document.body.style.overflow = "hidden";
    document.querySelectorAll(".hero-celular video").forEach(function (v) { v.muted = true; });
  }
  function fechar() {
    lb.classList.remove("aberto");
    document.body.style.overflow = "";
    setTimeout(function () { lbConteudo.innerHTML = ""; }, 400);
  }
  document.querySelectorAll("[data-abrir]").forEach(function (el) {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.addEventListener("click", function () { abrir(el); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(el); } });
  });
  lb.querySelector(".fechar").addEventListener("click", fechar);
  lb.querySelector(".ant").addEventListener("click", function () { mostrar(indice - 1); });
  lb.querySelector(".prox").addEventListener("click", function () { mostrar(indice + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("aberto")) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft") mostrar(indice - 1);
    if (e.key === "ArrowRight") mostrar(indice + 1);
  });
  // deslizar no celular
  var toqueX = null;
  lb.addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (toqueX === null || grupo.length < 2) return;
    var dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 60) mostrar(indice + (dx < 0 ? 1 : -1));
    toqueX = null;
  });

  /* ---------- Filtros da página de vídeos ---------- */
  document.querySelectorAll(".filtros").forEach(function (barra) {
    barra.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      barra.querySelectorAll("button").forEach(function (x) { x.classList.toggle("ativo", x === b); });
      var f = b.getAttribute("data-filtro");
      document.querySelectorAll(".video-card[data-cat]").forEach(function (c) {
        var mostra = f === "todos" || c.getAttribute("data-cat").indexOf(f) > -1;
        c.classList.toggle("oculto", !mostra);
      });
    });
  });

  /* ---------- Vídeos de fundo: pausa fora da tela (economiza dados) ---------- */
  if ("IntersectionObserver" in window) {
    var ioV = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.05 });
    document.querySelectorAll("video[data-auto]").forEach(function (v) { ioV.observe(v); });
  }

  // embed do Instagram avisa a própria altura por postMessage; ajusta o iframe para não sobrar branco
  window.addEventListener("message", function (e) {
    if (!/instagram\.com$/.test(new URL(e.origin).hostname)) return;
    var d;
    try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!d || d.type !== "MEASURE" || !d.details || !d.details.height) return;
    document.querySelectorAll(".insta-video iframe").forEach(function (f) {
      if (f.contentWindow === e.source) f.style.height = Math.ceil(d.details.height) + "px";
    });
  });
})();
