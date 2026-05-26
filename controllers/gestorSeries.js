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
      { nombre: 'Shogun',                 genero: 'Drama',  temporadas: 1 },
      { nombre: 'Fallout',                genero: 'Sci-Fi', temporadas: 1 },
      { nombre: 'The Bear S3',            genero: 'Drama',  temporadas: 3 },
      { nombre: 'House of the Dragon S2', genero: 'Acción', temporadas: 2 },
      { nombre: 'The Boys S4',            genero: 'Acción', temporadas: 4 },
    ].forEach(s => this.listaLanzamientos.push(s));

    const datos = [
      ['Breaking Bad','Drama',5],['The Wire','Drama',5],['The Sopranos','Drama',6],
      ['Game of Thrones','Acción',8],['Succession','Drama',4],['The Last of Us','Terror',1],
      ['Stranger Things','Sci-Fi',4],['Dark','Sci-Fi',3],['Black Mirror','Sci-Fi',6],
      ['Severance','Sci-Fi',1],['The Office','Comedia',9],['Seinfeld','Comedia',9],
      ['Friends','Comedia',10],['Brooklyn Nine-Nine','Comedia',8],['Parks and Recreation','Comedia',7],
      ['Better Call Saul','Drama',6],['Mad Men','Drama',7],['Peaky Blinders','Drama',6],
      ['The Crown','Drama',6],['Chernobyl','Drama',1],['Band of Brothers','Acción',1],
      ['The Mandalorian','Sci-Fi',3],['Andor','Sci-Fi',1],['Loki','Sci-Fi',2],
      ['WandaVision','Sci-Fi',1],['Invincible','Acción',2],['Arcane','Sci-Fi',1],
      ['Cyberpunk: Edgerunners','Sci-Fi',1],['Attack on Titan','Acción',4],['Death Note','Drama',1],
      ['The Haunting of Hill House','Terror',1],['Midnight Mass','Terror',1],
      ['American Horror Story','Terror',12],['The Walking Dead','Terror',11],
      ['Bates Motel','Terror',5],['Fargo','Drama',5],['True Detective','Drama',4],
      ['Mindhunter','Drama',2],['Ozark','Drama',4],['Narcos','Drama',3],
      ['Ted Lasso','Comedia',3],['Arrested Development','Comedia',5],
      ['Curb Your Enthusiasm','Comedia',12],["It's Always Sunny",'Comedia',16],
      ['Fleabag','Comedia',2],['Doctor Who','Sci-Fi',13],['The X-Files','Sci-Fi',11],
      ['Fringe','Sci-Fi',5],['The Expanse','Sci-Fi',6],['Westworld','Sci-Fi',4],
      ['The Bear','Drama',3],
    ];
    datos.forEach(([nombre, genero, temporadas]) =>
      this.baseDeDatosGlobal.push({ nombre, genero, temporadas, estrellas: 0 })
    );
  }
}

module.exports = new GestorSeries();
