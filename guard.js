(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu (Firebase Auth əsaslı) */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var FB_CONFIG = {
  apiKey: "AIzaSyCBhyGNzZRGgQShP_C9kwAzTm_g_0zJlzg",
  authDomain: "an-psixoloji-33442.firebaseapp.com",
  databaseURL: "https://an-psixoloji-33442-default-rtdb.firebaseio.com",
  projectId: "an-psixoloji-33442"
};

function deny(){ window.location.replace(PORTAL_URL); }
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

  authMod.onAuthStateChanged(auth, function(user){
    if(!user){ deny(); return; }
    // Əvvəlcə admin olub-olmadığını yoxla - admin bütün kurslara baxa bilər
    dbMod.get(dbMod.ref(db, "portal/admins/" + user.uid)).then(function(adminSnap){
      if(adminSnap.val() === true){ grant(); return; }
      // Admin deyilsə, adi müştəri kimi icazəsini yoxla
      dbMod.get(dbMod.ref(db, "portal/customers/" + user.uid)).then(function(snap){
        var cust = snap.val();
        if(!cust){ deny(); return; }
        dbMod.get(dbMod.ref(db, "portal/courses")).then(function(csnap){
          var courses = csnap.val() || {};
          var allowed = cust.allowedCourses || [];
          var ok = allowed.some(function(cid){
            var c = courses[cid];
            return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
          });
          if(ok){ grant(); } else { deny(); }
        }).catch(deny);
      }).catch(deny);
    }).catch(deny);
  });
}).catch(deny);
})();
