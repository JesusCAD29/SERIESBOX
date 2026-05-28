/**
 * public/js/panelRuleta.js
 */

const PanelRuleta = (() => {

  const NOMBRES_TOTALES = 60;
  const ALTO_FILA       = 54;
  const INDICE_GANADOR  = 55;
  const DURACION_MS     = 3500;

  let _catalogo = [];
  let _catalogoHome = []; // catálogo con tmdbId del panelHome
  let _items    = [];
  let _animando = false;
  let _rafId    = null;

  const _dynamicPosters = {};

  // TMDB posters (espejo del panelHome)
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

  // Catálogo enriquecido con sinopsis y tmdbId
  const CATALOGO_RICH = [
    { nombre:"Breaking Bad",  genero:"Drama",      temporadas:5, anio:2008, tmdbId:1396,   sinopsis:"Un profesor de química con cáncer terminal se convierte en fabricante de metanfetamina junto a su ex-alumno. Una caída en espiral hacia la oscuridad que redefine el drama televisivo." },
    { nombre:"Stranger Things",genero:"Sci-Fi",    temporadas:4, anio:2016, tmdbId:66732,  sinopsis:"Un grupo de amigos en Hawkins, Indiana, se enfrenta a fuerzas sobrenaturales y experimentos secretos del gobierno. Homenaje perfecto a los 80s." },
    { nombre:"The Last of Us", genero:"Drama",     temporadas:2, anio:2023, tmdbId:100088, sinopsis:"En un mundo postapocalíptico, un contrabandista endurecido debe cruzar el país con una adolescente inmune. La historia de amor y supervivencia más conmovedora de la televisión." },
    { nombre:"Dark",           genero:"Misterio",  temporadas:3, anio:2017, tmdbId:70523,  sinopsis:"Cuatro familias interconectadas en Winden descubren una cueva que abre portales a distintas épocas. Un thriller temporal de complejidad sin precedentes." },
    { nombre:"Succession",     genero:"Drama",     temporadas:4, anio:2018, tmdbId:76331,  sinopsis:"La familia Roy, dueña de un conglomerado mediático, se desgarra mientras el patriarca agonizante se niega a ceder el control. Shakespeariano y brutalmente gracioso." },
    { nombre:"Severance",      genero:"Sci-Fi",    temporadas:2, anio:2022, tmdbId:95396,  sinopsis:"Empleados de Lumon Industries se someten a un procedimiento que separa sus recuerdos laborales de los personales. Una pesadilla corporativa convertida en obra maestra del suspense." },
    { nombre:"Arcane",         genero:"Animación", temporadas:2, anio:2021, tmdbId:94605,  sinopsis:"Dos hermanas de origen humilde se ven separadas por la guerra entre Piltover y Zaun. La serie animada más impresionante visualmente jamás producida." },
    { nombre:"Chernobyl",      genero:"Drama",     temporadas:1, anio:2019, tmdbId:87108,  sinopsis:"La historia verídica del peor accidente nuclear de la historia, y de los hombres que sacrificaron todo para salvar a Europa. Televisión documental en su máxima expresión." },
    { nombre:"The Boys",       genero:"Acción",    temporadas:4, anio:2019, tmdbId:76479,  sinopsis:"En un mundo donde los superhéroes abusan de su poder bajo la corporación Vought, un grupo de ciudadanos comunes decide hacerles frente. Sátira violenta del capitalismo moderno." },
    { nombre:"Better Call Saul",genero:"Drama",    temporadas:6, anio:2015, tmdbId:60059,  sinopsis:"La transformación de Jimmy McGill en Saul Goodman. Un prequel que supera al original en profundidad y melancolía." },
    { nombre:"Black Mirror",   genero:"Sci-Fi",    temporadas:6, anio:2011, tmdbId:42009,  sinopsis:"Antología que explora el lado oscuro de la tecnología y la humanidad. Cada entrega es un golpe distinto al espejo de nuestra sociedad." },
    { nombre:"Peaky Blinders",  genero:"Drama",    temporadas:6, anio:2013, tmdbId:60574,  sinopsis:"La saga de los Shelby, una familia criminal de Birmingham que escala desde las calles hasta el Parlamento inglés en el periodo de entreguerras." },
    { nombre:"Fallout",        genero:"Sci-Fi",    temporadas:1, anio:2024, tmdbId:106379, sinopsis:"Una heredera de un refugio y un cazarrecompensas navegan la superficie radiactiva de Los Ángeles 200 años después del apocalipsis nuclear." },
    { nombre:"Shogun",         genero:"Drama",     temporadas:1, anio:2024, tmdbId:81189,  sinopsis:"Un navegante inglés naufragado en el Japón feudal del siglo XVII se convierte en pieza clave en la guerra por el shogunato. Épica política e íntima." },
    { nombre:"The Bear",       genero:"Drama",     temporadas:3, anio:2022, tmdbId:136315, sinopsis:"Un chef de élite hereda la sandwichería caótica de su hermano fallecido en Chicago. La serie más estresante y emotiva sobre trabajo, duelo e identidad." },
    { nombre:"Invincible",     genero:"Acción",    temporadas:3, anio:2021, tmdbId:95557,  sinopsis:"El hijo de Omni-Man descubre una verdad devastadora sobre su padre. Animación adulta que no escatima en consecuencias." },
  ];

  function _getImg(serie) {
    const rich = CATALOGO_RICH.find(r => r.nombre.toLowerCase() === serie.nombre.toLowerCase());
    if (rich && _dynamicPosters[rich.tmdbId]) {
      return `https://image.tmdb.org/t/p/w500${_dynamicPosters[rich.tmdbId]}`;
    }
    if (rich && TMDB_POSTERS[rich.tmdbId])
      return `https://image.tmdb.org${TMDB_POSTERS[rich.tmdbId]}`;
    return `https://placehold.co/300x450/1e1e1e/787878?text=${encodeURIComponent(serie.nombre)}`;
  }

  function _getSinopsis(serie) {
    const rich = CATALOGO_RICH.find(r => r.nombre.toLowerCase() === serie.nombre.toLowerCase());
    return rich ? rich.sinopsis : 'Una serie imperdible que seguro te va a enganchar.';
  }

  const _reel     = () => document.getElementById('slot-reel');
  const _btnGirar = () => document.getElementById('btn-girar');
  const _overlay  = () => document.getElementById('result-overlay');

  function _construirCarrete() {
    const reel = _reel();
    reel.innerHTML = '';
    _items = [];
    const shuffled = _shuffle([..._catalogo]);
    for (let i = 0; i < NOMBRES_TOTALES; i++) {
      const div = document.createElement('div');
      div.className = 'slot-item';
      div.textContent = shuffled[i % shuffled.length].nombre;
      reel.appendChild(div);
      _items.push(div);
    }
    reel.style.height    = `${NOMBRES_TOTALES * ALTO_FILA}px`;
    reel.style.transform = 'translateY(0)';
  }

  function _easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function _animarRuleta(desde, hasta, onDone) {
    const inicio = performance.now();
    function frame(ahora) {
      let p = (ahora - inicio) / DURACION_MS;
      if (p >= 1) p = 1;
      const pos = desde + (hasta - desde) * _easeOutQuart(p);
      _reel().style.transform = `translateY(-${pos}px)`;
      if (p < 1) { _rafId = requestAnimationFrame(frame); }
      else       { _rafId = null; onDone(); }
    }
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(frame);
  }

  async function _accionGirar() {
    if (_animando || !_catalogo.length) return;
    _animando = true;

    const btn = _btnGirar();
    btn.disabled = true;
    btn.textContent = 'GIRANDO...';
    _overlay().classList.remove('visible');

    const ganadora = _catalogo[Math.floor(Math.random() * _catalogo.length)];
    const shuffled = _shuffle([..._catalogo]);
    _items.forEach((item, i) => {
      item.className  = 'slot-item';
      item.textContent = i === INDICE_GANADOR ? ganadora.nombre : shuffled[i % shuffled.length].nombre;
    });
    _reel().style.transform = 'translateY(0)';
    await new Promise(r => requestAnimationFrame(r));

    const altoFila = _items[0] ? _items[0].offsetHeight : ALTO_FILA;
    const viewportHeight = document.querySelector('.slot-viewport').offsetHeight || 160;
    const posicionFinal = (INDICE_GANADOR * altoFila) - (viewportHeight / 2 - altoFila / 2);
    _reel().style.height = `${NOMBRES_TOTALES * altoFila}px`;

    _animarRuleta(0, posicionFinal, () => {
      _mostrarResultado(ganadora);
      _animando = false;
    });
  }

  async function _mostrarResultado(ganadora) {
    _items[INDICE_GANADOR].classList.add('winner');

    const img      = _getImg(ganadora);
    const sinopsis = _getSinopsis(ganadora);

    // ¿Ya está en la lista "por ver"?
    let porVer = [];
    try {
      porVer = await API.getWatchlist();
    } catch(e) {
      console.error(e);
    }
    let enWatchlist = porVer.find(s => s.nombre.toLowerCase() === ganadora.nombre.toLowerCase());
    let yaEnLista = !!enWatchlist;

    // Construir overlay enriquecido
    const overlay = _overlay();
    overlay.innerHTML = `
      <div class="ruleta-result-inner">
        <div class="ruleta-result-poster">
          <img src="${img}" alt="${ganadora.nombre}"
               onerror="this.src='https://placehold.co/200x300/1e1e1e/555?text=${encodeURIComponent(ganadora.nombre)}'" />
        </div>
        <div class="ruleta-result-info">
          <div class="ruleta-result-titulo" id="result-nombre">${ganadora.nombre}</div>
          <div class="ruleta-result-meta"  id="result-meta">🎬 ${ganadora.genero} &nbsp;|&nbsp; 📺 ${ganadora.temporadas} temp.</div>
          <p class="ruleta-result-sinopsis">${sinopsis}</p>

          <!-- Botones de acción -->
          <div class="ruleta-action-btns">
            <button class="ruleta-btn-visto" id="ruleta-btn-visto">✅ Ya lo vi</button>
            <button class="ruleta-btn-watchlist ${yaEnLista ? 'in-list' : ''}" id="ruleta-btn-watchlist">
              ${yaEnLista ? '✔ En tu lista' : '📌 Ver más tarde'}
            </button>
          </div>

          <!-- Formulario inline de reseña (oculto por defecto) -->
          <div class="ruleta-review-form" id="ruleta-review-form" style="display:none;">
            <div class="ruleta-review-stars" id="ruleta-review-stars">
              ${[1,2,3,4,5].map(i => `<button class="ruleta-star-btn" data-val="${i}">☆</button>`).join('')}
            </div>
            <textarea class="ruleta-review-textarea" id="ruleta-review-textarea"
              placeholder="¿Qué te pareció? Escribe tu opinión..." maxlength="500"></textarea>
            <div class="ruleta-review-actions">
              <button class="ruleta-review-save" id="ruleta-review-save">💾 Guardar reseña</button>
              <button class="ruleta-review-cancel" id="ruleta-review-cancel">✕ Cancelar</button>
            </div>
          </div>

          <div class="ruleta-result-resenas" id="ruleta-resenas">
            <div class="ruleta-resenas-titulo">💬 Reseñas de usuarios</div>
            <div id="ruleta-resenas-lista"><span class="ruleta-resenas-loading">Cargando reseñas...</span></div>
          </div>
        </div>
      </div>`;

    overlay.classList.add('visible');

    const btn = _btnGirar();
    btn.disabled = false;
    btn.textContent = '¡TIRAR DE NUEVO!';

    // ── Bind botón "Ya lo vi" ──
    let _reviewEstrellas = 0;
    const btnVisto     = document.getElementById('ruleta-btn-visto');
    const reviewForm   = document.getElementById('ruleta-review-form');
    const reviewStars  = document.getElementById('ruleta-review-stars');
    const reviewSave   = document.getElementById('ruleta-review-save');
    const reviewCancel = document.getElementById('ruleta-review-cancel');

    btnVisto.addEventListener('click', () => {
      reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
      if (reviewForm.style.display === 'block') {
        reviewForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Estrellas del formulario
    reviewStars.querySelectorAll('.ruleta-star-btn').forEach(starBtn => {
      starBtn.addEventListener('click', () => {
        _reviewEstrellas = +starBtn.dataset.val;
        reviewStars.querySelectorAll('.ruleta-star-btn').forEach(b => {
          const v = +b.dataset.val;
          b.textContent = v <= _reviewEstrellas ? '★' : '☆';
          b.classList.toggle('active', v <= _reviewEstrellas);
        });
      });
    });

    // Cancelar
    reviewCancel.addEventListener('click', () => {
      reviewForm.style.display = 'none';
    });

    // Guardar reseña
    reviewSave.addEventListener('click', async () => {
      if (_reviewEstrellas === 0) {
        reviewStars.classList.add('shake');
        setTimeout(() => reviewStars.classList.remove('shake'), 500);
        App.showToast('⚠️ Selecciona al menos una estrella');
        return;
      }
      const critica = document.getElementById('ruleta-review-textarea').value.trim();
      reviewSave.disabled = true;
      reviewSave.textContent = 'Guardando...';
      try {
        await API.postHistorial({
          nombre:     ganadora.nombre,
          genero:     ganadora.genero,
          temporadas: ganadora.temporadas,
          estrellas:  _reviewEstrellas,
          critica
        });
        App.showToast(`✅ "${ganadora.nombre}" guardada en tu historial`);
        reviewForm.style.display = 'none';
        btnVisto.textContent = '✔ Guardada';
        btnVisto.disabled = true;
        btnVisto.classList.add('saved');
        // Si estaba en "Por Ver", quitarla
        if (enWatchlist) {
          try {
            await API.deleteWatchlist(enWatchlist._id);
            enWatchlist = null;
            const btnWl = document.getElementById('ruleta-btn-watchlist');
            if (btnWl) {
              btnWl.textContent = '📌 Ver más tarde';
              btnWl.classList.remove('in-list');
            }
          } catch(e) {
            console.error("Error al quitar de watchlist", e);
          }
        }
        // Auto-refresh panel Mis Series
        if (typeof PanelMySeries !== 'undefined' && PanelMySeries.refresh) {
          PanelMySeries.refresh();
        }
        // Refrescar reseñas en el overlay
        _cargarResenasOverlay(ganadora.nombre);
      } catch (e) {
        App.showToast('❌ ' + e.message);
        reviewSave.disabled = false;
        reviewSave.textContent = '💾 Guardar reseña';
      }
    });

    // ── Bind botón "Ver más tarde" ──
    const btnWatchlist = document.getElementById('ruleta-btn-watchlist');
    btnWatchlist.addEventListener('click', async () => {
      btnWatchlist.disabled = true;
      if (enWatchlist) {
        // Quitar de la lista
        try {
          await API.deleteWatchlist(enWatchlist._id);
          enWatchlist = null;
          btnWatchlist.textContent = '📌 Ver más tarde';
          btnWatchlist.classList.remove('in-list');
          App.showToast(`🗑 "${ganadora.nombre}" quitada de tu lista`);
          if (typeof PanelMySeries !== 'undefined' && PanelMySeries.refresh) {
            PanelMySeries.refresh();
          }
        } catch(e) {
          App.showToast('❌ ' + e.message);
        }
      } else {
        // Agregar a la lista
        try {
          const res = await API.postWatchlist({
            nombre:     ganadora.nombre,
            genero:     ganadora.genero,
            temporadas: ganadora.temporadas
          });
          enWatchlist = res.item;
          btnWatchlist.textContent = '✔ En tu lista';
          btnWatchlist.classList.add('in-list');
          App.showToast(`📌 "${ganadora.nombre}" agregada a tu lista "Por Ver"`);
          if (typeof PanelMySeries !== 'undefined' && PanelMySeries.refresh) {
            PanelMySeries.refresh();
          }
        } catch(e) {
          App.showToast('❌ ' + e.message);
        }
      }
      btnWatchlist.disabled = false;
    });

    // Cargar reseñas públicas
    _cargarResenasOverlay(ganadora.nombre);
  }

  async function _cargarResenasOverlay(nombre) {
    try {
      const resenas = await API.getResenas(nombre);
      const lista = document.getElementById('ruleta-resenas-lista');
      if (!lista) return;
      if (!resenas || resenas.length === 0) {
        lista.innerHTML = '<span class="ruleta-resenas-empty">Aún no hay reseñas para esta serie. ¡Sé el primero!</span>';
        return;
      }
      lista.innerHTML = resenas.map(r => {
        const autor = r.usuarioId ? `@${r.usuarioId.username}` : '@usuario';
        const estrellas = Array.from({length:5},(_,i) =>
          `<span style="color:${i<r.estrellas?'#ff9f43':'#555'}">${i<r.estrellas?'★':'☆'}</span>`).join('');
        return `
          <div class="ruleta-resena-card">
            <div class="ruleta-resena-header">
              <span class="ruleta-resena-autor">${autor}</span>
              <span class="ruleta-resena-stars">${estrellas}</span>
            </div>
            <div class="ruleta-resena-texto">"${r.critica}"</div>
          </div>`;
      }).join('');
    } catch {
      const lista = document.getElementById('ruleta-resenas-lista');
      if (lista) lista.innerHTML = '<span class="ruleta-resenas-empty">No se pudieron cargar las reseñas.</span>';
    }
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function _fetchDynamicPosters() {
    const ids = CATALOGO_RICH.map(r => r.tmdbId).filter(Boolean);
    try {
      const res = await fetch('/api/tmdb-posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) return;
      const data = await res.json();
      for (const [id, info] of Object.entries(data)) {
        if (info.poster_path) _dynamicPosters[id] = info.poster_path;
      }
    } catch {}
  }

  async function init() {
    _catalogo = await API.getCatalogo().catch(() => []);
    _construirCarrete();
    _fetchDynamicPosters();
    _btnGirar().addEventListener('click', _accionGirar);
  }

  return { init };
})();
