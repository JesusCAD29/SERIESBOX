/**
 * public/js/panelRuleta.js
 * Migración de PanelRuleta.java → tragamonedas con animación suave.
 *
 * La animación de Java usaba un javax.swing.Timer a 16ms (~60fps) con
 * una función de easing "Ease Out Quart": 1 - (1-t)^4.
 *
 * Aquí migramos ese mecanismo exactamente usando requestAnimationFrame,
 * que es el equivalente nativo del navegador al Timer de Swing.
 */

const PanelRuleta = (() => {

  // ── Constantes (mirror de PanelRuleta.java) ──────────────────────────────
  const NOMBRES_TOTALES  = 60;   // Longitud del carrete
  const ALTO_FILA        = 54;   // px, equiv. ALTO_FILA = 50 en Java
  const INDICE_GANADOR   = 55;   // Posición estratégica del ganador
  const DURACION_MS      = 3500; // Duración de la animación (3.5 s)

  // ── Estado ────────────────────────────────────────────────────────────────
  let _catalogo  = [];
  let _items     = [];  // Array de elementos DOM del carrete
  let _animando  = false;
  let _rafId     = null;

  // ── DOM ───────────────────────────────────────────────────────────────────
  const _reel    = () => document.getElementById('slot-reel');
  const _btnGirar= () => document.getElementById('btn-girar');
  const _overlay = () => document.getElementById('result-overlay');

  // ── Construcción del carrete ──────────────────────────────────────────────

  /**
   * Construye el carrete con NOMBRES_TOTALES ítems.
   * Equivalente al bucle de construcción de panelSlotMachine en Java.
   */
  function _construirCarrete() {
    const reel = _reel();
    reel.innerHTML = '';
    _items = [];

    const shuffled = _shuffle([..._catalogo]);

    for (let i = 0; i < NOMBRES_TOTALES; i++) {
      const div = document.createElement('div');
      div.className  = 'slot-item';
      div.textContent = shuffled[i % shuffled.length].nombre;
      reel.appendChild(div);
      _items.push(div);
    }

    // Altura total del carrete
    reel.style.height = `${NOMBRES_TOTALES * ALTO_FILA}px`;

    // Comenzar en la parte superior
    reel.style.transform = 'translateY(0)';
  }

  // ── Animación ─────────────────────────────────────────────────────────────

  /**
   * Función de easing Ease-Out Quart: 1 - (1-t)^4
   * Es la misma función usada en PanelRuleta.java:
   *   float suavizado = 1 - (float) Math.pow(1 - progreso, 4);
   */
  function _easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Anima el carrete desde posicionInicial hasta posicionFinal,
   * usando requestAnimationFrame para ~60fps.
   *
   * Equivalente al Timer de Swing en animacionSmoothTragamonedas() de Java.
   *
   * @param {number} desde   píxel de inicio (translateY negativo)
   * @param {number} hasta   píxel de destino
   * @param {Function} onDone callback al terminar
   */
  function _animarRuleta(desde, hasta, onDone) {
    const inicio = performance.now();

    function frame(ahora) {
      let progreso = (ahora - inicio) / DURACION_MS;
      if (progreso >= 1) progreso = 1;

      const suavizado = _easeOutQuart(progreso);
      const posActual = desde + (hasta - desde) * suavizado;

      _reel().style.transform = `translateY(-${posActual}px)`;

      if (progreso < 1) {
        _rafId = requestAnimationFrame(frame);
      } else {
        _rafId = null;
        onDone();
      }
    }

    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = requestAnimationFrame(frame);
  }

  // ── Acción principal ──────────────────────────────────────────────────────

  /**
   * Orquesta el giro completo.
   * Equivalente a animacionSmoothTragamonedas() en PanelRuleta.java.
   */
  async function _accionGirar() {
    if (_animando || !_catalogo.length) return;
    _animando = true;

    const btn = _btnGirar();
    btn.disabled = true;
    btn.textContent = 'GIRANDO...';

    // Ocultar resultado anterior
    _overlay().classList.remove('visible');

    // Elegir ganador aleatorio
    const ganadora = _catalogo[Math.floor(Math.random() * _catalogo.length)];

    // Rellenar carrete con nombres aleatorios y colocar ganador en INDICE_GANADOR
    const shuffled = _shuffle([..._catalogo]);
    _items.forEach((item, i) => {
      item.className  = 'slot-item';
      item.textContent = i === INDICE_GANADOR
        ? ganadora.nombre
        : shuffled[i % shuffled.length].nombre;
    });

    // Resetear posición al tope
    _reel().style.transform = 'translateY(0)';

    // Forzar un repaint antes de animar (equivale a bar.setValue(0) en Java)
    await new Promise(r => requestAnimationFrame(r));

    // Posición final: centrar ganador en la ventana (ventana 160px = ~3 filas de 54px)
    // Centramos el ítem en la línea de selección (row top + mitad fila - mitad ventana)
    const posicionFinal = (INDICE_GANADOR * ALTO_FILA) - (160 / 2 - ALTO_FILA / 2);

    _animarRuleta(0, posicionFinal, () => {
      _mostrarResultado(ganadora);
      _animando = false;
    });
  }

  /**
   * Muestra la tarjeta de resultado.
   * Equivalente a mostrarResultado(Serie ganadora) en PanelRuleta.java.
   */
  function _mostrarResultado(ganadora) {
    // Resaltar el ítem ganador en el carrete
    _items[INDICE_GANADOR].classList.add('winner');

    // Rellenar overlay
    document.getElementById('result-nombre').textContent =
      ganadora.nombre;
    document.getElementById('result-meta').textContent =
      `🎬 ${ganadora.genero}  |  📺 ${ganadora.temporadas} temp.`;

    _overlay().classList.add('visible');

    // Restablecer botón
    const btn = _btnGirar();
    btn.disabled = false;
    btn.textContent = '¡TIRAR DE NUEVO!';
  }

  // ── Utilidades ────────────────────────────────────────────────────────────

  /** Fisher-Yates shuffle */
  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    _catalogo = await API.getCatalogo().catch(() => []);
    _construirCarrete();
    _btnGirar().addEventListener('click', _accionGirar);
  }

  return { init };
})();
