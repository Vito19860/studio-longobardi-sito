/* Avviso cookie: il sito usa solo strumenti tecnici e statistiche anonime, quindi è un'informativa
   (nessun consenso da raccogliere). Si mostra alla prima visita e si chiude con "Ho capito". */
(function () {
  var KEY = "sl-cookie-ok";
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}
  var css = ".ck-bar{position:fixed;z-index:80;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);transform:translateX(-50%);width:min(620px,calc(100vw - 24px));display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:16px;background:rgba(10,13,20,.96);border:1px solid rgba(242,165,31,.4);box-shadow:0 18px 50px rgba(0,0,0,.6);backdrop-filter:blur(12px);color:#e9ecf2;font:14px/1.5 'Instrument Sans','Helvetica Neue',Arial,sans-serif;opacity:0;transition:opacity .4s,transform .4s}" +
    ".ck-bar.on{opacity:1}.ck-bar p{margin:0;flex:1}.ck-bar a{color:#ffd27a}" +
    ".ck-bar button{flex:none;border:0;border-radius:30px;padding:10px 18px;background:#f2a51f;color:#120c02;font:500 12px 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}" +
    ".ck-bar button:hover{background:#ffd27a}.ck-bar button:focus-visible{outline:2px solid #fff;outline-offset:3px}" +
    "@media(max-width:560px){.ck-bar{flex-direction:column;align-items:stretch;gap:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}.ck-bar button{width:100%}}";
  function show() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement("div");
    bar.className = "ck-bar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Informativa cookie");
    bar.innerHTML = '<p>Questo sito usa solo cookie tecnici e statistiche di visita anonime, senza profilazione né pubblicità. <a href="/cookie">Cookie policy</a> · <a href="/privacy">Privacy</a></p><button type="button">Ho capito</button>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add("on"); });
    bar.querySelector("button").addEventListener("click", function () {
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      bar.classList.remove("on"); setTimeout(function () { bar.remove(); }, 400);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
})();
