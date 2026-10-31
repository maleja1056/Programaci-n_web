# Programacion_web
## Puesta en marcha (Fase II, con XAMPP)

> Implementación académica: no está pensada para producción.

1. Instala XAMPP y enciende **MySQL** en su panel de control. Apache no hace falta, salvo para usar phpMyAdmin.
2. Copia `.env.example` como `.env` en la raíz del proyecto. Con XAMPP recién instalado no hay que cambiar nada, porque `root` no tiene contraseña. Si le pusiste una, escríbela en `MYSQL_ROOT_PASSWORD`.
3. Crea la base de datos:
   ```
   cd backend
   npm install
   npm run init-db
   ```
   El script (`backend/scripts/init-db.js`):
   - crea el usuario de MySQL **`un_usr` / `una_clave`**;
   - crea la base **`farmauis`** con sus 5 tablas (`database/schema.sql`);
   - crea los usuarios de prueba con su contraseña cifrada;
   - carga los datos de ejemplo (`database/datos.sql`).

   Se puede ejecutar varias veces sin duplicar datos.
4. Inicia el backend con `npm run dev` en `backend/` (puerto 3000) y el frontend con `npm install && npm run dev` en `frontend/`.
5. Abre `http://localhost:5173`.

Usuarios para iniciar sesión (se puede usar el usuario o el correo):

```
usuario | clave       // descripción
Admin   | 1234        // administrador (admin@farmauis.local)
cliente | cliente123  // cliente de prueba (cliente@farmauis.local), tiene un pedido
```

**Alternativa sin XAMPP:** `docker compose up -d` levanta un MySQL 8.4 con `root` sin contraseña. Después se sigue desde el paso 3.

### Inicio de sesión

- El backend valida el usuario (o el correo) y la contraseña contra la tabla `usuarios`. Las contraseñas se guardan con hash bcrypt.
- La sesión se guarda en el servidor con `express-session` y viaja en la cookie `farmauis.sid` (`HttpOnly`, `SameSite=Lax`). Las sesiones están en memoria, así que se pierden al reiniciar el backend.
- Rutas: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` y la ruta privada `GET /api/panel/resumen`, que responde 401 sin sesión.
- En el frontend, el botón «Iniciar sesión» de la cabecera abre un modal de React-Bootstrap (`LoginModal` + `LoginForm` con `react-bootstrap/Form`). Con la sesión iniciada aparece el menú de rutas privadas, `/panel` y `/perfil`, protegidas con `ProtectedRoute`.

### Modo demostración (Fase I)

Para mostrar el frontend sin backend ni MySQL, crea `frontend/.env` con `VITE_MODO_DEMO=true`. En ese modo:
- el login es simulado (`Admin` / `1234`, en `frontend/src/api/demo.js`);
- el catálogo sale de `frontend/src/data/productos.js`.

## Estructura del frontend

```
frontend/src/
├── main.jsx                 Punto de entrada: Bootstrap, estilos globales, router y sesión
├── App.jsx                  Rutas públicas y privadas
├── api/                     Comunicación con el backend (fetch a /api) y modo demostración
│   ├── config.js            Interruptor VITE_MODO_DEMO (backend por defecto)
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
