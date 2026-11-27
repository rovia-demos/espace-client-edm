(() => {
  'use strict';

  /* ===== Données de démonstration (toutes fictives) ===== */
  const VISITES_30J = [40,37,41,46,37,29,35,38,43,47,39,46,33,30,41,46,46,42,44,33,40,48,42,51,44,46,44,44,53,43];
  const VISITES_AVANT = 1087;
  const DEMANDES_AVANT = 7;
  const APPELS = 64, APPELS_AVANT = 71;

  // jours = il y a combien de jours ; tel/mail jamais affichés en entier (démo)
  const DEMANDES = [
    {id:1, nom:'Julie M.', ville:'Cabestany', jours:0, h:'7 h 48', appareil:'Lave-linge', panne:'ne vidange plus', statut:'nouveau', photo:'lave-linge.jpg',
     msg:"Bonjour, mon lave-linge ne vidange plus depuis hier soir, l'eau reste dans le tambour. Vous pouvez passer cette semaine ? Je suis là tous les après-midis."},
    {id:2, nom:'Karim B.', ville:'Canet-en-Roussillon', jours:1, h:'18 h 15', appareil:'Réfrigérateur', panne:'ne refroidit plus', statut:'nouveau', photo:'frigo.jpg',
     msg:"Le frigo ne fait plus de froid en bas, le congélateur marche encore. Il a 5 ans. C'est assez urgent avec les courses de la semaine."},
    {id:3, nom:'Sandrine P.', ville:'Perpignan', jours:2, h:'11 h 05', appareil:'Four encastrable', panne:'ne chauffe plus', statut:'rappele', photo:'four.jpg',
     msg:"Le four s'allume, la lumière marche, mais il ne chauffe plus du tout. J'ai mis la photo du modèle."},
    {id:4, nom:'Céline D.', ville:'Argelès-sur-Mer', jours:4, h:'14 h 30', appareil:'Machine à café', panne:'fuit par-dessous', statut:'devis', photo:'cafe.jpg',
     msg:"Ma machine à café expresso fuit par-dessous à chaque café. Est-ce que ça vaut le coup de la réparer ?"},
    {id:5, nom:'Michel R.', ville:'Saint-Estève', jours:6, h:'8 h 50', appareil:'Lave-vaisselle', panne:'affiche un code erreur', statut:'devis',
     msg:"Le lave-vaisselle s'arrête au milieu du programme et affiche un code erreur. J'ai déjà nettoyé le filtre."},
    {id:6, nom:'Nadia L.', ville:'Rivesaltes', jours:9, h:'16 h 20', appareil:'Sèche-linge', panne:'ne chauffe plus', statut:'gagne',
     msg:"Le sèche-linge tourne mais le linge ressort mouillé. Disponible le matin de préférence."},
    {id:7, nom:'Thomas G.', ville:'Thuir', jours:12, h:'10 h 10', appareil:'Plaque induction', panne:'un foyer ne s’allume plus', statut:'gagne',
     msg:"Le grand foyer de la plaque induction ne s'allume plus, les trois autres fonctionnent."},
    {id:8, nom:'Patrick V.', ville:'Elne', jours:15, h:'19 h 05', appareil:'Congélateur', panne:'fait beaucoup de bruit', statut:'rappele',
     msg:"Le congélateur fait un bruit fort depuis quelques jours, surtout la nuit. Il congèle encore."},
    {id:9, nom:'Laura S.', ville:'Bompas', jours:19, h:'13 h 40', appareil:'Hotte aspirante', panne:'ne s’allume plus', statut:'perdu',
     msg:"La hotte ne s'allume plus du tout, ni la lumière ni le moteur."},
    {id:10, nom:'Jean-Marc F.', ville:'Le Soler', jours:24, h:'9 h 15', appareil:'Lave-linge', panne:'fuit pendant l’essorage', statut:'gagne',
     msg:"De l'eau coule sous la machine pendant l'essorage. Pouvez-vous me faire un prix pour la réparation ?"}
  ];

  const PAGES = [
    ['Accueil', 812], ['Dépannage à domicile', 436], ['Showroom', 318], ['Cuisine pro', 264], ['Demande de devis', 197]
  ];
  const SHOWROOM = [
    ['Four mixte Rational iCombi Classic', 'Cuisson', 94],
    ['Armoire réfrigérée Infrico', 'Froid', 71],
    ['Lave-vaisselle Smeg', 'Laverie', 58],
    ['Batteur-mélangeur Robot-Coupe', 'Préparation', 39],
    ['Réfrigérateur Smeg', 'Déstockage', 33]
  ];
  const SOURCES = [
    ['Google', 'Recherche Google', 612, '#4285f4', 'G'],
    ['Google Maps', 'Votre fiche sur la carte', 337, '#34a853', 'M'],
    ['Direct', 'Ont tapé l’adresse du site', 162, '#121519', '@'],
    ['Facebook', 'Vos publications Facebook', 137, '#1877f2', 'f']
  ];

  const STATUTS = {
    nouveau:{label:'Nouveau', c:'var(--s-nouveau)'},
    rappele:{label:'Rappelé', c:'var(--s-rappele)'},
    devis:{label:'Devis envoyé', c:'var(--s-devis)'},
    gagne:{label:'Gagné', c:'var(--s-gagne)'},
    perdu:{label:'Perdu', c:'var(--s-perdu)'}
  };
  const ORDRE = Object.keys(STATUTS);

  const sum = a => a.reduce((s, x) => s + x, 0);
  const TOTAL_VISITES = sum(VISITES_30J);
  // Cohérence des chiffres entre les écrans
  console.assert(TOTAL_VISITES === 1248 && sum(SOURCES.map(s => s[2])) === TOTAL_VISITES, 'Chiffres incohérents');
  console.assert(sum(SHOWROOM.map(s => s[2])) <= PAGES[2][1], 'Showroom incohérent');

  /* ===== Stockage navigateur ===== */
  const KEY_STATUTS = 'edm-demo-statuts', KEY_SESSION = 'edm-demo-session';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* navigation privée : on garde en mémoire */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  let saved = store.get(KEY_STATUTS, {});
  let session = store.get(KEY_SESSION, false);
  let email = '';
  let filtre = 'toutes';

  const statutDe = d => STATUTS[saved[d.id]] ? saved[d.id] : d.statut;
  const nbNouveaux = () => DEMANDES.filter(d => statutDe(d) === 'nouveau').length;

  /* ===== Outils ===== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('fr-FR');
  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = (id, extra = '') => `<svg ${extra} aria-hidden="true"><use href="#i-${id}"/></svg>`;

  const jourIlYa = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const quand = d => {
    if (d.jours === 0) return `Aujourd’hui, ${d.h}`;
    if (d.jours === 1) return `Hier, ${d.h}`;
    const date = jourIlYa(d.jours);
    const txt = d.jours < 7
      ? date.toLocaleDateString('fr-FR', {weekday:'long'})
      : date.toLocaleDateString('fr-FR', {day:'numeric', month:'long'});
    return `${txt.charAt(0).toUpperCase() + txt.slice(1)}, ${d.h}`;
  };

  function countUp(el) {
    const fin = +el.dataset.count;
    if (reduit) { el.textContent = fmt(fin); return; }
    const t0 = performance.now(), dur = 1100;
    const pas = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(fin * e));
      if (p < 1) requestAnimationFrame(pas);
    };
    el.textContent = '0';
    requestAnimationFrame(pas);
  }

  let toastTimer;
  function toast(html) {
    const t = $('#toast'), sheet = $('#sheet');
    // au-dessus de la fiche ouverte (couche supérieure du navigateur)
    (sheet.open ? sheet : document.body).appendChild(t);
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  const delta = (n, avant, mot = '') => {
    const d = n - avant;
    return (d >= 0
      ? `<span class="delta up"><i>▲</i>${fmt(d)} de plus${mot}</span>`
      : `<span class="delta down"><i>▼</i>${fmt(-d)} de moins${mot}</span>`);
  };

  /* ===== Écrans de connexion ===== */
  function vueConnexion() {
    $('#auth-view').innerHTML = `
      <form class="rise" novalidate>
        <h1>Votre espace client</h1>
        <p class="lead">Vos demandes de devis et les chiffres de votre site, au même endroit.</p>
        <label class="field" for="email">Votre adresse e-mail</label>
        <input class="input" id="email" type="email" inputmode="email" autocomplete="email" placeholder="vous@exemple.fr" value="${esc(email)}">
        <p class="err" id="err" aria-live="polite"></p>
        <button class="btn btn-red btn-block" type="submit">Recevoir mon code ${icon('arrow')}</button>
      </form>`;
    const f = $('#auth-view form'), inp = $('#email');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = inp.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { $('#err').textContent = 'Entrez une adresse e-mail valide.'; inp.focus(); return; }
      email = v;
      location.hash = '#/code';
    });
    inp.addEventListener('input', () => { $('#err').textContent = ''; });
  }

  function vueCode() {
    $('#auth-view').innerHTML = `
      <form class="rise" novalidate>
        <h1>Entrez le code reçu par mail</h1>
        <p class="lead">Nous avons envoyé un code à 6 chiffres à <strong>${esc(email || 'votre adresse')}</strong>.</p>
        <div class="code" role="group" aria-label="Code à 6 chiffres">
          ${Array.from({length:6}, (_, i) => `<input inputmode="numeric" pattern="[0-9]*" ${i === 0 ? 'autocomplete="one-time-code"' : 'autocomplete="off"'} aria-label="Chiffre ${i + 1}">`).join('')}
        </div>
        <p class="hint">${icon('check')}<span><b>Démo :</b> n’importe quel code fonctionne.</span></p>
        <button class="btn btn-red btn-block" type="submit" style="margin-top:20px">Me connecter</button>
        <a class="back" href="#/connexion">Changer d’adresse e-mail</a>
      </form>`;
    const cases = $$('.code input');
    const valider = () => {
      if (cases.some(c => !c.value)) { cases.find(c => !c.value).focus(); return; }
      $('.code').classList.add('ok');
      session = true;
      store.set(KEY_SESSION, true);
      setTimeout(() => { location.hash = '#/accueil'; }, reduit ? 0 : 450);
    };
    const remplir = (depart, chiffres) => {
      chiffres.split('').forEach((ch, k) => { const c = cases[depart + k]; if (c) { c.value = ch; c.classList.add('filled'); } });
      const suivant = cases.find(c => !c.value);
      if (suivant) suivant.focus(); else { cases[5].blur(); valider(); }
    };
    cases.forEach((c, i) => {
      c.addEventListener('input', () => {
        const chiffres = c.value.replace(/\D/g, '');
        c.value = '';
        c.classList.remove('filled');
        if (chiffres) remplir(i, chiffres.slice(0, 6 - i));
      });
      c.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !c.value && i > 0) { cases[i - 1].value = ''; cases[i - 1].classList.remove('filled'); cases[i - 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && i > 0) cases[i - 1].focus();
        if (e.key === 'ArrowRight' && i < 5) cases[i + 1].focus();
      });
      c.addEventListener('paste', e => {
        const t = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (t) { e.preventDefault(); remplir(i, t.slice(0, 6 - i)); }
      });
      c.addEventListener('focus', () => c.select());
    });
    $('#auth-view form').addEventListener('submit', e => { e.preventDefault(); valider(); });
    setTimeout(() => cases[0].focus(), 50);
  }

  /* ===== Accueil ===== */
  function courbe() {
    const W = 600, H = 150, pad = 8, max = Math.max(...VISITES_30J) * 1.1, n = VISITES_30J.length;
    const pts = VISITES_30J.map((v, i) => [i * W / (n - 1), H - pad - (v / max) * (H - pad * 2)]);
    // courbe lissée (Catmull-Rom → Bézier)
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Courbe des visites sur les 30 derniers jours, entre ${Math.min(...VISITES_30J)} et ${Math.max(...VISITES_30J)} visites par jour">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cddc29" stop-opacity=".38"/><stop offset="1" stop-color="#cddc29" stop-opacity="0"/></linearGradient></defs>
        <g class="clip">
          <path d="${d} L${W},${H} L0,${H} Z" fill="url(#g)" stroke="none"/>
          <path d="${d}" fill="none" stroke="#cddc29" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
        </g>
      </svg>`;
  }

  function vueAccueil() {
    const nb = nbNouveaux();
    const meilleur = Math.max(...VISITES_30J);
    const debut = jourIlYa(29).toLocaleDateString('fr-FR', {day:'numeric', month:'short'});
    const alerte = nb > 0
      ? `<a class="alert rise" style="--i:1" href="#/demandes" data-filtre="nouveau">
           <span class="dot num">${nb}</span>
           <span><strong>${nb} nouvelle${nb > 1 ? 's' : ''} demande${nb > 1 ? 's' : ''} à traiter</strong><span class="sub">Rappelez vite : le premier qui rappelle gagne souvent le chantier.</span></span>
           <span class="go">${icon('arrow')}</span>
         </a>`
      : `<a class="alert calm rise" style="--i:1" href="#/demandes">
           <span class="dot">${icon('check')}</span>
           <span><strong>Tout est traité 👍</strong><span class="sub">Aucune nouvelle demande en attente.</span></span>
           <span class="go">${icon('arrow')}</span>
         </a>`;
    return `
      <div class="page-head rise">
        <div><h1>Bonjour Bruno 👋</h1><p>Voici votre site sur les 30 derniers jours.</p></div>
      </div>
      <div class="grid home">
        ${alerte}
        <section class="hero rise" style="--i:2" aria-label="Visites du site">
          <div class="lbl">Personnes venues sur votre site</div>
          <div class="big num" data-count="${TOTAL_VISITES}">${fmt(TOTAL_VISITES)}</div>
          ${delta(TOTAL_VISITES, VISITES_AVANT, ' que le mois d’avant')}
          <div class="chart">${courbe()}</div>
          <div class="chart-axis" aria-hidden="true"><span>${debut}</span><span>Aujourd’hui</span></div>
          <p class="chart-cap">Meilleur jour : <b>${meilleur} visites</b></p>
        </section>
        <div class="stats">
          <a class="card stat rise" style="--i:3" href="#/demandes" data-filtre="toutes">
            <span class="ico ico-red">${icon('inbox')}</span>
            <span class="lbl">Demandes de devis</span>
            <span class="big num" data-count="${DEMANDES.length}">${DEMANDES.length}</span>
            ${delta(DEMANDES.length, DEMANDES_AVANT)}<span class="vs">que le mois d’avant</span>
          </a>
          <div class="card stat rise" style="--i:4">
            <span class="ico ico-ink">${icon('phone')}</span>
            <span class="lbl">Clics sur «&nbsp;Appeler&nbsp;»</span>
            <span class="big num" data-count="${APPELS}">${APPELS}</span>
            ${delta(APPELS, APPELS_AVANT)}<span class="vs">que le mois d’avant</span>
          </div>
        </div>
      </div>
      <p class="byline byline-app">Espace client par <strong>Rovia</strong></p>`;
  }

  /* ===== Mes demandes ===== */
  function carte(d) {
    const s = statutDe(d), S = STATUTS[s];
    return `
      <article class="req rise" style="--sc:${S.c};--i:${Math.min(d._i, 6)}" data-id="${d.id}">
        <button class="req-open" type="button" data-open="${d.id}" aria-label="Voir la demande de ${d.nom}">
          <div class="req-top">
            <div>
              <div class="req-name">${d.nom}</div>
              <div class="req-meta"><span>${icon('pin')}${d.ville}</span><span>${quand(d)}</span></div>
            </div>
            <span class="status">${S.label}</span>
          </div>
          <div class="req-body">
            <div>
              <div class="req-what">${d.appareil} : ${d.panne}</div>
              <div class="req-msg">${d.msg}</div>
            </div>
            ${d.photo ? `<span class="thumb"><img src="assets/img/${d.photo}" alt="" loading="lazy" width="76" height="76">${icon('cam')}</span>` : ''}
          </div>
        </button>
        <div class="req-actions">
          <button class="btn btn-red" type="button" data-call="${d.id}">${icon('phone')}Appeler</button>
          <button class="btn btn-ghost" type="button" data-mail="${d.id}" aria-label="Envoyer un mail à ${d.nom}">${icon('mail')}Mail</button>
        </div>
      </article>`;
  }

  function vueDemandes() {
    const compte = k => k === 'toutes' ? DEMANDES.length : DEMANDES.filter(d => statutDe(d) === k).length;
    const liste = DEMANDES.filter(d => filtre === 'toutes' || statutDe(d) === filtre).map((d, i) => carte(Object.assign(d, {_i:i})));
    const chips = ['toutes', ...ORDRE].map(k => `
      <button class="chip" type="button" data-f="${k}" aria-pressed="${filtre === k}">
        ${k === 'toutes' ? 'Toutes' : `<span class="sw" style="background:${STATUTS[k].c}"></span>${STATUTS[k].label}`}
        <span class="c">${compte(k)}</span>
      </button>`).join('');
    return `
      <div class="page-head rise"><div><h1>Mes demandes</h1><p>${DEMANDES.length} demandes de devis ces 30 derniers jours.</p></div></div>
      <div class="filters rise" style="--i:1" role="group" aria-label="Trier par statut">${chips}</div>
      <div class="list">${liste.join('') || `<p class="empty">Aucune demande avec ce statut.</p>`}</div>
      <p class="byline byline-app">Espace client par <strong>Rovia</strong></p>`;
  }

  function ouvrirFiche(id) {
    const d = DEMANDES.find(x => x.id === id);
    const sheet = $('#sheet');
    const dessiner = () => {
      const s = statutDe(d);
      sheet.innerHTML = `
        <div class="sheet-in">
          <div class="grab" aria-hidden="true"></div>
          <div class="sheet-head">
            <div>
              <h2 id="sheet-title">${d.nom}</h2>
              <div class="req-meta"><span>${icon('pin')}${d.ville}</span><span>${quand(d)}</span></div>
            </div>
            <button class="icon-btn" type="button" data-close aria-label="Fermer">${icon('close')}</button>
          </div>
          <div class="sheet-actions">
            <button class="btn btn-red" type="button" data-call="${d.id}">${icon('phone')}Appeler</button>
            <button class="btn btn-ghost" type="button" data-mail="${d.id}">${icon('mail')}Envoyer un mail</button>
          </div>
          <div class="box">
            <h3>Où en est cette demande ?</h3>
            <div class="steps" role="group" aria-label="Statut de la demande">
              ${ORDRE.map(k => `
                <button class="step" type="button" data-set="${k}" aria-pressed="${s === k}" style="--sc:${STATUTS[k].c}">
                  <span class="sw"></span>${STATUTS[k].label}${icon('check', 'class="tick"')}
                </button>`).join('')}
            </div>
          </div>
          <div class="box">
            <h3>Sa demande</h3>
            <div class="what">${d.appareil} : ${d.panne}</div>
            <p class="msg">« ${d.msg} »</p>
            ${d.photo ? `<div class="photo"><img src="assets/img/${d.photo}" alt="Photo envoyée par ${d.nom} : ${d.appareil.toLowerCase()}"></div>` : ''}
          </div>
        </div>`;
    };
    dessiner();
    sheet.onclick = e => {
      if (e.target === sheet || e.target.closest('[data-close]')) return fermerFiche();
      const b = e.target.closest('[data-set]');
      if (b) {
        saved[d.id] = b.dataset.set;
        store.set(KEY_STATUTS, saved);
        $$('[data-set]', sheet).forEach(x => x.setAttribute('aria-pressed', x === b));
        majBadges();
        rafraichir = true;
      }
    };
    rafraichir = false;
    document.documentElement.style.overflow = 'hidden';
    sheet.showModal();
    sheet.scrollTop = 0;
  }
  let rafraichir = false;
  function fermerFiche() { $('#sheet').close(); }
  $('#sheet').addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (rafraichir && route() === 'demandes') {
      const y = scrollY;
      $('#view').innerHTML = vueDemandes();
      $$('.rise', $('#view')).forEach(el => el.classList.remove('rise'));
      scrollTo(0, y);
    }
  });

  /* ===== Mon site ===== */
  function barres(rows, couleur) {
    const max = Math.max(...rows.map(r => r.n));
    return `<ol class="rank">${rows.map((r, i) => `
      <li>
        <div class="rank-row"><span class="lab">${r.ico || ''}<span>${r.label}${r.sous ? `<small>${r.sous}</small>` : ''}</span></span><b>${fmt(r.n)}</b></div>
        <div class="bar"><i style="--w:${(r.n / max * 100).toFixed(1)}%;--d:${i};--bc:${r.c || couleur}"></i></div>
      </li>`).join('')}</ol>`;
  }

  function vueSite() {
    const g = SOURCES[0][2] / TOTAL_VISITES;
    return `
      <div class="page-head rise"><div><h1>Mon site</h1><p>Ce que regardent vos visiteurs, sur les 30 derniers jours.</p></div></div>
      <div class="grid site-grid">
        <section class="card rise" style="--i:1">
          <h2>D’où viennent vos visiteurs</h2>
          <p class="say">Sur <b>${fmt(TOTAL_VISITES)} visites</b>, environ <b>1 sur ${Math.round(1 / g)}</b> vous a trouvé sur Google.</p>
          ${barres(SOURCES.map(s => ({label:s[0], sous:s[1], n:s[2], c:s[3], ico:`<span class="src-ico" style="background:color-mix(in srgb,${s[3]} 12%,#fff);color:${s[3]}" aria-hidden="true">${s[4]}</span>`})))}
        </section>
        <section class="card rise" style="--i:2">
          <h2>Les pages les plus vues</h2>
          <p class="say">La page <b>${PAGES[1][0]}</b> arrive juste après l’accueil.</p>
          ${barres(PAGES.map(p => ({label:p[0], n:p[1]})), 'var(--ink)')}
        </section>
        <section class="card rise" style="--i:3">
          <h2>Showroom : les appareils les plus regardés</h2>
          <p class="say">Le <b>${SHOWROOM[0][0].replace(' Classic', '')}</b> attire le plus de monde.</p>
          ${barres(SHOWROOM.map(s => ({label:s[0], sous:s[1], n:s[2]})), 'var(--red)')}
        </section>
      </div>
      <p class="byline byline-app">Espace client par <strong>Rovia</strong></p>`;
  }

  /* ===== Navigation ===== */
  const route = () => (location.hash.replace(/^#\/?/, '') || '').split('?')[0];

  function majBadges() {
    const n = nbNouveaux();
    $$('[data-new]').forEach(b => { b.textContent = n || ''; b.setAttribute('aria-label', n ? `${n} nouvelles` : ''); });
  }

  function afficher() {
    let r = route();
    if (!session && r !== 'connexion' && r !== 'code') { location.replace('#/connexion'); return; }
    if (session && !['accueil', 'demandes', 'site'].includes(r)) { location.replace('#/accueil'); return; }
    if ($('#sheet').open) fermerFiche();

    const auth = r === 'connexion' || r === 'code';
    $('#auth').hidden = !auth;
    $('#app').hidden = auth;
    if (auth) {
      document.title = 'Connexion · Espace client EDM';
      (r === 'code' ? vueCode : vueConnexion)();
      return;
    }
    const vues = {accueil:[vueAccueil, 'Accueil'], demandes:[vueDemandes, 'Mes demandes'], site:[vueSite, 'Mon site']};
    document.title = `${vues[r][1]} · Espace client EDM`;
    const v = $('#view');
    v.innerHTML = vues[r][0]();
    $$('[data-tab]').forEach(a => a.dataset.tab === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    majBadges();
    scrollTo(0, 0);
    v.focus({preventScroll:true});
    $$('[data-count]', v).forEach(countUp);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.chart', v).forEach(c => c.classList.add('in'));
      animerBarres(v);
    }));
  }

  function animerBarres(v) {
    const cartes = $$('.rank', v).map(r => r.closest('.card'));
    if (!('IntersectionObserver' in window)) { cartes.forEach(c => c.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), {threshold:.25});
    cartes.forEach(c => io.observe(c));
  }

  /* ===== Clics ===== */
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-filtre]');
    if (f) filtre = f.dataset.filtre;

    const chip = e.target.closest('[data-f]');
    if (chip) {
      filtre = chip.dataset.f;
      const x = $('.filters').scrollLeft;
      $('#view').innerHTML = vueDemandes();
      $$('.page-head, .filters', $('#view')).forEach(el => el.classList.remove('rise'));
      $('.filters').scrollLeft = x;
      $(`[data-f="${filtre}"]`).focus({preventScroll:true});
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) return ouvrirFiche(+open.dataset.open);

    const call = e.target.closest('[data-call]');
    if (call) {
      const d = DEMANDES.find(x => x.id === +call.dataset.call);
      return toast(`<b>Démo</b> · En vrai, votre téléphone appelle ${d.nom} directement.`);
    }
    const mail = e.target.closest('[data-mail]');
    if (mail) {
      const d = DEMANDES.find(x => x.id === +mail.dataset.mail);
      return toast(`<b>Démo</b> · En vrai, votre messagerie s’ouvre avec une réponse prête pour ${d.nom}`);
    }
    if (e.target.closest('[data-logout]')) {
      session = false;
      store.del(KEY_SESSION);
      location.hash = '#/connexion';
    }
  });

  window.addEventListener('hashchange', afficher);

  // --vh : on ne recalcule que si la largeur change (rotation)
  let largeur = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === largeur) return;
    largeur = innerWidth;
    document.documentElement.style.setProperty('--vh', innerHeight / 100 + 'px');
  });

  afficher();
})();
