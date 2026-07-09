(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu (DİAQNOSTİKA v2 - avtomatik yox olmur) */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var FB_CONFIG = {
  apiKey: "AIzaSyCBhyGNzZRGgQShP_C9kwAzTm_g_0zJlzg",
  authDomain: "an-psixoloji-33442.firebaseapp.com",
  databaseURL: "https://an-psixoloji-33442-default-rtdb.firebaseio.com",
  projectId: "an-psixoloji-33442"
};

var badge = document.createElement("div");
badge.id = "__anGuardBadge";
badge.style.cssText = "position:fixed;bottom:0;left:0;right:0;background:#111;color:#0f0;font-family:monospace;font-size:12px;padding:10px;z-index:999999;white-space:pre-wrap;word-break:break-all;max-height:50vh;overflow:auto;border-top:3px solid #f59e0b";
badge.textContent = "guard.js başladı...";
function addToBadge(t){
  var d = document.createElement("div");
  d.textContent = t;
  badge.appendChild(d);
}

window.addEventListener("error", function(e){
  addToBadge("JS XETA: " + e.message + " (" + e.filename + ":" + e.lineno + ")");
});

document.addEventListener("DOMContentLoaded", function(){
  document.body.appendChild(badge);
});
// Əgər DOMContentLoaded artıq keçibsə (script sonda yüklənirsə)
if(document.readyState !== "loading"){ document.body ? document.body.appendChild(badge) : null; }

function deny(reason){
  addToBadge("REDDEDILDI: " + reason);
  addToBadge("(portala qaytarilmir - bu diaqnostika reji midir, manual geri qayidin)");
}
function grant(){
  document.documentElement.style.visibility = "visible";
  addToBadge("ICAZE VERILDI ✔ - kurs acilmalidir");
}

addToBadge("Firebase yüklənir...");

import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js").then(function(appMod){
  addToBadge("firebase-app yükləndi");
  return Promise.all([
    appMod,
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js")
  ]);
}).then(function(mods){
  addToBadge("firebase-auth + firebase-database yükləndi");
  var appMod = mods[0], authMod = mods[1], dbMod = mods[2];
  var app = appMod.initializeApp(FB_CONFIG);
  var auth = authMod.getAuth(app);
  var db = dbMod.getDatabase(app);

  addToBadge("authStateReady gözlənilir...");
  auth.authStateReady().then(function(){
    var user = auth.currentUser;
    addToBadge("authStateReady bitdi. user = " + (user ? user.uid : "YOXDUR (null)"));
    if(!user){ deny("istifadeci tapilmadi (bu domendə giriş sessiyası görünmür)"); return; }

    addToBadge("admin yoxlanılır: portal/admins/" + user.uid);
    dbMod.get(dbMod.ref(db, "portal/admins/" + user.uid)).then(function(adminSnap){
      addToBadge("admin oxuma neticesi: " + JSON.stringify(adminSnap.val()));
      if(adminSnap.val() === true){ grant(); return; }

      addToBadge("musteri yoxlanılır: portal/customers/" + user.uid);
      dbMod.get(dbMod.ref(db, "portal/customers/" + user.uid)).then(function(snap){
        var cust = snap.val();
        addToBadge("musteri oxuma neticesi: " + JSON.stringify(cust));
        if(!cust){ deny("musteri qeydi yoxdur"); return; }

        addToBadge("kurslar yuklenir: portal/courses");
        dbMod.get(dbMod.ref(db, "portal/courses")).then(function(csnap){
          var courses = csnap.val() || {};
          var allowed = cust.allowedCourses || [];
          addToBadge("allowedCourses: " + JSON.stringify(allowed));
          addToBadge("courses melumati: " + JSON.stringify(courses));
          var ok = allowed.some(function(cid){
            var c = courses[cid];
            return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
          });
          if(ok){ grant(); } else { deny("COURSE_KEY=" + COURSE_KEY + " heç bir allowedCourse ilə uyğun gəlmədi"); }
        }).catch(function(e){ deny("courses oxuma xetasi: " + (e.code||e.message)); });
      }).catch(function(e){ deny("customer oxuma xetasi: " + (e.code||e.message)); });
    }).catch(function(e){ deny("admin oxuma xetasi: " + (e.code||e.message)); });
  }).catch(function(e){ deny("authStateReady xetasi: " + (e.code||e.message)); });
}).catch(function(e){ deny("Firebase import xetasi: " + (e.message||e)); });
})();
