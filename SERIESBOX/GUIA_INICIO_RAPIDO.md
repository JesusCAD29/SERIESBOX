# 🎬 SeriesBox – Guía de Inicio Rápido

> Sigue estos pasos **en orden**. No te saltes ninguno.

---

## ✅ Paso 1 – Instala Node.js

Node.js es el motor que necesita el proyecto para funcionar.

1. Abre tu navegador y ve a 👉 **https://nodejs.org**
2. Descarga el botón que dice **"LTS"** (la versión recomendada).
3. Abre el instalador y dale **"Next"** a todo hasta que diga "Finish".

> ✔️ Para verificar que quedó bien instalado, abre una terminal y escribe:
> ```
> git pull origin main
> ```
> Debe aparecer algo como `v20.x.x`. Si lo ves, estás listo.

---

## ✅ Paso 2 – Descarga el proyecto

Tienes dos opciones:

### Opción A – Te lo pasan por USB / carpeta compartida
Copia la carpeta `seriesbox_web` a cualquier lugar de tu computadora (por ejemplo, en el Escritorio o en Documentos).

### Opción B – Descargarlo de GitHub (si tienen el link)
1. Abre el link del repositorio en tu navegador.
2. Haz clic en el botón verde **"Code"** → **"Download ZIP"**.
3. Extrae el ZIP en tu computadora.

---

## ✅ Paso 3 – Abre la terminal en la carpeta correcta

1. Abre la carpeta `seriesbox_web` en el Explorador de archivos.
2. Entra a la subcarpeta **`seriesbox`**.
3. En la barra de direcciones de arriba (donde dice la ruta), borra todo, escribe `cmd` y presiona **Enter**.

   > Esto abre la terminal **justo en la carpeta correcta**.

---

## ✅ Paso 4 – Instala las dependencias del proyecto

Dentro de la terminal que se abrió, escribe este comando y presiona **Enter**:

```
npm install
```

Espera a que termine. Verás un mensaje como `added 98 packages`. **Esto solo se hace una vez.**

---

## ✅ Paso 5 – Arranca el servidor

Escribe el siguiente comando y presiona **Enter**:

```
npm run dev
```

Si todo está bien, verás esto en la terminal:

```
🎬  SeriesBox corriendo en http://localhost:3000
```

---

## ✅ Paso 6 – Abre la aplicación

Abre tu navegador (Chrome, Edge, etc.) y escribe en la barra de direcciones:

```
http://localhost:3000
```

¡Listo! 🎉 Ya tienes SeriesBox funcionando en tu computadora.

---

## ⚠️ Problemas comunes

| Problema | Solución |
|---|---|
| `'node' no se reconoce como comando` | Node.js no quedó instalado. Repite el Paso 1 y reinicia la computadora. |
| `npm install` da error rojo | Asegúrate de estar dentro de la carpeta `seriesbox` (Paso 3). |
| La página no carga en el navegador | Verifica que la terminal siga abierta y no hayas cerrado el servidor. |
| El puerto 3000 ya está en uso | Cierra otros programas o reinicia la computadora. |

---

## 🛑 Para detener el servidor

En la terminal donde corre el servidor, presiona:

```
Ctrl + C
```

---

> 💬 ¿Algo no te funcionó? Escríbele a **Jesús** o muéstrale el mensaje de error en pantalla.
