# Programacion_web
## Modo demostración (entrega Fase I)

Por defecto el frontend funciona **solo, sin backend ni MySQL**, como pide la Fase I:

```
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con usuario **`Admin`** y contraseña **`1234`**.

- El login es simulado en `frontend/src/api/demo.js`: valida las credenciales escritas en el código y guarda la sesión en `sessionStorage` (se mantiene al recargar y termina al cerrar la pestaña). Las rutas privadas siguen protegidas por `ProtectedRoute`.
- El catálogo sale de `frontend/src/data/productos.js` (mismos campos que devuelve la API).
- Para usar el backend real, copia `frontend/.env.example` como `frontend/.env` con `VITE_USAR_BACKEND=true` y sigue los pasos de la sección siguiente. La conexión a la base de datos queda para la siguiente fase.

## Inicio de sesión con backend (FarmaUIS)

> Implementación académica: no está pensada para producción.

- El backend valida el usuario (o el correo) y la contraseña contra la tabla `usuarios` (contraseñas con hash bcrypt).
- La sesión se guarda en el servidor con `express-session` y viaja en la cookie `farmauis.sid` (`HttpOnly`, `SameSite=Lax`). Las sesiones se guardan en memoria, así que se pierden al reiniciar el backend.
- Rutas: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` y la ruta privada `GET /api/panel/resumen` (responde 401 sin sesión).
- En el frontend, el botón «Iniciar sesión» de la cabecera abre un modal de React-Bootstrap (`LoginModal` + `LoginForm` con `react-bootstrap/Form`). Con sesión iniciada aparece el menú desplegable de rutas privadas: `/panel` y `/perfil`, protegidas con `ProtectedRoute`. La página `/login` usa el mismo formulario y es el destino al intentar abrir una ruta privada sin sesión.

### Primer uso

1. Copia `.env.example` como `.env` en la raíz y completa `MYSQL_*`, `SESSION_SECRET` y `ADMIN_*`.
2. Levanta MySQL con `docker compose up -d`. La primera vez que se crea el volumen, Docker ejecuta `database/schema.sql` y crea todas las tablas.
   Si tu volumen ya existía antes de este cambio, crea las tablas que falten (el script no borra datos):
   `docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < database/schema.sql`
3. Crea el administrador con `cd backend && npm run crear-admin`. Usa `ADMIN_USUARIO`, `ADMIN_CORREO` y `ADMIN_PASSWORD` del `.env` y, si la tabla `usuarios` no tiene la columna `usuario`, la añade.
4. Crea `frontend/.env` con `VITE_USAR_BACKEND=true`.
5. Inicia el backend (`npm run dev` en `backend/`) y el frontend (`npm run dev` en `frontend/`), y entra en `http://localhost:5173/login`.

## Estructura del frontend

```
frontend/src/
├── main.jsx                 Punto de entrada: Bootstrap, estilos globales, router y sesión
├── App.jsx                  Rutas públicas y privadas
├── api/                     Comunicación con el backend (fetch a /api) y modo demostración
│   ├── config.js            Interruptor VITE_USAR_BACKEND (demo por defecto)
│   ├── demo.js              Login, sesión, panel y catálogo simulados
│   ├── auth.js / catalog.js Funciones que usa la app (backend o demo)
│   └── client.js            Cliente HTTP común
├── context/                 Estado global de la sesión (AuthContext)
├── data/                    Equipo, contacto y redes, carrusel, preguntas y catálogo de la demo (productos.js)
├── hooks/
│   ├── useActiveSection.js  Sección visible de la portada (enlace activo de la cabecera)
│   └── useCatalog.js        Carga, búsqueda y filtro del catálogo
├── utils/
│   └── format.js            Formato de precios
├── components/
│   ├── auth/                Login (modal y formulario) y protección de rutas
│   ├── layout/              Cabecera (con menú Collapse en móvil), pie de página y modal del equipo
│   └── home/                Secciones de la portada (hero, categorías, catálogo, banner)
├── pages/                   Páginas: inicio, login, panel, perfil y 404
└── styles/                  Hojas de estilo (app, index, bootstrap, cabecera, pie, auth)
```

Archivos de cada integrante, para no editar los mismos a la vez:

| Integrante | Archivos principales |
|---|---|
| 1. Usuarios y sesión | `components/auth/`, `context/`, `api/auth.js`, `pages/LoginPage.jsx`, `PanelPage.jsx`, `ProfilePage.jsx` |
| 2. Catálogo y búsqueda | `hooks/useCatalog.js`, `components/home/CategoriesSection.jsx`, `CatalogSection.jsx` |
| 3. Detalle de producto | `components/home/ProductCard.jsx` y los componentes nuevos de detalle |
| 4. Diseño e integración | `components/layout/`, `data/`, `components/home/HeroSection.jsx`, `CareBanner.jsx`, las secciones nuevas de la portada y `styles/` |
