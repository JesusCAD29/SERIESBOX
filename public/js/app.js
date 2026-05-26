/**
 * public/js/app.js
 */

const App = (() => {

  // ── Cronómetro de sesión ─────────────────────────────────────────────────
  let _sessionStart = null;
  let _sessionInterval = null;

  function _iniciarCronometro() {
    _sessionStart = Date.now();
    const timerEl = document.getElementById('session-timer');
    if (timerEl) timerEl.style.display = 'block';

    _sessionInterval = setInterval(() => {
      if (!timerEl) return;
      const elapsed  = Math.floor((Date.now() - _sessionStart) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      timerEl.textContent = `⏱ ${mm}:${ss}`;
    }, 1000);
  }

  function _detenerCronometro() {
    if (_sessionInterval) {
      clearInterval(_sessionInterval);
      _sessionInterval = null;
    }
  }

  function _tiempoSesion() {
    if (!_sessionStart) return { minutos: 0, segundos: 0 };
    const elapsed = Math.floor((Date.now() - _sessionStart) / 1000);
    return {
      minutos: Math.floor(elapsed / 60),
      segundos: elapsed % 60
    };
  }

  // ── Sala de espera (fila virtual) ────────────────────────────────────────
  function _mostrarFilaVirtual(onComplete) {
    // Crear overlay de sala de espera
    const overlay = document.createElement('div');
    overlay.id = 'waiting-room-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0a0a0f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: 'Netflix Sans', 'Helvetica Neue', Arial, sans-serif;
      color: #fff;
    `;

    overlay.innerHTML = `
      <div style="text-align:center; max-width: 480px; padding: 2rem; width: 100%;">
        <!-- Logo SeriesBox -->
        <div style="font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; color: #e50914; margin-bottom: 0.4rem;">
          🎬 SeriesBox
        </div>
        <div style="font-size: 0.85rem; color: #888; margin-bottom: 2.5rem; letter-spacing: 0.08em; text-transform: uppercase;">
          Sala de Espera Virtual
        </div>

        <!-- Icono animado -->
        <div id="wr-icon" style="font-size: 3.5rem; margin-bottom: 1.5rem; animation: wrPulse 1.4s ease-in-out infinite;">
          🍿
        </div>

        <!-- Contador gente delante -->
        <div style="
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        ">
          <div style="font-size: 0.78rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.6rem;">
            Personas delante de ti
          </div>
          <div id="wr-count" style="
            font-size: 4rem;
            font-weight: 900;
            color: #e50914;
            line-height: 1;
            transition: all 0.3s ease;
            text-shadow: 0 0 30px rgba(229,9,20,0.5);
          ">150</div>
          <div id="wr-status" style="font-size: 0.82rem; color: #bbb; margin-top: 0.5rem;">
            Preparando tu sesión...
          </div>
        </div>

        <!-- Barra de progreso -->
        <div style="
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.8rem;
          width: 100%;
        ">
          <div id="wr-bar" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #e50914, #ff6b6b);
            border-radius: 999px;
            transition: width 0.4s ease;
            box-shadow: 0 0 12px rgba(229,9,20,0.6);
          "></div>
        </div>
        <div style="font-size: 0.75rem; color: #666; text-align: right;">
          <span id="wr-percent">0%</span> completado
        </div>

        <div style="margin-top: 2rem; font-size: 0.75rem; color: #555; line-height: 1.7;">
          Alta demanda en este momento.<br>
          Tu lugar está reservado, no cierres esta ventana.
        </div>
      </div>

      <style>
        @keyframes wrPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes wrFadeOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.04); }
        }
      </style>
    `;

    document.body.appendChild(overlay);

    // ── Animación del contador ──────────────────────────────────────────────
    const totalTime = 7000 + Math.random() * 3000; // 7–10 segundos
    const countEl   = document.getElementById('wr-count');
    const barEl     = document.getElementById('wr-bar');
    const pctEl     = document.getElementById('wr-percent');
    const statusEl  = document.getElementById('wr-status');
    const iconEl    = document.getElementById('wr-icon');

    const startCount = 150;
    const startTime  = Date.now();

    // Etapas con mensajes de estado
    const stages = [
      { threshold: 100, msg: 'Verificando disponibilidad...', icon: '⏳' },
      { threshold: 50,  msg: 'Casi en la fila...', icon: '🎟️' },
      { threshold: 10,  msg: '¡Casi es tu turno!', icon: '🚀' },
      { threshold: 0,   msg: '¡Acceso concedido!', icon: '✅' },
    ];
    let stageIdx = 0;

    const tick = setInterval(() => {
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(elapsed / totalTime, 1);
      const eased    = 1 - Math.pow(1 - progress, 2); // ease-out quad

      const currentCount = Math.max(0, Math.round(startCount * (1 - eased)));
      const pct          = Math.round(progress * 100);

      countEl.textContent = currentCount;
      barEl.style.width   = pct + '%';
      pctEl.textContent   = pct + '%';

      // Cambiar estado e ícono por etapa
      for (let i = stageIdx; i < stages.length; i++) {
        if (currentCount <= stages[i].threshold) {
          statusEl.textContent = stages[i].msg;
          iconEl.textContent   = stages[i].icon;
          stageIdx = i + 1;
          break;
        }
      }

      if (progress >= 1) {
        clearInterval(tick);
        countEl.textContent   = '0';
        barEl.style.width     = '100%';
        pctEl.textContent     = '100%';

        // Pequeña pausa y fade out
        setTimeout(() => {
          overlay.style.animation = 'wrFadeOut 0.5s ease forwards';
          setTimeout(() => {
            overlay.remove();
            onComplete();
          }, 500);
        }, 600);
      }
    }, 80);
  }

  // ── Alerta estética de cierre de sesión ──────────────────────────────────
  function _mostrarAlertaSesion(minutos, segundos, onAceptar) {
    const overlay = document.createElement('div');
    overlay.id = 'session-alert-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      backdrop-filter: blur(6px);
      animation: saFadeIn 0.3s ease;
    `;

    const minTxt = minutos > 0
      ? `<span style="color:#e50914;">${minutos}</span> min y <span style="color:#e50914;">${segundos}</span> seg`
      : `<span style="color:#e50914;">${segundos}</span> segundos`;

    overlay.innerHTML = `
      <div style="
        background: #141414;
        border: 1px solid rgba(229,9,20,0.3);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        max-width: 360px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(229,9,20,0.15);
        font-family: 'Helvetica Neue', Arial, sans-serif;
        color: #fff;
        animation: saSlideUp 0.35s ease;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>

        <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.6rem; color: #fff;">
          ¡Hasta pronto!
        </div>

        <div style="font-size: 0.9rem; color: #ccc; line-height: 1.7; margin-bottom: 1.8rem;">
          Pasaste ${minTxt}
          <br>navegando en <span style="color:#e50914; font-weight:700;">SeriesBox</span> 🎬
        </div>

        <button id="session-alert-btn" style="
          background: linear-gradient(135deg, #e50914, #b20610);
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 0.75rem 2.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(229,9,20,0.4);
        ">
          Aceptar
        </button>
      </div>

      <style>
        @keyframes saFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes saSlideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        #session-alert-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(229,9,20,0.6); }
      </style>
    `;

    document.body.appendChild(overlay);

    document.getElementById('session-alert-btn').addEventListener('click', () => {
      overlay.remove();
      onAceptar();
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  async function init() {
    // Siempre limpiar sesión al cargar la página:
    // el flujo obligatorio es Login → Fila Virtual → App
    localStorage.removeItem('usuario');
    API.limpiarToken();
    _mostrarLogin();
    _configurarTabs();
  }

  function _mostrarLogin() {
    document.getElementById('auth-modal').style.setProperty('display', 'flex', 'important');
    document.getElementById('app').style.display = 'none';
  }

  function _arrancarAplicación(usuario) {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    // Iniciar cronómetro de sesión
    _iniciarCronometro();

    const nombreUsuario    = usuario.username || usuario.nombre || 'Usuario';
    const nombreFormateado = nombreUsuario.startsWith('@') ? nombreUsuario : `@${nombreUsuario}`;
    const inicial = nombreUsuario.replace('@', '').charAt(0).toUpperCase();

    const userDisplay = document.getElementById('username-display');
    const avatar      = document.getElementById('avatar-badge');
    if (userDisplay) userDisplay.textContent = nombreFormateado;
    if (avatar)      avatar.textContent = inicial;

    const perfilUsername = document.getElementById('perfil-username');
    const perfilAvatar   = document.getElementById('perfil-avatar');
    if (perfilUsername) perfilUsername.textContent = nombreFormateado;
    if (perfilAvatar)   perfilAvatar.textContent = inicial;

    _crearBotonCerrarSesion();

    if (typeof PanelHome     !== 'undefined') PanelHome.init();
    if (typeof PanelMySeries !== 'undefined') PanelMySeries.init();
    if (typeof PanelRuleta   !== 'undefined') PanelRuleta.init();

    showToast(`🍿 ¡Bienvenido de vuelta, ${nombreUsuario}!`);
  }

  // ── Botón flotante arrastrable de cerrar sesión ──────────────────────────
  function _crearBotonCerrarSesion() {
    const existing = document.getElementById('btn-logout-float');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id        = 'btn-logout-float';
    btn.innerHTML = '⏏ Salir';
    btn.title     = 'Cerrar sesión';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom:   '24px',
      right:    '24px',
      zIndex:   '9999',
      cursor:   'grab',
      padding:  '10px 18px',
      borderRadius: '50px',
      border:   'none',
      background: 'rgba(229,9,20,0.92)',
      color:    '#fff',
      fontWeight: '700',
      fontSize: '0.85rem',
      letterSpacing: '0.05em',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      userSelect: 'none',
      transition: 'transform 0.15s, box-shadow 0.15s',
    });

    document.body.appendChild(btn);

    // ── Drag ──
    let dragging = false, ox = 0, oy = 0;

    btn.addEventListener('mousedown', e => {
      dragging = true;
      btn.style.cursor = 'grabbing';
      ox = e.clientX - btn.getBoundingClientRect().left;
      oy = e.clientY - btn.getBoundingClientRect().top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const x = e.clientX - ox;
      const y = e.clientY - oy;
      btn.style.left   = x + 'px';
      btn.style.top    = y + 'px';
      btn.style.right  = 'auto';
      btn.style.bottom = 'auto';
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      btn.style.cursor = 'grab';
    });

    // Touch drag
    btn.addEventListener('touchstart', e => {
      ox = e.touches[0].clientX - btn.getBoundingClientRect().left;
      oy = e.touches[0].clientY - btn.getBoundingClientRect().top;
    }, { passive: true });
    btn.addEventListener('touchmove', e => {
      const x = e.touches[0].clientX - ox;
      const y = e.touches[0].clientY - oy;
      btn.style.left   = x + 'px';
      btn.style.top    = y + 'px';
      btn.style.right  = 'auto';
      btn.style.bottom = 'auto';
    }, { passive: true });

    // ── Cerrar sesión al click (solo si no se arrastró) ──
    let moved = false;
    btn.addEventListener('mousedown', () => { moved = false; });
    btn.addEventListener('mousemove', () => { moved = true; });
    btn.addEventListener('click', () => {
      if (moved) return;
      cerrarSesion();
    });
  }

  function cerrarSesion() {
    // Detener cronómetro y obtener tiempo
    _detenerCronometro();
    const { minutos, segundos } = _tiempoSesion();
    _sessionStart = null;

    // Mostrar alerta estética; logout real al aceptar
    _mostrarAlertaSesion(minutos, segundos, () => {
      localStorage.removeItem('usuario');
      API.limpiarToken();
      const btnFloat = document.getElementById('btn-logout-float');
      if (btnFloat) btnFloat.remove();
      const timerEl = document.getElementById('session-timer');
      if (timerEl) { timerEl.style.display = 'none'; timerEl.textContent = '⏱ 00:00'; }
      _mostrarLogin();
    });
  }

  function _configurarTabs() {
    const botones = document.querySelectorAll('.tab-nav .tab-btn');
    const paginas = document.querySelectorAll('.page');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        botones.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        paginas.forEach(pag => {
          if (pag.id === `page-${targetTab}`) {
            pag.classList.add('active');
            if (targetTab === 'myseries' && typeof PanelMySeries !== 'undefined' && PanelMySeries.refresh)
              PanelMySeries.refresh();
          } else {
            pag.classList.remove('active');
          }
        });
      });
    });
  }

  function showToast(mensaje) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  return { init, arrancarAplicación: _arrancarAplicación, showToast, cerrarSesion, _mostrarFilaVirtual };
})();

document.addEventListener('DOMContentLoaded', App.init);
