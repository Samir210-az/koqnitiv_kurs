(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu (DİAQNOSTİKA REJİMİ) */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var FB_CONFIG = {
  apiKey: "AIzaSyCBhyGNzZRGgQShP_C9kwAzTm_g_0zJlzg",
  authDomain: "an-psixoloji-33442.firebaseapp.com",
  databaseURL: "https://an-psixoloji-33442-default-rtdb.firebaseio.com",
  projectId: "an-psixoloji-33442"
};

function showDebugThenDeny(msg){
  document.documentElement.style.visibility = "visible";
  var box = document.createElement("div");
  box.style.cssText = "position:fixed;inset:0;background:#0b0f1a;color:#fff;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;font-size:14px;padding:24px;text-align:center;gap:12px";
  box.innerHTML = "<div style=\"font-size:32px\">\u26A0\uFE0F</div><div>Giri\u015F yoxlan\u0131l\u0131r... blokland\u0131:</div><div style=\"color:#f59e0b;font-weight:bold;max-width:90%;word-break:break-all\">" + msg + "</div><div style=\"color:#888;font-size:12px;margin-top:16px\">4 saniy\u0259y\u0259 portala qaytar\u0131l\u0131rs\u0131n\u0131z...</div>";
  document.body.appendChild(box);
  setTimeout(function(){ window.location.replace(PORTAL_URL); }, 4000);
}
function grant(){ document.documentElement.style.visibility = "visible"; }

import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js").then(function(appMod){
  return Promise.all([
    appMod,
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js")
  ]);
}).then(function(mods){
  var appMod = mods[0], authMod = mods[1], dbMod = mods[2];
  var app = appMod.initializeApp(FB_CONFIG);
  var auth = authMod.getAuth(app);
  var db = dbMod.getDatabase(app);

  auth.authStateReady().then(function(){
    var user = auth.currentUser;
    if(!user){ showDebugThenDeny("İstifad\u00e7i tap\u0131lmad\u0131 (auth.currentUser = null). Giri\u015F sessiyas\u0131 bu domendə g\u00f6r\u00fcnm\u00fcr."); return; }

    dbMod.get(dbMod.ref(db, "portal/admins/" + user.uid)).then(function(adminSnap){
      if(adminSnap.val() === true){ grant(); return; }
      dbMod.get(dbMod.ref(db, "portal/customers/" + user.uid)).then(function(snap){
        var cust = snap.val();
        if(!cust){ showDebugThenDeny("UID=" + user.uid + " ucun musteri qeydi tapilmadi (portal/customers/" + user.uid + " boshdur)"); return; }
        dbMod.get(dbMod.ref(db, "portal/courses")).then(function(csnap){
          var courses = csnap.val() || {};
          var allowed = cust.allowedCourses || [];
          var matchInfo = allowed.map(function(cid){
            var c = courses[cid];
            return cid + "=>" + (c ? c.url : "TAPILMADI");
          }).join(" | ");
          var ok = allowed.some(function(cid){
            var c = courses[cid];
            return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
          });
          if(ok){ grant(); } else {
            showDebugThenDeny("COURSE_KEY=" + COURSE_KEY + " | allowedCourses tapilan URL-ler: [" + matchInfo + "] | hec biri uygun gelmedi");
          }
        }).catch(function(e){ showDebugThenDeny("courses oxuma xetasi: " + (e.code||e.message)); });
      }).catch(function(e){ showDebugThenDeny("customer oxuma xetasi: " + (e.code||e.message)); });
    }).catch(function(e){ showDebugThenDeny("admin yoxlama xetasi: " + (e.code||e.message)); });
  }).catch(function(e){ showDebugThenDeny("authStateReady xetasi: " + (e.code||e.message)); });
}).catch(function(e){ showDebugThenDeny("Firebase import xetasi: " + (e.message||e)); });
})();
