/**
 * public/js/panelHome.js – Discover mejorado con secciones y catálogo ampliado
 */

const PanelHome = (() => {

  const CATALOGO = [
    // ── TENDENCIAS ──────────────────────────────────────────────────────────
    { nombre:"Breaking Bad",   genero:"Drama",     temporadas:5, anio:2008, tmdbId:1396,   sinopsis:"Un profesor de química con cáncer terminal se convierte en fabricante de metanfetamina junto a su ex-alumno para asegurar el futuro de su familia." },
    { nombre:"Stranger Things",genero:"Sci-Fi",    temporadas:4, anio:2016, tmdbId:66732,  sinopsis:"Un grupo de amigos en Hawkins se enfrenta a fuerzas sobrenaturales y experimentos secretos del gobierno. El homenaje perfecto a los 80s." },
    { nombre:"The Last of Us", genero:"Drama",     temporadas:2, anio:2023, tmdbId:100088, sinopsis:"En un mundo postapocalíptico, un contrabandista y una adolescente inmune cruzan el país entre ruinas y esperanza." },
    { nombre:"Dark",           genero:"Misterio",  temporadas:3, anio:2017, tmdbId:70523,  sinopsis:"Cuatro familias interconectadas descubren una cueva que abre portales a distintas épocas. Complejidad narrativa sin precedentes." },
    { nombre:"Succession",     genero:"Drama",     temporadas:4, anio:2018, tmdbId:76331,  sinopsis:"La familia Roy se desgarra mientras el patriarca se niega a ceder el control de su conglomerado mediático. Shakespeariano y brutal." },
    { nombre:"Severance",      genero:"Sci-Fi",    temporadas:2, anio:2022, tmdbId:95396,  sinopsis:"Empleados de Lumon Industries separan quirúrgicamente sus recuerdos laborales de los personales. Obra maestra del suspense corporativo." },
    { nombre:"Arcane",         genero:"Animación", temporadas:2, anio:2021, tmdbId:94605,  sinopsis:"Dos hermanas separadas por la guerra entre Piltover y Zaun. La serie animada más impresionante visualmente jamás producida." },
    { nombre:"Chernobyl",      genero:"Drama",     temporadas:1, anio:2019, tmdbId:87108,  sinopsis:"La historia verídica del peor accidente nuclear de la historia y de quienes sacrificaron todo para salvar a Europa." },
    { nombre:"The Boys",       genero:"Acción",    temporadas:4, anio:2019, tmdbId:76479,  sinopsis:"Cuando los superhéroes abusan de su poder, un grupo de ciudadanos comunes decide hacerles frente. Sátira sin filtros del capitalismo." },
    { nombre:"Better Call Saul",genero:"Drama",    temporadas:6, anio:2015, tmdbId:60059,  sinopsis:"La transformación de Jimmy McGill en Saul Goodman. Un prequel que supera al original en profundidad y melancolía." },
    { nombre:"Black Mirror",   genero:"Sci-Fi",    temporadas:6, anio:2011, tmdbId:42009,  sinopsis:"Antología que explora el lado oscuro de la tecnología moderna. Cada episodio es un golpe al espejo de nuestra sociedad." },
    { nombre:"Peaky Blinders",  genero:"Drama",    temporadas:6, anio:2013, tmdbId:60574,  sinopsis:"Los Shelby escalan desde Birmingham hasta el Parlamento inglés en el turbulento periodo de entreguerras." },
    { nombre:"Fallout",        genero:"Sci-Fi",    temporadas:1, anio:2024, tmdbId:106379, sinopsis:"Una heredera de un refugio, un cazarrecompensas y un soldado navegan la superficie radiactiva de Los Ángeles 200 años después del apocalipsis." },
    { nombre:"Shogun",         genero:"Drama",     temporadas:1, anio:2024, tmdbId:81189,  sinopsis:"Un navegante inglés en el Japón feudal del siglo XVII se convierte en pieza clave en la guerra por el shogunato." },
    { nombre:"The Bear",       genero:"Drama",     temporadas:3, anio:2022, tmdbId:136315, sinopsis:"Un chef de élite hereda la sandwichería caótica de su hermano fallecido. La serie más estresante y emotiva sobre trabajo y duelo." },
    { nombre:"Invincible",     genero:"Acción",    temporadas:3, anio:2021, tmdbId:95557,  sinopsis:"El hijo de Omni-Man descubre una verdad devastadora sobre su padre. Animación adulta que no escatima en consecuencias." },
  ];

  // Series adicionales para secciones (sin poster TMDB, usan placeholder elegante)
  const DRAMA_EXTRA = [
    { nombre:"The Wire",        genero:"Drama",  temporadas:5, anio:2002, sinopsis:"La guerra contra el crimen en Baltimore vista desde todos los ángulos. La serie más compleja y realista jamás hecha." },
    { nombre:"The Sopranos",    genero:"Drama",  temporadas:6, anio:1999, sinopsis:"Tony Soprano, jefe de la mafia de Nueva Jersey, intenta equilibrar su vida criminal con su familia. La serie que cambió la televisión para siempre." },
    { nombre:"Mad Men",         genero:"Drama",  temporadas:7, anio:2007, sinopsis:"Don Draper y la agencia Sterling Cooper navegan los años 60 en Madison Avenue. Un retrato brillante de identidad, ambición y cambio social." },
    { nombre:"The Crown",       genero:"Drama",  temporadas:6, anio:2016, sinopsis:"La historia de la familia real británica desde la coronación de Isabel II. Épica íntima de poder, deber y sacrificio." },
    { nombre:"Mindhunter",      genero:"Drama",  temporadas:2, anio:2017, sinopsis:"Dos agentes del FBI forjan la ciencia del perfilado criminal entrevistando asesinos en serie. Tensa y psicológicamente fascinante." },
    { nombre:"Ozark",           genero:"Drama",  temporadas:4, anio:2017, sinopsis:"Un asesor financiero se ve obligado a blanquear dinero para un cartel mexicano en los Ozarks. Breaking Bad meets el Medio Oeste." },
  ];

  const SCIFI_EXTRA = [
    { nombre:"The Expanse",      genero:"Sci-Fi", temporadas:6, anio:2015, sinopsis:"En un futuro donde la humanidad colonizó el sistema solar, una conspiración amenaza la frágil paz entre la Tierra, Marte y el Cinturón." },
    { nombre:"Westworld",        genero:"Sci-Fi", temporadas:4, anio:2016, sinopsis:"Un parque temático de androides conscientes cuestiona la naturaleza de la conciencia y el libre albedrío. Filosofía y acción a partes iguales." },
    { nombre:"The Mandalorian",  genero:"Sci-Fi", temporadas:3, anio:2019, sinopsis:"Un cazarrecompensas solitario en los márgenes de la galaxia debe proteger a un misterioso niño de poderosas fuerzas. Baby Yoda incluido." },
    { nombre:"Andor",            genero:"Sci-Fi", temporadas:1, anio:2022, sinopsis:"El origen de Cassian Andor y los primeros pasos de la Rebelión. La serie de Star Wars más madura y política jamás producida." },
    { nombre:"Cyberpunk: Edgerunners",genero:"Sci-Fi",temporadas:1,anio:2022,sinopsis:"Un chico de la calle de Night City se convierte en mercenario cyberpunk. Studio Trigger en su máxima expresión visual y emocional." },
    { nombre:"Fringe",           genero:"Sci-Fi", temporadas:5, anio:2008, sinopsis:"Un equipo especial del FBI investiga casos que desafían las leyes de la ciencia. La exploración de universos paralelos más adictiva de la televisión." },
  ];

  const COMEDIA_EXTRA = [
    { nombre:"The Office",    genero:"Comedia", temporadas:9, anio:2005, sinopsis:"La vida absurda de los empleados de Dunder Mifflin. El mockumentary más querido de todos los tiempos." },
    { nombre:"Ted Lasso",     genero:"Comedia", temporadas:3, anio:2020, sinopsis:"Un entrenador de fútbol americano toma las riendas de un equipo inglés sin saber nada del deporte. Optimismo contagioso." },
    { nombre:"Fleabag",       genero:"Comedia", temporadas:2, anio:2016, sinopsis:"Una mujer londinense habla directamente a la cámara sobre su caótica vida. Phoebe Waller-Bridge en estado puro de genialidad." },
    { nombre:"Abbott Elementary",genero:"Comedia",temporadas:3,anio:2021,sinopsis:"Profesores de una escuela pública de Filadelfia sobreviven la burocracia con humor y corazón. El mejor mockumentary desde The Office." },
    { nombre:"Arrested Development",genero:"Comedia",temporadas:5,anio:2003,sinopsis:"Los Bluth, una familia disfuncional de millonarios venidos a menos. La comedia con más capas y chistes escondidos de la historia." },
    { nombre:"Brooklyn Nine-Nine",genero:"Comedia",temporadas:8,anio:2013,sinopsis:"El precinto 99 de Brooklyn y sus detectives excéntricos. Comedia policial sin tópicos que amas a todos sus personajes." },
  ];

  const TMDB_POSTERS = {
    1396:'/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    66732:'/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    100088:'/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    70523:'/t/p/w500/apbrbWs5eXleyQIABksVmYTE4Eh.jpg',
    76331:'/t/p/w500/e2X8FMZTU2IPYdQMsGMOVJaLsCp.jpg',
    95396:'/t/p/w500/lHf9E5x9ZKpvENFqRZFKXSCFvvM.jpg',
    94605:'/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    87108:'/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    76479:'/t/p/w500/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg',
    60059:'/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
    42009:'/t/p/w500/7PRddO7z7mcPi21nZTCMGShAyy1.jpg',
    60574:'/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkPaZuH.jpg',
    106379:'/t/p/w500/AnsSKX5BrFkSJkbSMnGEVFJHLgF.jpg',
    81189:'/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYy.jpg',
    136315:'/t/p/w500/sHm7AiM8GqvIBB8qmRN0nCseBMJ.jpg',
    95557:'/t/p/w500/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg',
  };

  function _getImg(serie) {
    if (serie.tmdbId && TMDB_POSTERS[serie.tmdbId])
      return `https://image.tmdb.org${TMDB_POSTERS[serie.tmdbId]}`;
    // Placeholder estilizado con gradiente
    const colors = ['2d1b69','1a1a2e','0f3460','16213e','1b2838','0d1b2a'];
    const color = colors[Math.abs(serie.nombre.length * 7) % colors.length];
    return `https://placehold.co/300x450/${color}/cccccc?text=${encodeURIComponent(serie.nombre.substring(0,12))}`;
  }

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  const GENRE_EMOJI = { 'Drama':'🎭','Sci-Fi':'🚀','Comedia':'😂','Acción':'💥',
    'Terror':'👻','Misterio':'🔍','Animación':'🎨','Crimen':'🔫','Fantasía':'🧙','Romance':'💕','Documental':'📽' };

  const PLATFORM_COLORS = { 'Netflix':'#e50914','HBO Max':'#8440ca','Prime Video':'#00a8e0',
    'Disney+':'#113ccf','Apple TV+':'#555555','Hulu':'#1ce783','AMC+':'#333333','Paramount+':'#0064ff' };

  // ── Slide card (sin botón queue) ─────────────────────────────────────────
  function _buildSlide(serie, idx, catalog) {
    const img = _getImg(serie);
    return `
      <div class="nf-slide" data-idx="${idx}" data-catalog="${catalog}">
        <div class="nf-slide-img-wrap">
          <img src="${img}" alt="${_esc(serie.nombre)}" loading="lazy"
               onerror="this.src='https://placehold.co/300x450/1a1a2e/cccccc?text=${encodeURIComponent(serie.nombre.substring(0,12))}'" />
          <div class="nf-slide-overlay">
            <span class="nf-genre-chip">${GENRE_EMOJI[serie.genero]||'🎬'} ${_esc(serie.genero)}</span>
          </div>
        </div>
        <div class="nf-slide-info">
          <div class="nf-slide-title">${_esc(serie.nombre)}</div>
          <div class="nf-slide-meta">${serie.temporadas} temp. · ${serie.anio||''}</div>
          <div class="nf-slide-actions">
            <button class="nf-btn-ver" data-idx="${idx}" data-catalog="${catalog}">▶ Ver</button>
          </div>
        </div>
      </div>`;
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function _getSerie(idx, catalog) {
    if (catalog === 'drama')   return DRAMA_EXTRA[idx];
    if (catalog === 'scifi')   return SCIFI_EXTRA[idx];
    if (catalog === 'comedia') return COMEDIA_EXTRA[idx];
    return CATALOGO[idx];
  }

  function _openModal(idx, catalog) {
    const serie = _getSerie(idx, catalog);
    if (!serie) return;
    const img = _getImg(serie);

    let modalEl = document.getElementById('nf-detail-modal');
    if (!modalEl) { modalEl = document.createElement('div'); modalEl.id = 'nf-detail-modal'; modalEl.className = 'nf-modal-overlay'; document.body.appendChild(modalEl); }

    modalEl.innerHTML = `
      <div class="nf-modal-card" role="dialog" aria-modal="true">
        <div class="nf-modal-hero">
          <img src="${img}" alt="${_esc(serie.nombre)}"
               onerror="this.src='https://placehold.co/540x280/1a1a2e/aaa?text=${encodeURIComponent(serie.nombre.substring(0,12))}'" />
          <div class="nf-modal-hero-gradient"></div>
          <button class="nf-modal-close" id="nf-modal-close" aria-label="Cerrar">✕</button>
          <div class="nf-modal-hero-title">
            <h2>${_esc(serie.nombre)}</h2>
            <div class="nf-modal-meta-row">
              ${serie.anio ? `<span class="nf-meta-chip nf-chip-year">${serie.anio}</span>` : ''}
              <span class="nf-meta-chip nf-chip-temps">📺 ${serie.temporadas} temporada${serie.temporadas!==1?'s':''}</span>
              <span class="nf-meta-chip nf-chip-genre">${GENRE_EMOJI[serie.genero]||'🎬'} ${_esc(serie.genero)}</span>
            </div>
          </div>
        </div>
        <div class="nf-modal-body">
          <p class="nf-modal-sinopsis">${_esc(serie.sinopsis||'')}</p>
          ${serie.plataformas ? `<div class="nf-modal-section"><div class="nf-modal-section-label">Disponible en</div><div class="nf-modal-platforms">${serie.plataformas.map(p=>`<span class="platform-badge" style="background:${PLATFORM_COLORS[p]||'#444'}">${_esc(p)}</span>`).join('')}</div></div>` : ''}
          <div class="nf-modal-section">
            <div class="nf-modal-section-label">Tu puntuación</div>
            <div class="modal-stars" id="modal-stars" data-current="0">
              ${[1,2,3,4,5].map(i=>`<button class="modal-star-btn" data-val="${i}">★</button>`).join('')}
            </div>
            <p class="nf-modal-rating-hint" id="nf-rating-hint">Selecciona las estrellas para puntuar</p>
          </div>
          <div class="nf-modal-section nf-critica-wrap" id="nf-critica-wrap" style="display:none">
            <div class="nf-modal-section-label">Tu crítica / opinión</div>
            <textarea id="nf-critica-input" class="nf-critica-textarea" placeholder="¿Qué te pareció esta serie?" maxlength="500"></textarea>
            <div class="nf-critica-counter"><span id="nf-critica-count">0</span>/500</div>
          </div>
          <div class="nf-modal-actions">
            <button class="nf-modal-btn-primary" id="nf-modal-guardar">💾 Guardar en Historial</button>
          </div>
          <div class="nf-modal-section nf-resenas-section" id="nf-resenas-section">
            <div class="nf-modal-section-label">💬 Reseñas de usuarios</div>
            <div id="nf-resenas-lista"><span class="nf-resenas-loading">Cargando reseñas...</span></div>
          </div>
        </div>
      </div>`;

    modalEl.style.display = 'flex';
    requestAnimationFrame(() => modalEl.classList.add('open'));

    document.getElementById('nf-modal-close').addEventListener('click', _closeModal);
    modalEl.addEventListener('click', e => { if (e.target === modalEl) _closeModal(); });

    const starsEl     = document.getElementById('modal-stars');
    const criticaWrap = document.getElementById('nf-critica-wrap');
    const hint        = document.getElementById('nf-rating-hint');
    const starBtns    = starsEl.querySelectorAll('.modal-star-btn');

    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => { const v=+btn.dataset.val; starBtns.forEach(b=>b.classList.toggle('hover',+b.dataset.val<=v)); });
      btn.addEventListener('mouseleave', () => { starBtns.forEach(b=>b.classList.remove('hover')); });
      btn.addEventListener('click', () => {
        const v=+btn.dataset.val;
        starsEl.dataset.current=v;
        starBtns.forEach(b=>b.classList.toggle('active',+b.dataset.val<=v));
        if(hint) hint.textContent=`Has puntuado con ${v} ★`;
        if(criticaWrap){ criticaWrap.style.display='block'; criticaWrap.classList.add('nf-critica-enter'); setTimeout(()=>criticaWrap.classList.remove('nf-critica-enter'),400); }
        if(typeof App!=='undefined'&&App.showToast) App.showToast(`⭐ ${serie.nombre} — ${v} estrellas`);
      });
    });

    const criticaInput = document.getElementById('nf-critica-input');
    const criticaCount = document.getElementById('nf-critica-count');
    if(criticaInput) criticaInput.addEventListener('input',()=>{ if(criticaCount) criticaCount.textContent=criticaInput.value.length; });

    document.getElementById('nf-modal-guardar').addEventListener('click', async () => {
      const estrellas = +(starsEl.dataset.current||0);
      const critica   = criticaInput ? criticaInput.value.trim() : '';
      if(estrellas===0){ if(typeof App!=='undefined'&&App.showToast) App.showToast('⭐ Puntúa la serie antes de guardar'); starsEl&&starsEl.classList.add('shake'); setTimeout(()=>starsEl&&starsEl.classList.remove('shake'),500); return; }
      const btn=document.getElementById('nf-modal-guardar'); btn.disabled=true; btn.textContent='Guardando...';
      try {
        await API.postHistorial({ nombre:serie.nombre, genero:serie.genero, temporadas:serie.temporadas, estrellas, critica });
        if(typeof App!=='undefined'&&App.showToast) App.showToast(`✅ ${serie.nombre} guardada`);
        _closeModal();
        if(typeof PanelMySeries!=='undefined'&&PanelMySeries.refresh) PanelMySeries.refresh();
      } catch(e) { btn.disabled=false; btn.textContent='💾 Guardar en Historial'; if(typeof App!=='undefined'&&App.showToast) App.showToast('❌ '+(e.message||'Error')); }
    });

    _cargarResenas(serie.nombre);
  }

  async function _cargarResenas(nombre) {
    try {
      const resenas = await API.getResenas(nombre);
      const lista = document.getElementById('nf-resenas-lista');
      if (!lista) return;
      if (!resenas || resenas.length === 0) {
        lista.innerHTML = '<span class="nf-resenas-empty">Aún no hay reseñas para esta serie. ¡Sé el primero!</span>';
        return;
      }
      lista.innerHTML = resenas.map(r => {
        const autor = r.usuarioId ? `@${r.usuarioId.username}` : '@usuario';
        const estrellas = Array.from({length:5},(_,i) =>
          `<span style="color:${i<r.estrellas?'#e50914':'#555'}">${i<r.estrellas?'★':'☆'}</span>`).join('');
        return `
          <div class="nf-resena-card">
            <div class="nf-resena-header">
              <span class="nf-resena-autor">${autor}</span>
              <span class="nf-resena-stars">${estrellas}</span>
            </div>
            <div class="nf-resena-texto">"${r.critica}"</div>
          </div>`;
      }).join('');
    } catch {
      const lista = document.getElementById('nf-resenas-lista');
      if (lista) lista.innerHTML = '<span class="nf-resenas-empty">No se pudieron cargar las reseñas.</span>';
    }
  }

  function _closeModal() {
    const m = document.getElementById('nf-detail-modal');
    if(!m) return;
    m.classList.remove('open');
    setTimeout(()=>{ m.style.display='none'; }, 300);
  }

  // ── Carousel helpers ───────────────────────────────────────────────────────
  function _buildCarouselSection(id, label, items, catalog) {
    return `
      <section class="nf-carousel-section" id="section-${id}">
        <div class="nf-carousel-header-row">
          <span class="nf-section-label">${label}</span>
          <div class="nf-carousel-arrows">
            <button class="nf-arrow" id="nf-prev-${id}">‹</button>
            <button class="nf-arrow" id="nf-next-${id}">›</button>
          </div>
        </div>
        <div class="nf-carousel-viewport" id="nf-viewport-${id}">
          <div class="nf-carousel-track" id="nf-track-${id}">
            ${items.map((s,i)=>_buildSlide(s,i,catalog)).join('')}
          </div>
        </div>
      </section>`;
  }

  function _bindCarousel(id) {
    const track    = document.getElementById(`nf-track-${id}`);
    const viewport = document.getElementById(`nf-viewport-${id}`);
    if(!track||!viewport) return;
    let pos=0,dragging=false,sx=0,sp=0;

    const sw = ()=>{ const s=track.querySelector('.nf-slide'); return s?s.offsetWidth+16:186; };
    const max= ()=>Math.max(0, track.scrollWidth - viewport.offsetWidth);
    const moveTo=(p,anim=true)=>{ pos=Math.max(0,Math.min(p,max())); track.style.transition=anim?'transform 0.5s cubic-bezier(0.25,1,0.5,1)':'none'; track.style.transform=`translateX(-${pos}px)`; };

    document.getElementById(`nf-prev-${id}`)?.addEventListener('click',()=>moveTo(pos-sw()*3));
    document.getElementById(`nf-next-${id}`)?.addEventListener('click',()=>moveTo(pos+sw()*3));
    viewport.addEventListener('mousedown',e=>{ dragging=true; sx=e.clientX; sp=pos; viewport.style.cursor='grabbing'; });
    window.addEventListener('mousemove', e=>{ if(!dragging) return; moveTo(sp-(e.clientX-sx),false); });
    window.addEventListener('mouseup',   ()=>{ if(!dragging) return; dragging=false; viewport.style.cursor='grab'; });
    viewport.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; sp=pos; },{passive:true});
    viewport.addEventListener('touchmove', e=>{ moveTo(sp-(e.touches[0].clientX-sx),false); },{passive:true});

    // Bind slide events
    track.querySelectorAll('.nf-btn-ver').forEach(btn=>{
      btn.addEventListener('click',e=>{ e.stopPropagation(); _openModal(+btn.dataset.idx, btn.dataset.catalog); });
    });
  }

  // ── Hero banner ─────────────────────────────────────────────────────────────
  let heroIdx = 0;
  let heroTimer = null;
  const HERO_ITEMS = CATALOGO.slice(0, 6);

  function _buildHero() {
    const hero = document.getElementById('nf-hero-banner');
    if(!hero) return;
    const s = HERO_ITEMS[heroIdx];
    const img = _getImg(s);
    hero.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent), url('${img}')`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center right';
    document.getElementById('hero-titulo').textContent  = s.nombre;
    document.getElementById('hero-genero').textContent  = `${GENRE_EMOJI[s.genero]||'🎬'} ${s.genero}  ·  ${s.temporadas} temp.  ·  ${s.anio||''}`;
    document.getElementById('hero-sinopsis').textContent = s.sinopsis||'';
    // dots
    document.querySelectorAll('.hero-dot').forEach((d,i)=>d.classList.toggle('active',i===heroIdx));
  }

  function _startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(()=>{ heroIdx=(heroIdx+1)%HERO_ITEMS.length; _buildHero(); }, 5000);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  function _renderHome() {
    const page = document.getElementById('page-home');
    if(!page) return;

    page.innerHTML = `
      <!-- HERO BANNER -->
      <div class="nf-hero-banner" id="nf-hero-banner">
        <div class="nf-hero-content">
          <div class="nf-hero-eyebrow">🔥 Destacado</div>
          <h1 class="nf-hero-titulo" id="hero-titulo">—</h1>
          <div class="nf-hero-genero" id="hero-genero"></div>
          <p class="nf-hero-sinopsis" id="hero-sinopsis"></p>
          <div class="nf-hero-btns">
            <button class="nf-hero-btn-play" id="hero-btn-play">▶ Ver ahora</button>
            <button class="nf-hero-btn-info" id="hero-btn-info">ℹ Más info</button>
          </div>
        </div>
        <div class="hero-dots">
          ${HERO_ITEMS.map((_,i)=>`<button class="hero-dot ${i===0?'active':''}" data-hidx="${i}"></button>`).join('')}
        </div>
      </div>

      <!-- TENDENCIAS -->
      ${_buildCarouselSection('main','🔥 Tendencias — Top 16', CATALOGO, 'main')}

      <!-- DRAMA -->
      ${_buildCarouselSection('drama','🎭 Dramas Imperdibles', DRAMA_EXTRA, 'drama')}

      <!-- SCI-FI -->
      ${_buildCarouselSection('scifi','🚀 Ciencia Ficción', SCIFI_EXTRA, 'scifi')}

      <!-- COMEDIA -->
      ${_buildCarouselSection('comedia','😂 Las Mejores Comedias', COMEDIA_EXTRA, 'comedia')}`;

    // Hero events
    _buildHero();
    _startHeroTimer();
    document.querySelectorAll('.hero-dot').forEach(d=>{
      d.addEventListener('click',()=>{ heroIdx=+d.dataset.hidx; _buildHero(); _startHeroTimer(); });
    });
    document.getElementById('hero-btn-play')?.addEventListener('click',()=>_openModal(heroIdx,'main'));
    document.getElementById('hero-btn-info')?.addEventListener('click',()=>_openModal(heroIdx,'main'));

    // Bind carousels
    ['main','drama','scifi','comedia'].forEach(_bindCarousel);
  }

  async function init() {
    const loading = document.getElementById('home-loading');
    if(loading) loading.style.display='none';
    _renderHome();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', ()=>PanelHome.init());
