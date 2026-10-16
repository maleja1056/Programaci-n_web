# Programacion_web
## Inicio de sesión (FarmaUIS)

> Implementación académica: no está pensada para producción.

- El backend valida el usuario (o el correo) y la contraseña contra la tabla `usuarios` (contraseñas con hash bcrypt).
- La sesión se guarda en el servidor con `express-session` y viaja en la cookie `farmauis.sid` (`HttpOnly`, `SameSite=Lax`). Las sesiones se guardan en memoria, así que se pierden al reiniciar el backend.
- Rutas: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` y la ruta privada `GET /api/panel/resumen` (responde 401 sin sesión).
- En el frontend, el botón "Iniciar sesión" de la cabecera abre un modal de React-Bootstrap (`LoginModal` + `LoginForm` con `react-bootstrap/Form`). Con sesión iniciada aparece el menú desplegable de rutas privadas: `/panel` y `/perfil`, protegidas con `ProtectedRoute`. La página `/login` usa el mismo formulario y es el destino al intentar abrir una ruta privada sin sesión.

### Primer uso

1. Copia `.env.example` como `.env` en la raíz y completa `MYSQL_*`, `SESSION_SECRET` y `ADMIN_*`.
2. Levanta MySQL con `docker compose up -d`. La primera vez que se crea el volumen, Docker ejecuta `database/schema.sql` y crea todas las tablas.
   Si tu volumen ya existía antes de este cambio, crea las tablas que falten (el script no borra datos):
   `docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < database/schema.sql`
3. Crea el administrador con `cd backend && npm run crear-admin`. Usa `ADMIN_USUARIO`, `ADMIN_CORREO` y `ADMIN_PASSWORD` del `.env` y, si la tabla `usuarios` no tiene la columna `usuario`, la añade.
4. Inicia el backend (`npm run dev` en `backend/`) y el frontend (`npm run dev` en `frontend/`), y entra en `http://localhost:5173/login`.

## Estructura del frontend

```
frontend/src/
├── main.jsx                 Punto de entrada: Bootstrap, estilos globales, router y sesión
├── App.jsx                  Rutas públicas y privadas
├── api/                     Comunicación con el backend (fetch a /api)
├── context/                 Estado global de la sesión (AuthContext)
├── hooks/
│   └── useCatalog.js        Carga, búsqueda y filtro del catálogo
├── utils/
│   └── format.js            Formato de precios
├── components/
│   ├── auth/                Login (modal y formulario) y protección de rutas
│   ├── layout/              Cabecera y pie de página
│   └── home/                Secciones de la portada (hero, categorías, catálogo, banner)
├── pages/                   Páginas: inicio, login, panel, perfil y 404
└── styles/                  Hojas de estilo (app, index, bootstrap, cabecera, auth)
```

Archivos de cada integrante, para no editar los mismos a la vez:

| Integrante | Archivos principales |
|---|---|
| 1. Usuarios y sesión | `components/auth/`, `context/`, `api/auth.js`, `pages/LoginPage.jsx`, `PanelPage.jsx`, `ProfilePage.jsx` |
| 2. Catálogo y búsqueda | `hooks/useCatalog.js`, `components/home/CategoriesSection.jsx`, `CatalogSection.jsx` |
| 3. Detalle de producto | `components/home/ProductCard.jsx` y los componentes nuevos de detalle |
| 4. Diseño e integración | `components/layout/`, `components/home/HeroSection.jsx`, `CareBanner.jsx`, las secciones nuevas de la portada y `styles/` |
