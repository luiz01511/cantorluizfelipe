/* Música de fundo: "A Cara do Golpe" pelo YouTube, com botão para pausar.
 * Navegadores não deixam tocar som sozinho: a música começa muda e o som entra
 * no primeiro toque/clique/tecla do visitante. Continua de onde parou entre páginas. */
(function () {
  "use strict";

  var VIDEO = "IkExT0_OBpc";
  var TITULO = "A Cara do Golpe";
  var CHAVE = "lf-musica"; // { t: segundos, pausada: bool }

  function ler() { try { return JSON.parse(sessionStorage.getItem(CHAVE) || "{}"); } catch (e) { return {}; } }
  function gravar(o) { try { sessionStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {} }

  var estado = ler();
  var player, pronto = false, liberado = false, tocando = false, pausadaPorVideo = false;

  // botão flutuante
  var btn = document.createElement("button");
  btn.className = "musica";
  btn.type = "button";
  btn.innerHTML =
    '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<span class="info"><small>Ouvindo agora</small><strong>' + TITULO + "</strong></span>" +
    '<span class="acao" aria-hidden="true"></span>';
  document.body.appendChild(btn);
  // a página de contratar remove a barra fixa do celular depois deste script
  function verBarra() { btn.classList.toggle("sem-barra", !document.querySelector(".barra-mobile")); }
  document.addEventListener("DOMContentLoaded", verBarra);
  window.addEventListener("load", verBarra);

  var icPlay = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var icPause = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  function desenhar() {
    var ativo = tocando && liberado;
    btn.classList.toggle("tocando", ativo);
    btn.classList.toggle("liberada", liberado);
    btn.querySelector(".acao").innerHTML = ativo ? icPause : icPlay;
    btn.querySelector("small").textContent = ativo ? "Ouvindo agora" : liberado || estado.pausada ? "Música pausada" : "Toque para ouvir";
    btn.setAttribute("aria-label", (ativo ? "Pausar música: " : "Tocar música: ") + TITULO);
  }
  desenhar();

  function tocar() {
    if (!pronto) return;
    player.unMute();
    player.setVolume(70);
    player.playVideo();
  }
  function pausar() { if (pronto) player.pauseVideo(); }

  // primeiro gesto do visitante libera o som
  function liberar(e) {
    if (liberado) return;
    liberado = true;
    ["pointerdown", "keydown", "touchend"].forEach(function (ev) { document.removeEventListener(ev, liberar, true); });
    if (e && btn.contains(e.target)) btn.dataset.ignorarClique = "1";
    if (!estado.pausada) tocar();
    desenhar();
  }
  ["pointerdown", "keydown", "touchend"].forEach(function (ev) { document.addEventListener(ev, liberar, true); });

  btn.addEventListener("click", function () {
    if (btn.dataset.ignorarClique) { delete btn.dataset.ignorarClique; if (!estado.pausada) return; }
    pausadaPorVideo = false;
    if (tocando && liberado) { estado.pausada = true; pausar(); }
    else { estado.pausada = false; tocar(); }
    gravar(estado);
    desenhar();
  });

  // vídeo com som abriu: pausa a música; fechou: volta
  document.addEventListener("lf:som", function () {
    if (tocando && liberado) { pausadaPorVideo = true; pausar(); }
  });
  document.addEventListener("lf:sem-som", function () {
    if (pausadaPorVideo && !estado.pausada) { pausadaPorVideo = false; tocar(); }
  });

  // player escondido
  var caixa = document.createElement("div");
  caixa.className = "musica-player";
  caixa.innerHTML = '<div id="lf-yt"></div>';
  document.body.appendChild(caixa);

  var antes = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (antes) antes();
    player = new YT.Player("lf-yt", {
      width: 200, height: 113, videoId: VIDEO,
      playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: VIDEO, playsinline: 1, rel: 0, start: Math.floor(estado.t || 0) },
      events: {
        onReady: function () {
          pronto = true;
          if (estado.pausada) { player.pauseVideo(); return; }
          player.mute();
          player.playVideo();
          if (liberado) tocar();
        },
        onStateChange: function (e) {
          tocando = e.data === YT.PlayerState.PLAYING;
          desenhar();
        },
      },
    });
  };
  var s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  s.async = true;
  document.head.appendChild(s);

  // guarda a posição para continuar na próxima página
  function salvarTempo() {
    if (pronto && player.getCurrentTime) { estado.t = player.getCurrentTime(); gravar(estado); }
  }
  setInterval(salvarTempo, 2000);
  window.addEventListener("pagehide", salvarTempo);
})();
