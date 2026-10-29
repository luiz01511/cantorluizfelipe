/* Formulário de orçamento em etapas: monta a mensagem e abre o WhatsApp (sem servidor) */
(function () {
  "use strict";

  var form = document.getElementById("form-orcamento");
  if (!form) return;

  // aqui o próprio formulário é o CTA; a barra fixa do celular só atrapalharia
  var barra = document.querySelector(".barra-mobile");
  if (barra) barra.remove();

  var etapas = form.querySelectorAll(".etapa[data-etapa]");
  var barras = form.querySelectorAll(".progresso span");
  var btnAvancar = document.getElementById("avancar");
  var btnVoltar = document.getElementById("voltar");
  var erro = document.getElementById("erro");
  var TOTAL = 4;
  var atual = 1;
  var CHAVE = "lf-orcamento";

  // data mínima = hoje
  var hoje = new Date();
  var iso = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.data.min = iso;

  // formato vindo do link (?formato=)
  var mapaFormato = { "ao-vivo": "f2", completo: "f3" };
  var q = new URLSearchParams(location.search).get("formato");
  if (q && mapaFormato[q]) document.getElementById(mapaFormato[q]).checked = true;

  // rascunho salvo neste navegador
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
    Object.keys(salvo).forEach(function (k) {
      var campo = form.elements[k];
      if (!campo || (k === "formato" && q)) return;
      if (campo instanceof RadioNodeList) {
        Array.prototype.forEach.call(campo, function (r) { r.checked = r.value === salvo[k]; });
      } else campo.value = salvo[k];
    });
  } catch (e) {}
  // sem escolha anterior, já vem marcado o show completo (formato recomendado)
  if (!form.formato.value) document.getElementById("f3").checked = true;
  form.addEventListener("input", function () {
    try { localStorage.setItem(CHAVE, JSON.stringify(dados())); } catch (e) {}
  });

  // máscara de telefone
  form.telefone.addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 11);
    var r = d;
    if (d.length > 2) r = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 7) r = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    this.value = r;
  });

  // ao escolher uma opção, avança sozinho (etapas 1 e 3)
  form.querySelectorAll('input[type="radio"]').forEach(function (r) {
    r.addEventListener("change", function () {
      if (atual === 1 || atual === 3) setTimeout(function () { avancar(); }, 280);
    });
  });

  function dados() {
    return {
      tipo: form.tipo.value,
      data: form.data.value,
      horario: form.horario.value,
      cidade: form.cidade.value.trim(),
      convidados: form.convidados.value,
      local: form.local.value.trim(),
      formato: form.formato.value,
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      obs: form.obs.value.trim(),
    };
  }

  function dataBR(v) {
    if (!v) return "";
    var p = v.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    return p[2] + "/" + p[1] + "/" + p[0] + " (" + dias[d.getDay()] + ")";
  }

  function marcarErro(campo, msg) {
    erro.textContent = msg;
    if (campo) {
      var c = campo.closest(".campo");
      if (c) c.classList.add("erro");
      campo.focus();
    }
    return false;
  }

  function validar(n) {
    erro.textContent = "";
    form.querySelectorAll(".campo.erro").forEach(function (c) { c.classList.remove("erro"); });
    var d = dados();
    if (n === 1 && !d.tipo) return marcarErro(null, "Escolha o tipo do evento para continuar.");
    if (n === 2) {
      if (!d.data) return marcarErro(form.data, "Informe a data do evento.");
      if (d.data < iso) return marcarErro(form.data, "A data precisa ser hoje ou depois.");
      if (!d.cidade) return marcarErro(form.cidade, "Informe a cidade do evento.");
      if (!d.convidados) return marcarErro(form.convidados, "Selecione o número de convidados.");
    }
    if (n === 3 && !d.formato) return marcarErro(null, "Escolha um formato (ou \"Não sei ainda\").");
    if (n === 4) {
      if (d.nome.length < 2) return marcarErro(form.nome, "Informe seu nome.");
      if (d.telefone.replace(/\D/g, "").length < 10) return marcarErro(form.telefone, "Informe um WhatsApp válido com DDD.");
    }
    return true;
  }

  function resumo() {
    var d = dados();
    var linhas = [
      ["Evento", d.tipo], ["Data", dataBR(d.data) + (d.horario ? " às " + d.horario : "")],
      ["Cidade", d.cidade], ["Local", d.local], ["Convidados", d.convidados], ["Formato", d.formato],
    ];
    document.getElementById("resumo").innerHTML = linhas.filter(function (l) { return l[1]; }).map(function (l) {
      var dd = document.createElement("dd"); dd.textContent = l[1];
      return "<dt>" + l[0] + "</dt>" + dd.outerHTML;
    }).join("");
  }

  function mensagem() {
    var d = dados();
    var m = "Olá, Luiz Felipe! Vim pela sua página e quero um orçamento de show.\n\n";
    m += "*Evento:* " + d.tipo + "\n";
    m += "*Data:* " + dataBR(d.data) + (d.horario ? " às " + d.horario : "") + "\n";
    m += "*Cidade:* " + d.cidade + "\n";
    if (d.local) m += "*Local:* " + d.local + "\n";
    m += "*Convidados:* " + d.convidados + "\n";
    m += "*Formato:* " + d.formato + "\n";
    if (d.obs) m += "*Observações:* " + d.obs + "\n";
    m += "\n*Nome:* " + d.nome + "\n*WhatsApp:* " + d.telefone;
    return m;
  }

  // cópia do pedido por e-mail para o Luiz, caso o cliente não chegue a mandar a mensagem no WhatsApp
  function enviarEmail() {
    var email = (window.LF_CONFIG || {}).emailPedidos;
    if (!email) return;
    var d = dados();
    var corpo = {
      _subject: "Novo pedido de orçamento: " + d.nome + " (" + d.tipo + ")",
      _template: "table",
      _captcha: "false",
      Nome: d.nome,
      WhatsApp: d.telefone,
      "Link para chamar": "https://wa.me/55" + d.telefone.replace(/\D/g, ""),
      Evento: d.tipo,
      Data: dataBR(d.data) + (d.horario ? " às " + d.horario : ""),
      Cidade: d.cidade,
      Local: d.local || "-",
      Convidados: d.convidados,
      Formato: d.formato,
      "Observações": d.obs || "-",
      Origem: location.href,
    };
    try {
      fetch("https://formsubmit.co/ajax/" + encodeURIComponent(email), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(corpo),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function ir(n) {
    atual = n;
    etapas.forEach(function (e) { e.classList.toggle("ativa", e.getAttribute("data-etapa") === String(n)); });
    barras.forEach(function (b, i) { b.classList.toggle("feito", n === "ok" || i < n); });
    btnVoltar.style.visibility = n > 1 && n !== "ok" ? "visible" : "hidden";
    btnAvancar.style.display = n === "ok" ? "none" : "";
    btnVoltar.style.display = n === "ok" ? "none" : "";
    btnAvancar.innerHTML = n === TOTAL
      ? 'Enviar pelo WhatsApp <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'
      : "Continuar";
    if (n === TOTAL) resumo();
    var topo = form.getBoundingClientRect().top + window.scrollY - 100;
    if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
  }

  function avancar() {
    if (!validar(atual)) return;
    if (atual < TOTAL) return ir(atual + 1);
    var link = window.LF_linkWhats(mensagem());
    document.getElementById("link-final").href = link;
    ir("ok");
    enviarEmail();
    window.open(link, "_blank", "noopener");
  }

  btnAvancar.addEventListener("click", avancar);
  btnVoltar.addEventListener("click", function () { if (atual > 1) ir(atual - 1); });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); avancar(); }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); avancar(); });
})();
