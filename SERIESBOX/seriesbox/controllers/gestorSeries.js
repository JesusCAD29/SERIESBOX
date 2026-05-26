/**
 * controllers/gestorSeries.js
 */

const Serie = require('../models/serie');

class GestorSeries {
  constructor() {
    this.listaHistorial = [];
    this.listaLanzamientos = [];
    this.baseDeDatosGlobal = [];

    this._nombreUsuario = 'Invitado';
    this._cargarContenidoInicial();
  }

  get nombreUsuario() { return this._nombreUsuario; }
  set nombreUsuario(val) { this._nombreUsuario = val; }

  obtenerGeneroFavorito() {
    if (this.listaHistorial.length === 0) return 'Ninguno';

    const conteo = {};
    for (const s of this.listaHistorial) {
      conteo[s.genero] = (conteo[s.genero] || 0) + 1;
    }

    return Object.entries(conteo).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ['', 0]
    )[0];
  }

  obtenerTotalSeriesVistas() {
    return this.listaHistorial.length;
  }

  obtenerMediaCalificaciones() {
    if (this.listaHistorial.length === 0) return 0.0;
    const suma = this.listaHistorial.reduce((acc, s) => acc + s.estrellas, 0);
    return Math.round((suma / this.listaHistorial.length) * 10) / 10;
  }

  obtenerEstadisticas() {
    return {
      total: this.obtenerTotalSeriesVistas(),
      favorito: this.obtenerGeneroFavorito(),
      media: this.obtenerMediaCalificaciones(),
    };
  }

  agregarSerieHistorial(serie) {
    // CORRECCIÓN: Pasamos un objeto a Mongoose
    this.listaHistorial.push(
      new Serie({
        nombre: serie.nombre,
        genero: serie.genero,
        temporadas: Number(serie.temporadas),
        estrellas: Number(serie.estrellas)
      })
    );
  }

  obtenerHistorial() { return [...this.listaHistorial].reverse(); }
  obtenerLanzamientos() { return this.listaLanzamientos; }
  obtenerCatalogoCompleto() { return this.baseDeDatosGlobal; }

  buscarSugerencias(prefijo) {
    if (!prefijo || prefijo.trim() === '') return [];
    const q = prefijo.toLowerCase().trim();
    return this.baseDeDatosGlobal.filter(s =>
      s.nombre.toLowerCase().includes(q)
    );
  }

  _cargarContenidoInicial() {
    // CORRECCIÓN: Pasamos objetos a Mongoose
    [
      new Serie({ nombre: 'Shogun', genero: 'Drama', temporadas: 1, estrellas: 0 }),
      new Serie({ nombre: 'Fallout', genero: 'Sci-Fi', temporadas: 1, estrellas: 0 }),
      new Serie({ nombre: 'The Bear S3', genero: 'Drama', temporadas: 3, estrellas: 0 }),
      new Serie({ nombre: 'House of the Dragon S2', genero: 'Acción', temporadas: 2, estrellas: 0 }),
      new Serie({ nombre: 'The Boys S4', genero: 'Acción', temporadas: 4, estrellas: 0 }),
    ].forEach(s => this.listaLanzamientos.push(s));

    const datos = [
      ['Breaking Bad', 'Drama', 5],
      ['The Wire', 'Drama', 5],
      ['The Sopranos', 'Drama', 6],
      ['Game of Thrones', 'Acción', 8],
      ['Succession', 'Drama', 4],
      ['The Last of Us', 'Terror', 1],
      ['Stranger Things', 'Sci-Fi', 4],
      ['Dark', 'Sci-Fi', 3],
      ['Black Mirror', 'Sci-Fi', 6],
      ['Severance', 'Sci-Fi', 1],
      ['The Office', 'Comedia', 9],
      ['Seinfeld', 'Comedia', 9],
      ['Friends', 'Comedia', 10],
      ['Brooklyn Nine-Nine', 'Comedia', 8],
      ['Parks and Recreation', 'Comedia', 7],
      ['Better Call Saul', 'Drama', 6],
      ['Mad Men', 'Drama', 7],
      ['Peaky Blinders', 'Drama', 6],
      ['The Crown', 'Drama', 6],
      ['Chernobyl', 'Drama', 1],
      ['Band of Brothers', 'Acción', 1],
      ['The Mandalorian', 'Sci-Fi', 3],
      ['Andor', 'Sci-Fi', 1],
      ['Loki', 'Sci-Fi', 2],
      ['WandaVision', 'Sci-Fi', 1],
      ['Invincible', 'Acción', 2],
      ['Arcane', 'Sci-Fi', 1],
      ['Cyberpunk: Edgerunners', 'Sci-Fi', 1],
      ['Attack on Titan', 'Acción', 4],
      ['Death Note', 'Drama', 1],
      ['The Haunting of Hill House', 'Terror', 1],
      ['Midnight Mass', 'Terror', 1],
      ['American Horror Story', 'Terror', 12],
      ['The Walking Dead', 'Terror', 11],
      ['Bates Motel', 'Terror', 5],
      ['Fargo', 'Drama', 5],
      ['True Detective', 'Drama', 4],
      ['Mindhunter', 'Drama', 2],
      ['Ozark', 'Drama', 4],
      ['Narcos', 'Drama', 3],
      ['Ted Lasso', 'Comedia', 3],
      ['Arrested Development', 'Comedia', 5],
      ["Curb Your Enthusiasm", 'Comedia', 12],
      ["It's Always Sunny", 'Comedia', 16],
      ['Fleabag', 'Comedia', 2],
      ['Doctor Who', 'Sci-Fi', 13],
      ['The X-Files', 'Sci-Fi', 11],
      ['Fringe', 'Sci-Fi', 5],
      ['The Expanse', 'Sci-Fi', 6],
      ['Westworld', 'Sci-Fi', 4],
      ['The Bear', 'Drama', 3],
    ];

    // CORRECCIÓN: Pasamos objetos a Mongoose
    datos.forEach(([nombre, genero, temps]) =>
      this.baseDeDatosGlobal.push(new Serie({ nombre, genero, temporadas: temps, estrellas: 0 }))
    );
  }
}

module.exports = new GestorSeries();