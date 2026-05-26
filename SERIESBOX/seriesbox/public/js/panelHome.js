/**
 * public/js/panelHome.js
 * VERSIÓN DE EMERGENCIA AUTO-EJECUTABLE
 */

const PanelHome = (() => {
  let carouselInterval;

  function _buildCard(serie) {
    return `
      <div class="card-launch">
        <div class="card-launch-header">
          <span class="card-launch-title">${_esc(serie.nombre)}</span>
          <span class="badge-nuevo">Nuevo</span>
        </div>
        <div class="card-launch-meta">
          <span>🎬 ${_esc(serie.genero)}</span>
          <span>📺 ${serie.temporadas} temporada${serie.temporadas !== 1 ? 's' : ''}</span>
        </div>
        <button class="btn-play" aria-label="Ver ${_esc(serie.nombre)}">
          ▶ Ver ahora
        </button>
      </div>
    `;
  }

  function _getCoverImage(serie, index) {
    if (serie.imagenUrl) return serie.imagenUrl;
    const placeholders = [
      'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80'
    ];
    return placeholders[index % placeholders.length];
  }

  function _buildCarouselItem(serie, index) {
    const img = _getCoverImage(serie, index);
    return `
      <div class="hero-carousel-item" title="${_esc(serie.nombre)}">
        <img src="${img}" alt="${_esc(serie.nombre)}">
      </div>
    `;
  }

  function _setupCarouselEngine() {
    const track = document.getElementById('hero-carousel-track');
    if (!track) return;
    const container = track.parentElement;

    let position = 0;
    const itemWidth = 155; 
    const totalItems = track.children.length;

    function moveNext() {
      const maxScroll = (totalItems * itemWidth) - container.clientWidth;
      if (maxScroll <= 0) return;
      position += itemWidth;
      if (position > maxScroll) position = 0;
      track.style.transform = `translateX(-${position}px)`;
    }

    clearInterval(carouselInterval);
    carouselInterval = setInterval(moveNext, 3000);
  }

  function _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  async function init() {
    console.log("🚀 ¡El init() se está ejecutando correctamente!");
    const containerCards = document.getElementById('home-cards');
    const loading        = document.getElementById('home-loading');
    const trackCarousel  = document.getElementById('hero-carousel-track');

    // Forzamos datos locales estables para recuperar el control visual
   // Forzamos MÁS datos locales para que el carrusel tenga espacio para girar una locura
    const lanzamientos = [
      { nombre: "Breaking Bad", genero: "Drama", temporadas: 5 },
      { nombre: "Stranger Things", genero: "Sci-Fi", temporadas: 4 },
      { nombre: "The Office", genero: "Comedia", temporadas: 9 },
      { nombre: "Better Call Saul", genero: "Drama", temporadas: 6 },
      { nombre: "The Boys", genero: "Acción", temporadas: 4 },
      { nombre: "Dark", genero: "Misterio", temporadas: 3 },
      { nombre: "Friends", genero: "Comedia", temporadas: 10 },
      { nombre: "Black Mirror", genero: "Sci-Fi", temporadas: 6 }
    ];

    if (loading) loading.style.display = 'none';

    if (trackCarousel) {
      trackCarousel.innerHTML = [...lanzamientos, ...lanzamientos].map(_buildCarouselItem).join('');
      _setupCarouselEngine();
    }

    if (containerCards) {
      containerCards.innerHTML = lanzamientos.map(_buildCard).join('');
    }
  }

  return { init };
})();

// 🚨 EXTENSIÓN DE FUERZA: Se ejecuta solo en cuanto carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log("⚡ Forzando arranque automático de PanelHome...");
  PanelHome.init();
});