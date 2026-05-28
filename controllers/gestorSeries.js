/**
 * controllers/gestorSeries.js
 */

const Serie     = require('../models/serie');
const Watchlist = require('../models/watchlist');

class GestorSeries {
  constructor() {
    this.listaLanzamientos = [];
    this.baseDeDatosGlobal = [];
    this._cargarContenidoInicial();
  }

  obtenerLanzamientos()    { return this.listaLanzamientos; }
  obtenerCatalogoCompleto(){ return this.baseDeDatosGlobal; }

  buscarSugerencias(prefijo) {
    if (!prefijo || prefijo.trim() === '') return [];
    const q = prefijo.toLowerCase().trim();
    return this.baseDeDatosGlobal.filter(s => s.nombre.toLowerCase().includes(q));
  }

  // ── Historial ─────────────────────────────────────────────────────────────

  async obtenerHistorial(usuarioId) {
    return Serie.find({ usuarioId }).sort({ fechaAgregada: -1 }).populate('usuarioId', 'username');
  }

  async agregarSerieHistorial(serieData, usuarioId) {
    const nueva = new Serie({
      nombre:     serieData.nombre,
      genero:     serieData.genero,
      temporadas: Number(serieData.temporadas),
      estrellas:  Number(serieData.estrellas) || 0,
      critica:    serieData.critica || '',
      usuarioId
    });
    await nueva.save();
    return nueva;
  }

  async editarCritica(serieId, usuarioId, datos) {
    const fields = {};
    if (datos.critica    !== undefined) fields.critica    = datos.critica;
    if (datos.estrellas  !== undefined) fields.estrellas  = Number(datos.estrellas);
    return Serie.findOneAndUpdate(
      { _id: serieId, usuarioId },
      { $set: fields },
      { new: true }
    );
  }

  async eliminarSerie(serieId, usuarioId) {
    const res = await Serie.deleteOne({ _id: serieId, usuarioId });
    return res.deletedCount > 0;
  }

  // ── Reseñas públicas de una serie ─────────────────────────────────────────
  async obtenerResenasPorSerie(nombre) {
    return Serie.find(
      { nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }, critica: { $ne: '' } },
      { critica: 1, estrellas: 1, usuarioId: 1 }
    ).populate('usuarioId', 'username').sort({ fechaAgregada: -1 }).limit(20);
  }

  // ── Estadísticas ──────────────────────────────────────────────────────────

  async obtenerEstadisticas(usuarioId) {
    const series = await Serie.find({ usuarioId });
    const total = series.length;
    let favorito = 'Ninguno';
    if (total > 0) {
      const conteo = {};
      for (const s of series) conteo[s.genero] = (conteo[s.genero] || 0) + 1;
      favorito = Object.entries(conteo).reduce((max, e) => (e[1] > max[1] ? e : max), ['', 0])[0];
    }
    const media = total === 0
      ? 0.0
      : Math.round((series.reduce((a, s) => a + s.estrellas, 0) / total) * 10) / 10;
    return { total, favorito, media };
  }

  // ── Watchlist "Por Ver" ────────────────────────────────────────────────

  async obtenerWatchlist(usuarioId) {
    return Watchlist.find({ usuarioId }).sort({ fechaAgregada: -1 });
  }

  async agregarAWatchlist(data, usuarioId) {
    const nueva = new Watchlist({
      usuarioId,
      nombre:     data.nombre,
      genero:     data.genero,
      temporadas: Number(data.temporadas)
    });
    await nueva.save();
    return nueva;
  }

  async quitarDeWatchlist(id, usuarioId) {
    const res = await Watchlist.deleteOne({ _id: id, usuarioId });
    return res.deletedCount > 0;
  }

  async buscarEnWatchlist(nombre, usuarioId) {
    return Watchlist.findOne({
      usuarioId,
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }
    });
  }

  // ── Contenido Inicial ─────────────────────────────────────────────────────

  _cargarContenidoInicial() {
    [
      { nombre: 'Shogun',                 genero: 'Drama',  temporadas: 1, tmdbId: 81189 },
      { nombre: 'Fallout',                genero: 'Sci-Fi', temporadas: 1, tmdbId: 106379 },
      { nombre: 'The Bear S3',            genero: 'Drama',  temporadas: 3, tmdbId: 136315 },
      { nombre: 'House of the Dragon S2', genero: 'Acción', temporadas: 2, tmdbId: 94997 },
      { nombre: 'The Boys S4',            genero: 'Acción', temporadas: 4, tmdbId: 76479 },
    ].forEach(s => this.listaLanzamientos.push(s));

    const datos = [
      ['Breaking Bad','Drama',5, 1396],
      ['The Wire','Drama',5, 1438],
      ['The Sopranos','Drama',6, 1398],
      ['Game of Thrones','Acción',8, 1399],
      ['Succession','Drama',4, 76331],
      ['The Last of Us','Terror',1, 100088],
      ['Stranger Things','Sci-Fi',4, 66732],
      ['Dark','Sci-Fi',3, 70523],
      ['Black Mirror','Sci-Fi',6, 42009],
      ['Severance','Sci-Fi',1, 95396],
      ['The Office','Comedia',9, 2316],
      ['Seinfeld','Comedia',9, 1400],
      ['Friends','Comedia',10, 1668],
      ['Brooklyn Nine-Nine','Comedia',8, 48891],
      ['Parks and Recreation','Comedia',7, 8592],
      ['Better Call Saul','Drama',6, 60059],
      ['Mad Men','Drama',7, 1104],
      ['Peaky Blinders','Drama',6, 60574],
      ['The Crown','Drama',6, 65494],
      ['Chernobyl','Drama',1, 87108],
      ['Band of Brothers','Acción',1, 4613],
      ['The Mandalorian','Sci-Fi',3, 82856],
      ['Andor','Sci-Fi',1, 83867],
      ['Loki','Sci-Fi',2, 84958],
      ['WandaVision','Sci-Fi',1, 85271],
      ['Invincible','Acción',2, 95557],
      ['Arcane','Sci-Fi',1, 94605],
      ['Cyberpunk: Edgerunners','Sci-Fi',1, 105248],
      ['Attack on Titan','Acción',4, 1429],
      ['Death Note','Drama',1, 13916],
      ['The Haunting of Hill House','Terror',1, 72844],
      ['Midnight Mass','Terror',1, 97400],
      ['American Horror Story','Terror',12, 1413],
      ['The Walking Dead','Terror',11, 1402],
      ['Bates Motel','Terror',5, 46786],
      ['Fargo','Drama',5, 60622],
      ['True Detective','Drama',4, 46648],
      ['Mindhunter','Drama',2, 67744],
      ['Ozark','Drama',4, 69740],
      ['Narcos','Drama',3, 63351],
      ['Ted Lasso','Comedia',3, 97546],
      ['Arrested Development','Comedia',5, 4589],
      ['Curb Your Enthusiasm','Comedia',12, 4546],
      ['It\'s Always Sunny','Comedia',16, 2710],
      ['Fleabag','Comedia',2, 67070],
      ['Doctor Who','Sci-Fi',13, 57243],
      ['The X-Files','Sci-Fi',11, 4087],
      ['Fringe','Sci-Fi',5, 1705],
      ['The Expanse','Sci-Fi',6, 63639],
      ['Westworld','Sci-Fi',4, 63247],
      ['The Bear','Drama',3, 136315],
    ];
    datos.forEach(([nombre, genero, temporadas, tmdbId]) =>
      this.baseDeDatosGlobal.push({ nombre, genero, temporadas, estrellas: 0, tmdbId })
    );
  }
}

module.exports = new GestorSeries();
