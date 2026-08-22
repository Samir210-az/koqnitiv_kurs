(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu v5 (kurs-portali layihəsi, Firebase Auth-suz) */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var DEBUG = location.search.indexOf("debug=1") !== -1;
var FB_CONFIG = {
  apiKey: "AIzaSyAO4jvk3LCVmaAFuki2EZgplGnv76b-CXg",
  authDomain: "kurs-portali.firebaseapp.com",
  databaseURL: "https://kurs-portali-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kurs-portali"
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

log("guard v5 basladi. COURSE_KEY=" + COURSE_KEY);

var token = null;
try{ token = localStorage.getItem("an_session_token"); }catch(e){}
if(!token){ deny("sessiya tokeni yoxdur"); }
else{
  import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js").then(function(appMod){
    log("firebase-app yuklendi");
    return Promise.all([appMod, import("https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js")]);
  }).then(function(mods){
    log("firebase-database yuklendi");
    var appMod = mods[0], dbMod = mods[1];
    var app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(FB_CONFIG);
    var db = dbMod.getDatabase(app);

    dbMod.get(dbMod.ref(db, "sessions/" + token)).then(function(snap){
      var sess = snap.val();
      log("sessiya=" + JSON.stringify(sess));
      if(!sess){ deny("sessiya tapilmadi/vaxti bitib"); return; }

      dbMod.get(dbMod.ref(db, "courses")).then(function(csnap){
        var courses = csnap.val() || {};
        var allowed = sess.allowedCourses || [];
        log("allowedCourses=" + JSON.stringify(allowed));
        var ok = allowed.some(function(cid){
          var c = courses[cid];
          return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
        });
        if(ok){ grant(); } else { deny("kurs uygunlugu tapilmadi"); }
      }).catch(function(e){ deny("courses: " + (e.code||e.message)); });
    }).catch(function(e){ deny("sessions: " + (e.code||e.message)); });
  }).catch(function(e){ deny("import: " + (e.message||e)); });
}
})();
