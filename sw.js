// Nombre del caché (cámbialo si haces actualizaciones grandes)
const CACHE_NAME = "mangatracker-v1";

// Archivos que queremos guardar para que funcionen sin internet
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./app.js",
  "./styles.css",
  "./icon-192.png",
  "./icon-512.png",
];

// 1. EVENTO DE INSTALACIÓN: Guarda los archivos en la "mochila" (caché)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 [SW] Guardando archivos en caché...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

// 2. EVENTO DE ACTIVACIÓN: Limpia cachés antiguos si los hay
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("🗑️ [SW] Borrando caché antiguo:", key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. EVENTO FETCH: Intercepta las peticiones de red
self.addEventListener("fetch", (event) => {
  // Solo interceptamos peticiones GET (para no romper Firebase)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el archivo está en caché, lo devolvemos al instante
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está, lo buscamos en internet
      return fetch(event.request).catch(() => {
        // Si falla internet y es una página, podrías devolver un "offline.html" aquí
        console.warn("📡 [SW] Sin conexión y archivo no encontrado en caché.");
      });
    }),
  );
});
