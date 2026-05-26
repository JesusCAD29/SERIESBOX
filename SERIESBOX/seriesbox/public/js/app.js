/**
 * public/js/app.js
 * Director de orquesta global de la SPA (Single Page Application).
 */

const App = (() => {

  // ── Inicialización Global ────────────────────────────────────────────────
  async function init() {
    console.log("🚀 Inicializando SeriesBox App...");

    try {
      // 1. Intentamos leer primero si hay un usuario guardado en el localStorage del navegador
      const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

      if (usuarioLocal) {
        // SI EXISTE EN LOCALSTORAGE: Entramos directo sin pasar por el modal
        _arrancarAplicación(usuarioLocal);
      } else {
        // 2. RESPALDO: Si no hay local, intentamos validar contra el servidor
        const usuarioServidor = await API.getUsuario().catch(() => null);

        if (usuarioServidor && usuarioServidor.id) {
          localStorage.setItem('usuario', JSON.stringify(usuarioServidor));
          _arrancarAplicación(usuarioServidor);
        } else {
          // NO HAY SESIÓN EN NINGÚN LADO: Forzamos el modal de login fijo
          document.getElementById('auth-modal').style.setProperty('display', 'flex', 'important');
          document.getElementById('app').style.display = 'none';
        }
      }
    } catch (err) {
      console.log("No hay sesión previa activa, mostrando Login.");
      document.getElementById('auth-modal').style.setProperty('display', 'flex', 'important');
      document.getElementById('app').style.display = 'none';
    }

    // Configurar el sistema de pestañas (SPA)
    _configurarTabs();
  }

  // ── Flujo de entrada ──────────────────────────────────────────────────────
  
  /**
   * Oculta el login/registro y muestra la interfaz de la aplicación principal.
   */
  function _arrancarAplicación(usuario) {
    const authModal = document.getElementById('auth-modal');
    const appContainer = document.getElementById('app');

    // Desvanecer o quitar el bloqueo de login
    if (authModal) authModal.style.display = 'none';
    
    // Mostrar el contenedor maestro del index.html
    if (appContainer) appContainer.style.display = 'block';

    // Formateamos las propiedades para evitar undefined
    const nombreUsuario = usuario.username || usuario.nombre || 'Usuario';
    const nombreFormateado = nombreUsuario.startsWith('@') ? nombreUsuario : `@${nombreUsuario}`;
    const inicial = nombreUsuario.replace('@', '').charAt(0).toUpperCase();

    // 1. Pintar los datos en la barra superior derecha (Navbar)
    const userDisplay = document.getElementById('username-display');
    const avatar = document.getElementById('avatar-badge');
    
    if (userDisplay) userDisplay.textContent = nombreFormateado;
    if (avatar) avatar.textContent = inicial;

    // 2. 👇 CORRECCIÓN CLAVE: Pintar también los datos en el perfil central (Sección de tus fotos)
    const perfilUsername = document.getElementById('perfil-username');
    const perfilAvatar = document.getElementById('perfil-avatar');

    if (perfilUsername) perfilUsername.textContent = nombreFormateado;
    if (perfilAvatar) perfilAvatar.textContent = inicial;

    // 🎬 Despertar los paneles secundarios en cascada para que carguen sus datos
    if (typeof PanelHome !== 'undefined') PanelHome.init();
    if (typeof PanelMySeries !== 'undefined') PanelMySeries.init();
    if (typeof PanelRuleta !== 'undefined') PanelRuleta.init();

    showToast(`🍿 ¡Bienvenido de vuelta, ${nombreUsuario}!`);
  }

  // ── Sistema de Navegación entre Pestañas (SPA) ───────────────────────────
  function _configurarTabs() {
    const botones = document.querySelectorAll('.tab-nav .tab-btn');
    const paginas = document.querySelectorAll('.page');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Cambiar estado activo en los botones de navegación
        botones.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Alternar visibilidad de las páginas en el CSS/HTML
        paginas.forEach(pag => {
          if (pag.id === `page-${targetTab}`) {
            pag.classList.add('active');
            
            // Si la pestaña tiene una función "refresh", la llamamos para actualizar datos
            if (targetTab === 'myseries' && typeof PanelMySeries !== 'undefined' && PanelMySeries.refresh) {
              PanelMySeries.refresh();
            }
          } else {
            pag.classList.remove('active');
          }
        });
      });
    });
  }

  // ── Componente Toast (Notificaciones flotantes) ──────────────────────────
  function showToast(mensaje) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = mensaje;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Exponer métodos globales necesarios para el login externo (usuario.js)
  return {
    init,
    arrancarAplicación: _arrancarAplicación,
    showToast
  };
})();

// Disparar cuando todo el documento HTML esté cargado en memoria
document.addEventListener('DOMContentLoaded', App.init);