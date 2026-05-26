/**
 * public/js/panelMySeries.js
 * Migración completa de PanelMySeries.java.
 *
 * Características:
 * – Autocomplete inteligente (configararBuscadorInteligente)
 * – Sistema de estrellas interactivo (pintarEstrellas)
 * – Tarjetas de historial con visualización de críticas del usuario
 * – Estadísticas en tiempo real (actualizarDatosDinamicos)
 * – Control dinámico de la caja de crítica abajo de las estrellas
 */

const PanelMySeries = (() => {

  // ── Estado local ─────────────────────────────────────────────────────────
  let _califActual = 0;
  let _autocompleteTimer = null;

  // ── Refs DOM ─────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ── Lógica de Interfaz Dinámica ──────────────────────────────────────────

  /**
   * Corrige y sincroniza el nombre real del usuario tanto en la Navbar como en el Perfil.
   */
  function _actualizarPerfil() {
    // Intentamos recuperar el usuario logueado desde el localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
    
    // Si no hay usuario o no tiene nombre, se usa el valor por defecto
    const nombreUsuario = (usuarioGuardado && usuarioGuardado.nombre) ? usuarioGuardado.nombre : 'Invitado';
    
    // Formateamos para que siempre lleve el '@' al inicio
    const nombreFormateado = nombreUsuario.startsWith('@') ? nombreUsuario : `@${nombreUsuario}`;

    // 1. Cambia el nombre en la barra de navegación superior (ID: username-display)
    const navbarUsername = $('username-display');
    if (navbarUsername) {
      navbarUsername.textContent = nombreFormateado;
    }

    // 2. Cambia el nombre en la sección central de la pestaña "Mis Series" (ID: perfil-username)
    const perfilUsername = $('perfil-username');
    if (perfilUsername) {
      perfilUsername.textContent = nombreFormateado;
    }
  }

  /**
   * Muestra u oculta la caja de crítica abajo de las estrellas según las condiciones.
   * Solo aparece si hay un nombre escrito/seleccionado Y la puntuación es mayor a 0.
   */
  function _evaluarMostrarCritica() {
    const nombre = $('input-nombre').value.trim();
    const container = $('critica-container');
    
    if (!container) return;

    if (nombre !== '' && _califActual > 0) {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
      const inputCritica = $('input-critica');
      if (inputCritica) inputCritica.value = ''; // Limpia el texto si se oculta
    }
  }

  // ── Render: Historial ────────────────────────────────────────────────────

  /**
   * Construye la tarjeta HTML para una serie del historial incluyendo su opinión.
   */
  function _buildHistorialCard(serie) {
    const estrellas = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < serie.estrellas ? '#ff9f43' : '#555'}">${i < serie.estrellas ? '★' : '☆'}</span>`
    ).join('');

    return `
      <div class="card-historial" style="background: #151515; border: 1px solid #222; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div class="card-historial-title" style="font-size: 1.1rem; font-weight: bold; color: #fff;">${_esc(serie.nombre)}</div>
          <div class="card-historial-stars" style="font-size: 1rem;">${estrellas}</div>
        </div>
        <div class="card-historial-meta" style="font-size: 0.85rem; color: #aaa; display: flex; gap: 1rem; margin-bottom: 0.5rem;">
          <span>🎬 ${_esc(serie.genero)}</span>
          <span>📺 ${serie.temporadas} T.</span>
        </div>
        
        ${serie.critica && serie.critica.trim() !== '' ? `
          <div class="card-historial-review" style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed #333; font-size: 0.9rem; color: #bbb; font-style: italic; line-height: 1.4; background: #1a1a1a; padding: 0.6rem; border-radius: 4px;">
            "🏽 ${_esc(serie.critica)}"
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Actualiza el bloque de historial con los datos del servidor.
   */
  async function _actualizarHistorial() {
    const container = $('historial-container');
    const [historial, stats] = await Promise.all([
      API.getHistorial().catch(() => []),
      API.getStats().catch(() => ({ total: 0, favorito: 'Ninguno', media: 0 })),
    ]);

    // Estadísticas (Mantiene intactos sus ID y lógica original de las tarjetas)
    if ($('stat-total'))    $('stat-total').textContent    = stats.total;
    if ($('stat-favorito')) $('stat-favorito').textContent = stats.favorito;
    if ($('stat-media'))    $('stat-media').textContent    = stats.media + ' ★';

    // Historial de tarjetas
    if (!historial || historial.length === 0) {
      container.innerHTML = '<p class="historial-empty">Aún no tienes series agregadas.</p>';
    } else {
      container.innerHTML = historial.map(_buildHistorialCard).join('');
    }
  }

  // ── Estrellas ─────────────────────────────────────────────────────────────

  /**
   * Pinta las estrellas hasta el índice dado.
   */
  function _pintarEstrellas(n) {
    _califActual = n;
    document.querySelectorAll('.star-btn').forEach(btn => {
      const v = parseInt(btn.dataset.value, 10);
      btn.textContent = v <= n ? '★' : '☆';
      btn.classList.toggle('filled', v <= n);
    });
    
    // Evaluamos si debemos mostrar u ocultar la crítica al cambiar las estrellas
    _evaluarMostrarCritica();
  }

  // ── Autocomplete ──────────────────────────────────────────────────────────

  /**
   * Configura el buscador inteligente con debounce.
   */
  function _configurarBuscador() {
    const input    = $('input-nombre');
    const dropdown = $('autocomplete-dropdown');

    if (!input || !dropdown) return;

    const _cerrar = () => {
      dropdown.classList.remove('visible');
      dropdown.innerHTML = '';
    };

    input.addEventListener('input', () => {
      clearTimeout(_autocompleteTimer);
      const q = input.value.trim();

      // Al escribir de forma manual, evaluamos si la caja debe mostrarse u ocultarse
      _evaluarMostrarCritica();

      if (q.length < 2) { _cerrar(); return; }

      _autocompleteTimer = setTimeout(async () => {
        const resultados = await API.buscar(q).catch(() => []);
        if (!resultados.length) { _cerrar(); return; }

        dropdown.innerHTML = resultados.map(s => `
          <div class="autocomplete-item"
               data-nombre="${_esc(s.nombre)}"
               data-genero="${_esc(s.genero)}"
               data-temps="${s.temporadas}">
            ${_esc(s.nombre)}
          </div>
        `).join('');

        dropdown.classList.add('visible');
      }, 200);
    });

    // Selección de sugerencia
    dropdown.addEventListener('mousedown', e => {
      const item = e.target.closest('.autocomplete-item');
      if (!item) return;

      if ($('input-nombre')) $('input-nombre').value = item.dataset.nombre;
      if ($('input-genero')) $('input-genero').value = item.dataset.genero;
      if ($('input-temps'))  $('input-temps').value  = item.dataset.temps;
      _cerrar();
      
      // Evaluamos la crítica ya que ahora el input tiene texto de la serie seleccionada
      _evaluarMostrarCritica();
    });

    // Cerrar al perder foco
    input.addEventListener('blur', () => setTimeout(_cerrar, 150));

    // Escapar cierra
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') _cerrar();
    });
  }

  // ── Guardar serie ─────────────────────────────────────────────────────────

  async function _accionGuardar() {
    const nombre     = $('input-nombre').value.trim();
    const genero     = $('input-genero').value;
    const temporadas = parseInt($('input-temps').value, 10);
    const critica    = $('input-critica') ? $('input-critica').value.trim() : '';

    if (!nombre) {
      App.showToast('⚠️ El nombre no puede estar vacío.');
      return;
    }
    if (isNaN(temporadas) || temporadas < 1) {
      App.showToast('⚠️ Ingresa un número válido de temporadas.');
      return;
    }

    try {
      // Se envía la reseña ('critica') al backend junto con los demás datos
      await API.postHistorial({ nombre, genero, temporadas, estrellas: _califActual, critica });

      // Reset del formulario
      $('input-nombre').value = '';
      $('input-temps').value  = '';
      
      // Reseteamos las estrellas a 0 (esto ocultará automáticamente la caja de crítica)
      _pintarEstrellas(0);

      await _actualizarHistorial();
      App.showToast(`✅ "${nombre}" agregada al historial.`);

    } catch (err) {
      App.showToast(`❌ ${err.message}`);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    // Sincroniza el nombre de usuario de la cabecera y el panel central
    _actualizarPerfil();

    // Estrellas
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => _pintarEstrellas(parseInt(btn.dataset.value, 10)));
    });

    // Guardar
    if ($('btn-guardar')) {
      $('btn-guardar').addEventListener('click', _accionGuardar);
    }

    // Autocomplete
    _configurarBuscador();

    // Carga inicial de historial y stats
    await _actualizarHistorial().catch(console.error);
  }

  /** Llamado desde app.js cuando se cambia de pestaña */
  async function refresh() {
    _actualizarPerfil();
    await _actualizarHistorial().catch(console.error);
  }

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
  }

  return { init, refresh };
})();