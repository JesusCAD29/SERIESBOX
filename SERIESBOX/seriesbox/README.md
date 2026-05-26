# 🎬 SeriesBox – Web Edition

Migración completa de la aplicación Java Swing a **Node.js + Express + HTML5/CSS3/JS**.

---

## Estructura del proyecto

```
seriesbox/
├── server.js                  ← Punto de entrada Express
├── package.json
├── .gitignore
│
├── models/
│   └── serie.js               ← Entidad Serie (mirror de Serie.java)
│
├── controllers/
│   └── gestorSeries.js        ← Lógica de negocio (mirror de GestorSeries.java)
│
├── routes/
│   └── api.js                 ← Endpoints REST
│
└── public/                    ← Frontend estático servido por Express
    ├── index.html             ← Shell de la SPA
    ├── css/
    │   └── tema.css           ← Tema oscuro Premium (mirror de Tema.java)
    └── js/
        ├── api.js             ← Capa de datos (fetch al backend)
        ├── panelHome.js       ← Lanzamientos (mirror de PanelHome.java)
        ├── panelMySeries.js   ← Mis Series (mirror de PanelMySeries.java)
        ├── panelRuleta.js     ← Ruleta (mirror de PanelRuleta.java)
        └── app.js             ← Orquestador / router de tabs
```

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo (con hot-reload)
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

---

## Despliegue en Railway

1. Crea una cuenta en [railway.app](https://railway.app).
2. Haz clic en **"New Project" → "Deploy from GitHub repo"**.
3. Conecta tu repositorio (asegúrate de haber hecho `git push`).
4. Railway detecta automáticamente `package.json` y usa `npm start`.
5. En **Settings → Networking**, expón el puerto `3000`
   o usa la variable de entorno `PORT` (ya configurada en `server.js`).
6. ✅ Tu app estará en `https://<nombre>.up.railway.app`

**Variables de entorno necesarias:** ninguna (datos en memoria).

---

## Despliegue en Render

1. Crea una cuenta en [render.com](https://render.com).
2. **New → Web Service → Connect a repository**.
3. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
4. En **Environment Variables** puedes añadir `PORT=3000`
   (Render también lo inyecta automáticamente).
5. ✅ Tu app estará en `https://<nombre>.onrender.com`

> **Nota:** Render tiene un plan gratuito que "duerme" la instancia tras
> 15 min de inactividad. Para producción, usa el plan Starter ($7/mes).

---

## Endpoints de la API

| Método | Ruta               | Descripción                              |
|--------|--------------------|------------------------------------------|
| GET    | /api/lanzamientos  | Novedades destacadas                     |
| GET    | /api/catalogo      | Catálogo completo (51 series)            |
| GET    | /api/historial     | Series marcadas por el usuario           |
| POST   | /api/historial     | Agregar serie al historial               |
| GET    | /api/buscar?q=     | Autocomplete (busca por nombre)          |
| GET    | /api/stats         | Estadísticas (total, favorito, media)    |
| GET    | /api/usuario       | Obtener nombre de usuario                |
| PUT    | /api/usuario       | Actualizar nombre de usuario             |

---

## Notas de arquitectura

- **Estado en memoria:** igual que el original Java, los datos viven en el
  proceso Node.js. Para persistencia real, reemplaza el array en
  `controllers/gestorSeries.js` por una base de datos (SQLite, PostgreSQL).
- **Animación de la ruleta:** migrada de `javax.swing.Timer` (16ms) a
  `requestAnimationFrame` con easing `EaseOutQuart` idéntico al original Java.
- **Autocomplete:** usa debounce de 200ms para no saturar el servidor,
  en lugar del `KeyAdapter` instantáneo de Swing.
