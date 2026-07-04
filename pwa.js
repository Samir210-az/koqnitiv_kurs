/* AN Psixoloji Dəstək və Reabilitasiya Mərkəzi — PWA modulu
   By s_akhundoff — https://instagram.com/s_akhundoff
   Avtomatik yükləmə YOXDUR — yalnız istifadəçinin öz seçimi ilə quraşdırılır. */
(function () {
  "use strict";

  // ---- Service Worker qeydiyyatı ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    });
  }

  // Artıq quraşdırılıbsa (standalone rejimdə açılıbsa) heç nə göstərmə
  var isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  var DISMISS_KEY = "kbt_pwa_dismiss_until";
  var DAYS_TO_WAIT = 14;

  function isDismissedRecently() {
    var until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return Date.now() < parseInt(until, 10);
  }

  var deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); // Brauzerin avtomatik bildirişinin qarşısını alırıq
    deferredPrompt = e;
    if (!isDismissedRecently()) {
      showInstallBanner();
    }
  });

  window.addEventListener("appinstalled", function () {
    hideInstallBanner();
    deferredPrompt = null;
  });

  function injectStyles() {
    if (document.getElementById("pwa-banner-style")) return;
    var style = document.createElement("style");
    style.id = "pwa-banner-style";
    style.textContent =
      "#pwaBanner{position:fixed;left:16px;right:16px;bottom:16px;z-index:999;" +
      "display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:18px;" +
      "background:linear-gradient(135deg, rgba(45,212,191,0.16), rgba(139,92,246,0.16)), rgba(15,23,42,0.92);" +
      "border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(14px);" +
      "box-shadow:0 20px 50px -15px rgba(0,0,0,0.6);" +
      "font-family:'Inter',system-ui,sans-serif;color:#eef2ff;" +
      "transform:translateY(140%);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .5s;" +
      "max-width:480px;margin:0 auto;}" +
      "#pwaBanner.show{transform:translateY(0);opacity:1;}" +
      "#pwaBanner .pwa-ico{flex-shrink:0;width:44px;height:44px;border-radius:12px;overflow:hidden;" +
      "border:1px solid rgba(255,255,255,0.15);}" +
      "#pwaBanner .pwa-ico img{width:100%;height:100%;object-fit:cover;display:block;}" +
      "#pwaBanner .pwa-txt{flex:1;min-width:0;}" +
      "#pwaBanner .pwa-txt b{display:block;font-size:.92rem;font-weight:700;margin-bottom:2px;}" +
      "#pwaBanner .pwa-txt span{display:block;font-size:.78rem;color:#a8b3cf;line-height:1.4;}" +
      "#pwaBanner .pwa-actions{display:flex;align-items:center;gap:8px;flex-shrink:0;}" +
      "#pwaBanner button{border:none;cursor:pointer;font-family:inherit;}" +
      "#pwaBanner .pwa-install{background:linear-gradient(135deg,#2dd4bf,#8b5cf6);color:#0b1224;" +
      "font-weight:700;font-size:.82rem;padding:9px 16px;border-radius:11px;white-space:nowrap;" +
      "transition:transform .2s;}" +
      "#pwaBanner .pwa-install:hover{transform:translateY(-2px);}" +
      "#pwaBanner .pwa-close{background:rgba(255,255,255,0.08);color:#a8b3cf;width:30px;height:30px;" +
      "border-radius:50%;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;}" +
      "#pwaBanner .pwa-close:hover{background:rgba(255,255,255,0.16);color:#eef2ff;}" +
      "@media(max-width:480px){#pwaBanner{flex-wrap:wrap;} #pwaBanner .pwa-txt{order:1;width:calc(100% - 60px);} " +
      "#pwaBanner .pwa-ico{order:0;} #pwaBanner .pwa-close{order:2;} #pwaBanner .pwa-actions{order:3;width:100%;margin-top:4px;} " +
      "#pwaBanner .pwa-install{width:100%;text-align:center;}}";
    document.head.appendChild(style);
  }

  function showInstallBanner() {
    injectStyles();
    if (document.getElementById("pwaBanner")) return;

    var banner = document.createElement("div");
    banner.id = "pwaBanner";
    banner.innerHTML =
      '<div class="pwa-ico"><img src="icon-192.png" alt="KBT Kursu"></div>' +
      '<div class="pwa-txt"><b>Tətbiqi telefonunuza yükləyin</b>' +
      "<span>Kursu bir toxunuşla, internet olmadan da açın.</span></div>" +
      '<div class="pwa-actions">' +
      '<button class="pwa-close" id="pwaCloseBtn" aria-label="Bağla">✕</button>' +
      '<button class="pwa-install" id="pwaInstallBtn">Yüklə</button>' +
      "</div>";
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add("show");
      });
    });

    document.getElementById("pwaInstallBtn").addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        hideInstallBanner();
      });
    });

    document.getElementById("pwaCloseBtn").addEventListener("click", function () {
      var until = Date.now() + DAYS_TO_WAIT * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_KEY, String(until));
      hideInstallBanner();
    });
  }

  function hideInstallBanner() {
    var banner = document.getElementById("pwaBanner");
    if (!banner) return;
    banner.classList.remove("show");
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 500);
  }
})();
