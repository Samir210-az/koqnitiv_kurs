(function(){"use strict";
/* AN Kurs Portalı - Sessiya Qoruyucusu */
var COURSE_KEY = "koqnitiv_kurs";
var PORTAL_URL = "https://samir210-az.github.io/an-kurs-portali/";
var FB_DB = "https://an-psixoloji-33442-default-rtdb.firebaseio.com";

function deny(){ try{ localStorage.removeItem("an_session"); }catch(e){} window.location.replace(PORTAL_URL); }
function grant(){ document.documentElement.style.visibility = "visible"; }

var raw = null;
try{ raw = localStorage.getItem("an_session"); }catch(e){}
if(!raw){ deny(); }
else{
  var session = null;
  try{ session = JSON.parse(raw); }catch(e){}
  if(!session || !session.username || !session.token){ deny(); }
  else{
    fetch(FB_DB + "/portal/customers.json").then(function(r){ return r.json(); }).then(function(customers){
      if(!customers) throw 0;
      var match = null;
      Object.keys(customers).forEach(function(id){
        var c = customers[id];
        if(c && c.username === session.username && c.activeToken === session.token){ match = c; }
      });
      if(!match) throw 0;
      return fetch(FB_DB + "/portal/courses.json").then(function(r2){ return r2.json(); }).then(function(courses){
        var allowed = match.allowedCourses || [];
        var ok = allowed.some(function(cid){
          var c = courses && courses[cid];
          return c && c.url && c.url.indexOf(COURSE_KEY) !== -1;
        });
        if(!ok) throw 0;
        grant();
      });
    }).catch(function(){ deny(); });
  }
}
})();
