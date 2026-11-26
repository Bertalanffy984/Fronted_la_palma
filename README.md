# La Palma · Gestión cafetera

Aplicación web responsiva de la finca La Palma. Usa React, React Router, Tailwind CSS y Vite. Consume la API del proyecto vecino `Backend_la_palma`.

## Iniciar en Windows

Inicia la API en una terminal de PowerShell desde la carpeta del backend.

```powershell
uv run fastapi dev --reload
```

En otra terminal del backend, inicia el proceso que actualiza los resúmenes en MongoDB.

```powershell
uv run python -m app.worker
```

Desde la carpeta `Frontend_la_palma`, ejecuta estos comandos.

```powershell
npm.cmd ci
npm.cmd run dev
```

Abre [La Palma en el navegador](http://127.0.0.1:5173) e ingresa con tu cuenta de aplicación.

## Acceso por rol

- **Administrador.** Crea y gestiona cuentas de encargados. Consulta y filtra la auditoría de pesajes.
- **Encargado.** Gestiona jornadas, inscripciones, pesajes, liquidaciones, pagos, trabajadores, municipios, veredas, compradoras, precios y ventas. Consulta reportes y el estado de sincronización por jornada.

La sesión JWT se conserva en la pestaña y se valida con la API al recargar. El backend verifica los permisos de cada solicitud.

## Conexión a la API

Vite reenvía las solicitudes de `/api` a `http://127.0.0.1:8000`. La configuración predeterminada funciona sin crear un archivo `.env` del frontend. Si usas otro puerto, copia `.env.example` a `.env.local` y ajusta `API_PROXY_TARGET`.

Al desplegar `dist/`, configura el servidor web para reenviar `/api` a FastAPI y servir `index.html` en las rutas del frontend. Las credenciales de las bases de datos y la firma de JWT se configuran en el backend.

## Verificar y compilar

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run preview
```

La compilación queda en `dist/`. La vista previa usa la misma API configurada para desarrollo.

## Imágenes

`public/images/cafetales.jpg` y `public/images/cerezas.jpg` se generaron con ImageGen. Las escenas representan el paisaje cafetero andino y las cerezas de café.

<details>
<summary>Descripciones usadas para generar las imágenes</summary>

**Cafetales**

Use case: photorealistic-natural. Landscape hero photograph for the La Palma coffee farm operations website. Wide view of a real Colombian Andean coffee-growing landscape at early morning, dark emerald arabica rows curving down a steep hillside toward a valley, layered green mountain ridges, soft low mist, warm directional daylight breaking through overcast sky. A few understated farm roofs in the distance. Authentic topography, natural foliage textures, tasteful editorial agriculture photography, olive and muted forest greens with soft gold highlights. No text, graphic overlays, logos, watermark, borders or collage. Medium-wide landscape composition, subject remains legible when cropped to a slightly portrait window.

**Cerezas**

Use case: photorealistic-natural. Editorial farm photograph for a Colombian coffee harvest dashboard card. Close detail of ripe deep red arabica coffee cherries and a few fresh green cherries clustered on a healthy coffee branch, intact glossy leaves, natural mountain farm light and shallow depth of field. Beautiful tactile real-world textures, deep forest and ripe burgundy colors, warm highlights and subtle natural grain. Horizontal landscape framing suitable for a 3:2 crop. No text, logos, overlays, watermark, collage or visible artificial background.

</details>
