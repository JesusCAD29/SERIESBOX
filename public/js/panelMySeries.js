/**
 * public/js/panelMySeries.js
 */

const PanelMySeries = (() => {

  let _califActual = 0;
  let _autocompleteTimer = null;
  const $ = id => document.getElementById(id);

  // ── Perfil ─────────────────────────────────────────────────────────────────
  function _actualizarPerfil() {
    const u = JSON.parse(localStorage.getItem('usuario'));
    const nombre = (u && u.username) ? u.username : (u && u.nombre) ? u.nombre : 'Invitado';
    const fmt = nombre.startsWith('@') ? nombre : `@${nombre}`;
    const navEl    = $('username-display');
    const perfilEl = $('perfil-username');
    if (navEl)    navEl.textContent    = fmt;
    if (perfilEl) perfilEl.textContent = fmt;
  }

  // ── Lista "Por Ver" (desde MongoDB vía API) ──────────────────────────────────
  async function _actualizarPorVer() {
    const section   = $('porver-section');
    const container = $('porver-container');
    if (!section || !container) return;

    try {
      const lista = await API.getWatchlist();
      if (!lista || lista.length === 0) {
        section.style.display = 'none';
        return;
      }
      section.style.display = 'block';
      container.innerHTML = lista.map((serie, idx) => `
        <div class="porver-card" data-idx="${idx}" data-id="${serie._id}">
          <div class="porver-card-info">
            <div class="porver-card-title">${_esc(serie.nombre)}</div>
            <div class="porver-card-meta">🎬 ${_esc(serie.genero)} &nbsp;·&nbsp; 📺 ${serie.temporadas} T.</div>
          </div>
          <div class="porver-card-actions">
            <button class="porver-btn-remove" data-id="${serie._id}" data-nombre="${_esc(serie.nombre)}" title="Quitar de la lista">✕</button>
          </div>
        </div>
      `).join('');

      // Bind remove buttons
      container.querySelectorAll('.porver-btn-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const nombre = btn.dataset.nombre;
          try {
            await API.deleteWatchlist(id);
            App.showToast(`🗑 "${nombre}" quitada de tu lista`);
            await _actualizarPorVer();
          } catch (e) {
            App.showToast('❌ ' + e.message);
          }
        });
      });
    } catch (error) {
      console.error("Error cargando watchlist:", error);
    }
  }

  // ── Crítica box visible condición ────────────────────────────────────────
  function _evaluarMostrarCritica() {
    const nombre    = $('input-nombre').value.trim();
    const container = $('critica-container');
    if (!container) return;
    if (nombre !== '' && _califActual > 0) {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
      const inp = $('input-critica');
      if (inp) inp.value = '';
    }
  }

  // ── Historial cards (con botones editar/borrar) ──────────────────────────
  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
  }

  function _buildHistorialCard(serie) {
    const estrellas = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < serie.estrellas ? '#ff9f43' : '#555'}">${i < serie.estrellas ? '★' : '☆'}</span>`
    ).join('');

    const criticaHtml = serie.critica && serie.critica.trim() !== ''
      ? `<div class="card-historial-review">"${_esc(serie.critica)}"</div>`
      : `<div class="card-historial-review card-historial-review--empty">Sin crítica aún.</div>`;

    return `
      <div class="card-historial" data-id="${serie._id}">
        <div class="card-historial-header">
          <div class="card-historial-title">${_esc(serie.nombre)}</div>
          <div class="card-historial-stars">${estrellas}</div>
        </div>
        <div class="card-historial-meta">
          <span>🎬 ${_esc(serie.genero)}</span>
          <span>📺 ${serie.temporadas} T.</span>
        </div>
        ${criticaHtml}
        <div class="card-historial-actions">
          <button class="btn-card-edit"   data-id="${serie._id}" title="Editar crítica">✏️ Editar</button>
          <button class="btn-card-delete" data-id="${serie._id}" title="Eliminar">🗑 Borrar</button>
        </div>
        <!-- Editor inline (oculto por defecto) -->
        <div class="card-edit-box" id="edit-box-${serie._id}" style="display:none;">
          <div class="card-edit-stars" id="edit-stars-${serie._id}">
            ${[1,2,3,4,5].map(i =>
              `<button class="edit-star-btn ${i <= serie.estrellas ? 'active' : ''}" data-val="${i}" data-id="${serie._id}">★</button>`
            ).join('')}
          </div>
          <textarea class="card-edit-textarea" id="edit-text-${serie._id}" maxlength="500">${_esc(serie.critica || '')}</textarea>
          <div class="card-edit-btns">
            <button class="btn-card-save"   data-id="${serie._id}">💾 Guardar</button>
            <button class="btn-card-cancel" data-id="${serie._id}">✕ Cancelar</button>
          </div>
        </div>
      </div>`;
  }

  async function _actualizarHistorial() {
    const container = $('historial-container');
    const [historial, stats] = await Promise.all([
      API.getHistorial().catch(() => []),
      API.getStats().catch(() => ({ total: 0, favorito: 'Ninguno', media: 0 })),
    ]);

    if ($('stat-total'))    $('stat-total').textContent    = stats.total;
    if ($('stat-favorito')) $('stat-favorito').textContent = stats.favorito;
    if ($('stat-media'))    $('stat-media').textContent    = stats.media + ' ★';

    if (!historial || historial.length === 0) {
      container.innerHTML = '<p class="historial-empty">Aún no tienes series agregadas.</p>';
      return;
    }

    container.innerHTML = historial.map(_buildHistorialCard).join('');
    _bindHistorialEvents(historial);
  }

  function _bindHistorialEvents(historial) {
    const container = $('historial-container');

    // Editar — abrir inline editor
    container.querySelectorAll('.btn-card-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const box = document.getElementById(`edit-box-${id}`);
        if (box) {
          box.style.display = box.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // Cancelar
    container.querySelectorAll('.btn-card-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const box = document.getElementById(`edit-box-${id}`);
        if (box) box.style.display = 'none';
      });
    });

    // Estrellas de edición
    container.querySelectorAll('.edit-star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = +btn.dataset.val;
        const id  = btn.dataset.id;
        document.querySelectorAll(`.edit-star-btn[data-id="${id}"]`).forEach(b => {
          b.classList.toggle('active', +b.dataset.val <= val);
        });
        // guardar el valor elegido en el botón guardar como referencia
        const saveBtn = document.querySelector(`.btn-card-save[data-id="${id}"]`);
        if (saveBtn) saveBtn.dataset.estrellas = val;
      });
      // Inicializar data-estrellas con el valor actual
      const serie = historial.find(s => String(s._id) === btn.dataset.id);
      const saveBtn = document.querySelector(`.btn-card-save[data-id="${btn.dataset.id}"]`);
      if (saveBtn && !saveBtn.dataset.estrellas && serie)
        saveBtn.dataset.estrellas = serie.estrellas;
    });

    // Guardar edición
    container.querySelectorAll('.btn-card-save').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id       = btn.dataset.id;
        const critica  = document.getElementById(`edit-text-${id}`).value.trim();
        const estrellas = +(btn.dataset.estrellas || 0);
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        try {
          await API.putHistorial(id, { critica, estrellas });
          App.showToast('✅ Crítica actualizada');
          await _actualizarHistorial();
        } catch (e) {
          App.showToast('❌ ' + e.message);
          btn.disabled = false;
          btn.textContent = '💾 Guardar';
        }
      });
    });

    // Borrar
    container.querySelectorAll('.btn-card-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres eliminar esta serie del historial?')) return;
        try {
          await API.deleteHistorial(btn.dataset.id);
          App.showToast('🗑 Serie eliminada');
          await _actualizarHistorial();
        } catch (e) {
          App.showToast('❌ ' + e.message);
        }
      });
    });
  }

  // ── Estrellas ─────────────────────────────────────────────────────────────
  function _pintarEstrellas(n) {
    _califActual = n;
    document.querySelectorAll('.star-btn').forEach(btn => {
      const v = parseInt(btn.dataset.value, 10);
      btn.textContent = v <= n ? '★' : '☆';
      btn.classList.toggle('filled', v <= n);
    });
    _evaluarMostrarCritica();
  }

  // ── Autocomplete ──────────────────────────────────────────────────────────
  function _configurarBuscador() {
    const input    = $('input-nombre');
    const dropdown = $('autocomplete-dropdown');
    if (!input || !dropdown) return;

    const _cerrar = () => { dropdown.classList.remove('visible'); dropdown.innerHTML = ''; };

    input.addEventListener('input', () => {
      clearTimeout(_autocompleteTimer);
      const q = input.value.trim();
      _evaluarMostrarCritica();
      if (q.length < 2) { _cerrar(); return; }
      _autocompleteTimer = setTimeout(async () => {
        const res = await API.buscar(q).catch(() => []);
        if (!res.length) { _cerrar(); return; }
        dropdown.innerHTML = res.map(s =>
          `<div class="autocomplete-item" data-nombre="${_esc(s.nombre)}" data-genero="${_esc(s.genero)}" data-temps="${s.temporadas}">${_esc(s.nombre)}</div>`
        ).join('');
        dropdown.classList.add('visible');
      }, 200);
    });

    dropdown.addEventListener('mousedown', e => {
      const item = e.target.closest('.autocomplete-item');
      if (!item) return;
      if ($('input-nombre')) $('input-nombre').value = item.dataset.nombre;
      if ($('input-genero')) $('input-genero').value = item.dataset.genero;
      if ($('input-temps'))  $('input-temps').value  = item.dataset.temps;
      _cerrar();
      _evaluarMostrarCritica();
    });
    input.addEventListener('blur',    () => setTimeout(_cerrar, 150));
    input.addEventListener('keydown', e => { if (e.key === 'Escape') _cerrar(); });
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  async function _accionGuardar() {
    const nombre     = $('input-nombre').value.trim();
    const genero     = $('input-genero').value;
    const temporadas = parseInt($('input-temps').value, 10);
    const critica    = $('input-critica') ? $('input-critica').value.trim() : '';

    if (!nombre)                         { App.showToast('⚠️ El nombre no puede estar vacío.'); return; }
    if (isNaN(temporadas) || temporadas < 1) { App.showToast('⚠️ Ingresa un número válido de temporadas.'); return; }

    try {
      await API.postHistorial({ nombre, genero, temporadas, estrellas: _califActual, critica });
      $('input-nombre').value = '';
      $('input-temps').value  = '';
      _pintarEstrellas(0);
      await _actualizarHistorial();
      App.showToast(`✅ "${nombre}" agregada al historial.`);
    } catch (err) {
      App.showToast(`❌ ${err.message}`);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    _actualizarPerfil();
    await _actualizarPorVer();
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => _pintarEstrellas(parseInt(btn.dataset.value, 10)));
    });
    if ($('btn-guardar')) $('btn-guardar').addEventListener('click', _accionGuardar);
    _configurarBuscador();
    await _actualizarHistorial().catch(console.error);
  }

  async function refresh() {
    _actualizarPerfil();
    await _actualizarPorVer();
    await _actualizarHistorial().catch(console.error);
  }

  return { init, refresh };
})();
