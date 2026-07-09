(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu (BİRLƏŞDİRİLMİŞ - istehsal + debug) */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var DEBUG = location.search.indexOf("debug=1") !== -1;
var FB_CONFIG = {
  apiKey: "AIzaSyCBhyGNzZRGgQShP_C9kwAzTm_g_0zJlzg",
  authDomain: "an-psixoloji-33442.firebaseapp.com",
  databaseURL: "https://an-psixoloji-33442-default-rtdb.firebaseio.com",
  projectId: "an-psixoloji-33442"
};

var badge = null;
function log(t){
  if(!DEBUG) return;
  if(!badge){
    badge = document.createElement("div");
    badge.id = "__anGuardBadge";
    badge.style.cssText = "visibility:visible !important;position:fixed;bottom:0;left:0;right:0;background:#111;color:#0f0;font-family:monospace;font-size:12px;padding:10px;z-index:999999;white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;border-top:3px solid #f59e0b";
    (document.body || document.documentElement).appendChild(badge);
  }
  var d = document.createElement("div");
  d.textContent = t;
  badge.appendChild(d);
}
function mountIfNeeded(){ if(DEBUG && badge && !document.getElementById("__anGuardBadge") && document.body){ document.body.appendChild(badge); } }
document.addEventListener("DOMContentLoaded", mountIfNeeded);

function deny(reason){
  log("REDDEDILDI: " + (reason||""));
  if(DEBUG){
    document.documentElement.style.visibility = "visible";
    log("(debug rejimi - geri qaytarilmir)");
  } else {
    window.location.replace(PORTAL_URL);
  }
}
function grant(){
  document.documentElement.style.visibility = "visible";
  log("ICAZE VERILDI");
}

log("guard basladi. COURSE_KEY=" + COURSE_KEY);

import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js").then(function(appMod){
  log("firebase-app yuklendi");
  return Promise.all([
    appMod,
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js")
  ]);
}).then(function(mods){
  log("firebase-auth + firebase-database yuklendi");
  var appMod = mods[0], authMod = mods[1], dbMod = mods[2];
  var app = appMod.initializeApp(FB_CONFIG);
  var auth = authMod.getAuth(app);
  var db = dbMod.getDatabase(app);

  auth.authStateReady().then(function(){
    var user = auth.currentUser;
    log("authStateReady bitdi. user=" + (user ? user.uid : "null"));
    if(!user){ deny("istifadeci yoxdur"); return; }

    dbMod.get(dbMod.ref(db, "portal/admins/" + user.uid)).then(function(adminSnap){
      log("admin=" + JSON.stringify(adminSnap.val()));
      if(adminSnap.val() === true){ grant(); return; }

      dbMod.get(dbMod.ref(db, "portal/customers/" + user.uid)).then(function(snap){
        var cust = snap.val();
        log("customer=" + JSON.stringify(cust));
        if(!cust){ deny("musteri qeydi yoxdur"); return; }

        dbMod.get(dbMod.ref(db, "portal/courses")).then(function(csnap){
          var courses = csnap.val() || {};
          var allowed = cust.allowedCourses || [];
          log("allowedCourses=" + JSON.stringify(allowed));
          var ok = allowed.some(function(cid){
            var c = courses[cid];
            return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
          });
          if(ok){ grant(); } else { deny("kurs uygunlugu tapilmadi"); }
        }).catch(function(e){ deny("courses: " + (e.code||e.message)); });
      }).catch(function(e){ deny("customer: " + (e.code||e.message)); });
    }).catch(function(e){ deny("admin: " + (e.code||e.message)); });
  }).catch(function(e){ deny("authStateReady: " + (e.code||e.message)); });
}).catch(function(e){ deny("import: " + (e.message||e)); });
})();
