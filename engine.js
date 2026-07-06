/* Koqnitiv Davranış Terapiyası Kursu — Ortaq JS mühərriki
   By s_akhundoff — https://instagram.com/s_akhundoff */

// Scroll-da bölmələrin görünməsi
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target);} });
},{threshold:0.1});
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('section').forEach(s=>io.observe(s));
});

// Parallax fon "blob"ları
window.addEventListener('mousemove', e=>{
  const mx = (e.clientX/window.innerWidth - 0.5);
  const my = (e.clientY/window.innerHeight - 0.5);
  document.querySelectorAll('.blob').forEach((b,i)=>{
    const speed = (i+1)*16;
    b.style.transform = `translate(${mx*speed}px, ${my*speed}px)`;
  });
});

// ---- Seans Modal Mühərriki ----
// Hər səhifə öz SESSIONS massivini və TOTAL_SESSIONS dəyərini təyin etməlidir
function renderSession(s){
  const total = (typeof TOTAL_SESSIONS !== 'undefined') ? TOTAL_SESSIONS : s.num;
  let html = `<span class="m-tag">Seans ${s.num} / ${total}</span><h3 class="m-title">${s.title}</h3>`;
  if(s.about){
    html += `<div class="m-block"><h5>📖 Seans haqqında</h5><div class="m-goal">${s.about}</div></div>`;
  }
  html += `<div class="m-block"><h5>🎯 Məqsəd</h5><div class="m-goal">${s.goal}</div></div>`;
  if(s.specialists && s.specialists.length){
    html += `<div class="m-block"><h5>🩺 Kimlər tətbiq edə bilər</h5><div class="m-materials">${s.specialists.map(m=>`<span>${m}</span>`).join('')}</div></div>`;
  }
  if(s.materials && s.materials.length){
    html += `<div class="m-block"><h5>🧰 İstifadə olunan ləvazimatlar</h5><div class="m-materials">${s.materials.map(m=>`<span>${m}</span>`).join('')}</div></div>`;
  }
  html += `<div class="m-block"><h5>📋 Seansın gedişi</h5>`;
  s.phases.forEach(ph=>{
    html += `<div class="m-phase"><div class="ph-name">${ph.name}</div>`;
    (ph.text||[]).forEach(t=>{ html += `<p>${t}</p>`; });
    if(ph.dialog && ph.dialog.length){
      html += `<div class="m-dialog">`;
      ph.dialog.forEach(d=>{
        const who = d[0]==='T' ? 'Terapevt' : (d[0]==='K' ? 'Klient' : d[0]);
        const cls = d[0]==='T' ? 't' : (d[0]==='K' ? 'k' : '');
        html += `<div class="dl"><span class="dw ${cls}">${who}:</span><span class="dt">${d[1]}</span></div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;
  if(s.homework){
    html += `<div class="m-block"><h5>📝 Ev tapşırığı</h5><div class="m-homework">${s.homework}</div></div>`;
  }
  html += `<div class="m-nextprev">
    <div class="m-navbtn ${s.num<=1?'disabled':''}" onclick="openSession(${s.num-1})">◂ Əvvəlki seans</div>
    <div class="m-navbtn ${s.num>=total?'disabled':''}" onclick="openSession(${s.num+1})">Növbəti seans ▸</div>
  </div>`;
  return html;
}

function openSession(n){
  if(typeof SESSIONS === 'undefined') return;
  const s = SESSIONS.find(x=>x.num===n);
  if(!s) return;
  document.getElementById('modalContent').innerHTML = renderSession(s);
  document.getElementById('modalOverlay').classList.add('active');
  document.body.classList.add('modal-open');
  const box = document.querySelector('.modal-box');
  if(box) box.scrollTop = 0;
}
function closeSession(){
  const ov = document.getElementById('modalOverlay');
  if(ov) ov.classList.remove('active');
  document.body.classList.remove('modal-open');
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeSession(); });

// ==================================================================
// PROGRAM/TEXNİKA LÜĞƏTİ MODALI — By s_akhundoff
// Mətn daxilində keçən terapiya proqramı/texnika adlarına klikləyəndə
// geniş məlumat (tarixçə, təyinat, istifadə, nəticələr) göstərir.
// ==================================================================
const PROGRAMS_DB = {
"sistematik-desensitizasiya": {title:"Sistematik Desensitizasiya", about:"Joseph Wolpe tərəfindən 1950-ci illərdə inkişaf etdirilmiş klassik davranış terapiyası texnikasıdır. Qarşılıqlı ləğvetmə (reciprocal inhibition) prinsipinə əsaslanır — relaksasiya hissi qorxu hissi ilə eyni anda mövcud ola bilmədiyi üçün, tədricən qorxu obyektinə yaxınlaşarkən bədən sakit saxlanılır.", purpose:"Fobiya və şiddətli qorxu reaksiyalarını, klienti birbaşa ən qorxulu vəziyyətə atmadan, tədricən azaltmaq.", usage:"Əvvəlcə qorxu hiyerarxiyası (asandan çətinə pillələr) qurulur, sonra relaksasiya bacarığı öyrədilir, daha sonra hər pillə relaksasiya vəziyyətində, ən aşağı pillədən başlayaraq tədricən keçilir.", outcomes:"Tədqiqatlar spesifik fobiyalarda yüksək effektivlik göstərir; irəliləyiş adətən pillə-pillə, bir neçə həftə-ay ərzində müşahidə olunur."},
"tedrici-meruzeetme": {title:"Tədrici Məruzəetmə (Graded Exposure)", about:"Məruzəetmə terapiyasının əsas formalarından biri olub, davranış terapiyasının nüvəsini təşkil edir.", purpose:"Qaçınma davranışını aradan qaldırmaq və qorxunun zamanla öz-özünə azaldığını (habituasiya) təcrübədən keçirtmək.", usage:"Qorxulu vəziyyətlər asandan çətinə sıralanır, hər addımda narahatlıq termometrlə izlənilir, addım narahatlıq azalana qədər davam etdirilir, sonra növbəti pilləyə keçilir.", outcomes:"Fobiya, sosial narahatlıq və panik pozuntularda ən çox dəstəklənən müalicə üsullarından biridir."},
"erp": {title:"ERP — Məruzəetmə və Cavabın Qarşısının Alınması", about:"Obsessiv-Kompulsiv Pozuntunun (OKB) qızıl standart müalicəsi sayılır, 1960-70-ci illərdə Viktor Meyer tərəfindən əsası qoyulmuşdur.", purpose:"Obsessiyanın yaratdığı narahatlığı kompulsiya (ritual) etmədən yaşamağı öyrətmək və beynin 'təhlükə yoxdur' siqnalını təbii yolla almasını təmin etmək.", usage:"Klient narahatlıq yaradan vəziyyətə (məs. çirkli səthə toxunma) məruz qalır, lakin adət etdiyi kompulsiyanı (əl yuma) etmək qadağandır; narahatlıq özbaşına azalana qədər gözlənilir.", outcomes:"Tədqiqatlarda OKB simptomlarının 60-80% azalması müşahidə olunur, effekt uzunmüddətli olur."},
"reqabetli-cavab": {title:"Rəqabətli Cavab Öyrədilməsi (Competing Response Training)", about:"Habit Reversal Training (Vərdişin Tərsinə Çevrilməsi) müalicəsinin əsas komponentidir, Azrin və Nunn tərəfindən 1970-ci illərdə hazırlanmışdır.", purpose:"Tikə fiziki olaraq zidd, lakin sosial baxımdan qəbul edilən alternativ hərəkət öyrətməklə tikin tezliyini azaltmaq.", usage:"Əvvəlcə tikdən öncəki bədən siqnalı (premonitory urge) tanınır, sonra bu siqnal gələndə tikə zidd əzələ hərəkəti (məs. boyun tiki üçün boyunu yavaş gərginləşdirmək) 1 dəqiqəyə yaxın tətbiq edilir.", outcomes:"Tourett sindromu və xroniki tik pozuntularında elmi cəhətdən ən çox dəstəklənən davranış müdaxiləsidir."},
"nezaret-dairesi": {title:"Nəzarət Dairəsi Texnikası", about:"Stress idarəetməsində geniş istifadə olunan koqnitiv-davranış alətidir, stoisizm fəlsəfəsindəki 'nəzarət dixotomiyası' ideyasına əsaslanır.", purpose:"Enerjini dəyişdirə bilmədiyimiz şeylərdən, dəyişdirə biləcəyimiz konkret addımlara yönləndirmək.", usage:"İki dairə çəkilir: xarici dairəyə narahatlıq yaradan bütün amillər, daxili kiçik dairəyə isə yalnız şəxsin real nəzarət edə biləcəyi addımlar yazılır.", outcomes:"Çarəsizlik hissini azaldır, problemə fokuslanmış baş etmə strategiyalarını gücləndirir."},
"narahatliq-vaxti": {title:"Narahatlıq Vaxtı Texnikası (Worry Time)", about:"Ümumiləşmiş Narahatlıq Pozuntusunun (GAD) müalicəsində Borkovec tərəfindən təklif olunmuş stimul-nəzarəti texnikasıdır.", purpose:"Narahat fikirlərin gün boyu yayılmasının qarşısını alaraq, onları məhdud, təyin olunmuş vaxta 'toplamaq'.", usage:"Gün ərzində narahat fikir yarandıqda yazılıb təxirə salınır, gündə əvvəlcədən razılaşdırılmış 10-15 dəqiqəlik sabit vaxtda bu fikirlərə düşünülür.", outcomes:"Narahatlığın gündəlik funksionallığa müdaxiləsini azaldır, nəzarət hissini artırır."},
"qutu-nefesi": {title:"Qutu Nəfəsi (Box Breathing)", about:"Diafraqmatik nəfəs texnikalarından biridir, hərbi və klinik kontekstlərdə geniş istifadə olunur (4-4-4-4 ritmi).", purpose:"Parasimpatik sinir sistemini aktivləşdirərək bədəni sürətlə sakitləşdirmək.", usage:"4 saniyə burundan nəfəs alınır, 4 saniyə saxlanılır, 4 saniyə ağızdan verilir, 4 saniyə yenə saxlanılır; dövr bir neçə dəfə təkrarlanır.", outcomes:"Ürək döyüntüsünü və subyektiv narahatlıq səviyyəsini bir neçə dəqiqə ərzində azalda bilir."},
"koqnitiv-restrukturizasiya": {title:"Koqnitiv Restrukturizasiya", about:"Aaron Beck-in Koqnitiv Terapiya modelinin əsas texnikasıdır (1960-cı illər), faydasız düşüncə nümunələrinin sorğulanmasına yönəlib.", purpose:"Təhrif olunmuş, katastrofikləşdirici düşüncələri sübutla müqayisə edərək daha balanslaşdırılmış alternativlərlə əvəz etmək.", usage:"Avtomatik fikir qeydə alınır, dəstəkləyici və əks sübutlar axtarılır, daha realist balanslaşdırılmış fikir formalaşdırılır.", outcomes:"Depressiya, narahatlıq və s. pozuntularda simptomların azalmasına dair güclü elmi dəstək var."},
"davranis-aktivlesdirmesi": {title:"Davranış Aktivləşdirilməsi (Behavioral Activation)", about:"Depressiyanın müalicəsində müstəqil, effektiv bir yanaşma kimi 1990-2000-ci illərdə inkişaf etmişdir (Jacobson və b.).", purpose:"Passivlik-enerjisizlik dövranını qırmaq üçün kiçik, zövq və məna verən fəaliyyətləri tədricən bərpa etmək.", usage:"Əvvəllər zövq verən fəaliyyətlər müəyyənləşdirilir, kiçik, real addımlarla planlaşdırılır və fəaliyyət-əhval əlaqəsi izlənilir.", outcomes:"Bir çox tədqiqatda koqnitiv terapiya qədər effektiv olduğu göstərilmişdir."},
"food-chaining": {title:"Food Chaining (Tədrici Qida Tanışlığı)", about:"Seçici yemə (Avoidant/Restrictive Food Intake Disorder-ə yaxın hallar) üçün loqoped/erqoterapevt sahəsində istifadə olunan müdaxilədir.", purpose:"Yeni qidaları, artıq qəbul edilən qidalara bənzərliyi (rəng, toxuma, dad) əsasında tədricən repertuara daxil etmək.", usage:"Uşağın 'təhlükəsiz' saydığı qidaya toxuma/dad baxımından ən yaxın yeni qida seçilir və kiçik addımlarla (baxmaq→iyləmək→toxunmaq→dadmaq) təqdim olunur.", outcomes:"Yemək repertuarının, təzyiq olmadan, tədricən genişlənməsinə imkan verir."},
"sensor-desensitizasiya": {title:"Sensor Desensitizasiya", about:"Sensor İnteqrasiya nəzəriyyəsinə (A. Jean Ayres) əsaslanan erqoterapiya müdaxiləsidir.", purpose:"Həddindən artıq həssas sensor sistemi tədricən, təzyiqsiz məruzəetmə ilə 'öyrətmək'.", usage:"Stimul ilə tanışlıq ən aşağı intensivlikdən (baxmaq) başlayaraq, klientin öz sürəti ilə daha yüksək intensivliyə (toxunma, dadma) doğru irəlilədilir.", outcomes:"Sensor həssaslığın azalması və gündəlik fəaliyyətlərə (yemək, geyim və s.) daha rahat qatılma."},
"vizuallasdirma": {title:"Vizuallaşdırma Texnikası (Guided Imagery)", about:"İdman psixologiyası və koqnitiv-davranış terapiyasında geniş istifadə olunan zehni məşq üsuludur.", purpose:"Özünəinamı artırmaq və gələcək stresli hadisəyə (imtahan, çıxış) zehni hazırlıq yaratmaq.", usage:"Klient gözlərini yumaraq, bütün hisslərini işə salaraq, uğurlu nəticəni addım-addım təsəvvüründə canlandırır.", outcomes:"Performans narahatlığını azaldır, özünəinam və hazırlıq hissini gücləndirir."},
"problem-hell": {title:"Problem-Həll Bacarıqları Təlimi", about:"D'Zurilla və Goldfried tərəfindən 1970-ci illərdə formalaşdırılmış struktur yanaşmadır.", purpose:"Real, həll edilə bilən çətinliklərə qarşı çarəsizlik hissini azaldıb, konkret fəaliyyət planı qurma bacarığı aşılamaq.", usage:"Problem dəqiq təyin olunur, mümkün həll variantları sadalanır, hər birinin nəticəsi qiymətləndirilir, ən uyğun addım seçilib tətbiq olunur.", outcomes:"Depressiya və narahatlıqda çarəsizlik hissini azaldır, fəallığı artırır."},
"dayan-dusun-fealiyyet": {title:"Dayan-Düşün-Fəaliyyət Göstər", about:"İmpulsiv davranışın idarə edilməsi üçün istifadə olunan sadələşdirilmiş özünütənzimləmə strategiyasıdır (DEHB müdaxilələrində geniş yayılıb).", purpose:"Ani reaksiya ilə fəaliyyət arasına şüurlu bir fasilə yaratmaq.", usage:"Reaksiya vermədən əvvəl qısaca 'dayan', mümkün nəticələr haqqında 'düşün', sonra ən uyğun addımı at.", outcomes:"İmpulsiv sosial və akademik səhvlərin azalmasına kömək edir."},
"cps": {title:"Kollaborativ Problem Həlli (CPS)", about:"Dr. Ross Greene tərəfindən inkişaf etdirilmiş, 'uşaqlar bacardıqları qədər yaxşı davranırlar' fəlsəfəsinə əsaslanan yanaşmadır.", purpose:"Problemli davranışı 'pislik' deyil, çatışmayan bacarıq/ifadə olunmamış ehtiyacın nəticəsi kimi ələ alıb, birgə həll tapmaq.", usage:"Böyük, uşağın perspektivini empatiya ilə dinləyir, öz narahatlığını bildirir, sonra ikisi birlikdə qarşılıqlı qəbul edilən həll axtarır.", outcomes:"Partlayış epizodlarının tezliyini azaldır, valideyn-uşaq münasibətini yaxşılaşdırır."},
"pacing": {title:"Pacing (Enerji İdarəetməsi)", about:"Xroniki xəstəlik və yorğunluq sindromlarının erqoterapiya idarəetməsində geniş istifadə olunan üsuldur.", purpose:"'Hamısı və ya heç nə' fəaliyyət nümunəsinin (yaxşı gündə hər şeyi etmək, sonra tükənmək) qarşısını almaq.", usage:"Fəaliyyətlər kiçik, sabit dozalara bölünür və enerji səviyyəsinə uyğun tarazlı şəkildə paylaşdırılır.", outcomes:"Simptomların kəskin dalğalanmasını azaldır, sabit funksionallıq təmin edir."},
"interoseptiv-meruzeetme": {title:"İnteroseptiv Məruzəetmə", about:"Panik Pozuntusunun müalicəsində istifadə olunan spesifik məruzəetmə formasıdır (Barlow və b.).", purpose:"Bədən simptomlarının (ürək döyüntüsü, baş gicəllənmə) özlərinin təhlükəli olmadığını, birbaşa təcrübədən keçməklə göstərmək.", usage:"Nəzarətli şəkildə (yerində qaçma, fırlanma, nazik boru ilə nəfəs) panikə bənzər fiziki simptomlar yaradılır və təhlükəsiz olduğu müşahidə edilir.", outcomes:"Bədən simptomlarından qorxunu azaldaraq panik atakların tezliyini aşağı salır."},
"y-bocs": {title:"Y-BOCS (Yale-Brown Obsessive Compulsive Scale)", about:"1989-cu ildə Goodman və həmkarları tərəfindən hazırlanmış, OKB üzrə qızıl standart klinik qiymətləndirmə vasitəsidir.", purpose:"Obsessiya və kompulsiyaların şiddətini, tezliyini və funksionallığa təsirini standartlaşdırılmış şəkildə ölçmək.", usage:"Struktur müsahibə formatında, obsessiya və kompulsiya üçün ayrı-ayrı 5 sualdan (vaxt, narahatlıq, müqavimət, nəzarət və s.) ibarətdir, 0-40 aralığında bal verir.", outcomes:"16-23 bal orta, 24-31 ağır, 32+ son dərəcə ağır OKB göstəricisi sayılır; müalicə effektivliyini izləməkdə istifadə olunur."},
"phq-9": {title:"PHQ-9 (Patient Health Questionnaire-9)", about:"Depressiyanın skrininqi üçün ən geniş istifadə olunan özünüqiymətləndirmə alətlərindən biridir (Kroenke və Spitzer, 2001).", purpose:"Son 2 həftədəki depressiv simptomların şiddətini sürətli və etibarlı şəkildə ölçmək.", usage:"9 sual, hər biri 0-3 arası bal ilə qiymətləndirilir (heç vaxt-demək olar hər gün), ümumi bal 0-27 aralığındadır.", outcomes:"5-9 yüngül, 10-14 orta, 15-19 orta-ağır, 20-27 ağır depressiya səviyyəsini göstərir."},
"conners": {title:"Conners Qiymətləndirmə Şkalası", about:"DEHB simptomlarının qiymətləndirilməsi üçün geniş istifadə olunan, valideyn/müəllim/özünüqiymətləndirmə formaları olan alətdir (C. Keith Conners).", purpose:"Diqqətsizlik, hiperaktivlik və impulsivlik simptomlarının şiddətini müxtəlif mühitlərdə (ev, məktəb) ölçmək.", usage:"Valideyn və müəllim ayrı-ayrılıqda anketi doldurur, nəticələr normativ nümunə ilə müqayisə edilir.", outcomes:"Diaqnostik prosesə dəstək verir və müalicə boyu simptomların izlənməsinə imkan yaradır."},
"yerkes-dodson": {title:"Yerkes-Dodson Əyrisi", about:"1908-ci ildə Robert Yerkes və John Dodson tərəfindən təqdim olunmuş, oyanıqlıq və performans arasındakı əlaqəni izah edən psixofizioloji modeldir.", purpose:"Həyəcanın 'düşmən' deyil, optimal səviyyədə faydalı olan bir enerji olduğunu göstərmək.", usage:"Performans-oyanıqlıq əlaqəsi tərs-U formasında təsvir olunur: çox aşağı və çox yüksək oyanıqlıq performansı aşağı salır, orta səviyyə isə optimaldır.", outcomes:"Klientə həyəcanı 'yox etmək' deyil, 'tənzimləmək' məqsədini anlamağa kömək edir."},
"abc-modeli": {title:"ABC Davranış Modeli", about:"Tətbiqi Davranış Analizinin (ABA) əsas çərçivəsidir — Antecedent (Tetikləyici) → Behavior (Davranış) → Consequence (Nəticə).", purpose:"Problemli davranışın hansı kontekstdə baş verdiyini və hansı funksiyaya (diqqət, qaçış, stimul) xidmət etdiyini müəyyənləşdirmək.", usage:"Davranışdan əvvəlki tetikləyici, davranışın özü və ondan sonra baş verən nəticə sistemli şəkildə qeydə alınır.", outcomes:"Müdaxilə planının fərdiləşdirilməsi üçün əsas məlumat bazası yaradır."},
"men-dili": {title:"'Mən' Dili (I-Statements)", about:"Thomas Gordon-un ünsiyyət modelindən (1970-ci illər) qaynaqlanan, ittihamedici dili azaldan kommunikasiya texnikasıdır.", purpose:"Digər tərəfi müdafiəyə keçirməyən, öz hiss və ehtiyacını aydın ifadə edən danışıq tərzi öyrətmək.", usage:"'Sən heç vaxt...' əvəzinə 'Mən ... hiss edirəm, çünki ..., mənə lazımdır ki, ...' strukturundan istifadə olunur.", outcomes:"Münaqişələrin kəskinliyini azaldır, qarşılıqlı anlaşmanı asanlaşdırır."},
"koqnitiv-ucbucaq": {title:"Koqnitiv Üçbucaq (Düşüncə-Hiss-Davranış)", about:"Aaron Beck-in Koqnitiv modelinin əsas vizual alətidir.", purpose:"Düşüncələrin hiss və davranışlara necə birbaşa təsir etdiyini sadə, əyani şəkildə göstərmək.", usage:"Konkret bir vəziyyət üzərində düşüncə, bundan yaranan hiss və nəticədəki davranış ayrı-ayrı yazılıb əlaqələndirilir.", outcomes:"Klientin öz koqnitiv nümunələrini tanıma bacarığını artırır."},
"qorxu-termometri": {title:"Qorxu/Narahatlıq Termometri (SUDS)", about:"Subjective Units of Distress Scale — Wolpe tərəfindən təqdim olunmuş 0-10 (və ya 0-100) subyektiv narahatlıq ölçü vasitəsidir.", purpose:"Narahatlığın intensivliyini sadə, izlənə bilən rəqəmə çevirmək.", usage:"Klientdən verilən anda narahatlığını 0 (tam sakit) - 10 (ən yüksək) arası qiymətləndirməsi istənilir; məruzəetmə boyu davamlı izlənilir.", outcomes:"İrəliləyişin obyektiv izlənməsinə və məruzəetmə sürətinin tənzimlənməsinə imkan verir."},
"ezele-bosaltma": {title:"Mütərəqqi Əzələ Boşaltma (PMR)", about:"Edmund Jacobson tərəfindən 1920-ci illərdə hazırlanmış relaksasiya texnikasıdır.", purpose:"Bədəndəki fiziki gərginliyi sistemli şəkildə azaltmaq.", usage:"Əzələ qrupları ardıcıl olaraq (ayaqdan başa doğru) əvvəlcə sıxılır, sonra birdən buraxılır, fərq hiss edilir.", outcomes:"Fiziki gərginliyi və subyektiv narahatlığı azaldır, yuxu keyfiyyətini yaxşılaşdırır."},
"xatire-qutusu": {title:"Xatirə Qutusu (Memory Box / Continuing Bonds)", about:"Yas terapiyasında 'continuing bonds' (davam edən bağlar) nəzəriyyəsinə əsaslanan simvolik alətdir (Klass, Silverman & Nickman, 1996).", purpose:"İtirilən şəxslə əlaqəni 'kəsmək' əvəzinə, yeni, daşına bilən formada davam etdirmək.", usage:"Şəkillər, əşyalar, yazılı xatirələr toplanaraq simvolik bir qutuda/kitabda saxlanılır.", outcomes:"Yas prosesini asanlaşdırır, itkiyə dair müsbət bağlılığı qoruyur."},
"5-4-3-2-1": {title:"5-4-3-2-1 Torpaqlanma Texnikası", about:"Sensor əsaslı torpaqlanma (grounding) texnikalarından biridir, akut narahatlıq/panik anlarında istifadə olunur.", purpose:"Diqqəti həddindən artıq düşüncədən bədən və ətraf mühitin konkret hisslərinə yönəltmək.", usage:"5 görülən, 4 toxunulan, 3 eşidilən, 2 qoxulanan, 1 dadılan şey ardıcıl adlandırılır.", outcomes:"Akut narahatlıq/dissosiasiya anlarında sürətli sakitləşmə təmin edir."},
};

function findProgramKey(key){ return PROGRAMS_DB[key]; }

function renderProgram(key){
  const p = PROGRAMS_DB[key];
  if(!p) return '<p>Məlumat tapılmadı.</p>';
  let html = `<span class="m-tag">Proqram / Texnika</span><h3 class="m-title">${p.title}</h3>`;
  html += `<div class="m-block"><h5>📖 Tarixçə və kontekst</h5><div class="m-goal">${p.about}</div></div>`;
  html += `<div class="m-block"><h5>🎯 Təyinatı</h5><div class="m-goal">${p.purpose}</div></div>`;
  html += `<div class="m-block"><h5>🛠️ İstifadə yönümü</h5><div class="m-goal">${p.usage}</div></div>`;
  html += `<div class="m-block"><h5>📈 Nəticələri</h5><div class="m-goal">${p.outcomes}</div></div>`;
  return html;
}

function openProgram(key){
  const content = renderProgram(key);
  const el = document.getElementById('programModalContent');
  const ov = document.getElementById('programModalOverlay');
  if(!el || !ov){
    // fallback: reuse session modal container if page has no dedicated program modal
    const alt = document.getElementById('modalContent');
    const altOv = document.getElementById('modalOverlay');
    if(alt && altOv){ alt.innerHTML = content; altOv.classList.add('active'); document.body.classList.add('modal-open'); }
    return;
  }
  el.innerHTML = content;
  ov.classList.add('active');
  document.body.classList.add('modal-open');
}
function closeProgram(){
  const ov = document.getElementById('programModalOverlay');
  if(ov) ov.classList.remove('active');
  if(!document.getElementById('modalOverlay') || !document.getElementById('modalOverlay').classList.contains('active')){
    document.body.classList.remove('modal-open');
  }
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeProgram(); });
