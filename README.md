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
- `backend/src/middleware/requireAuth.js` exige sesión (401) y `requireAdmin.js` exige además el rol `administrador` (403).
- En el frontend, el botón «Iniciar sesión» de la cabecera abre un modal de React-Bootstrap (`LoginModal` + `LoginForm` con `react-bootstrap/Form`). Con la sesión iniciada aparece el menú de rutas privadas, `/panel` y `/perfil`, protegidas con `ProtectedRoute`.

### API REST (CRUD de las 5 tablas)

Cada tabla tiene su `express.Router` en `backend/src/routes/` con el mismo patrón:

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/<tabla>` | Lista. `?buscar=` filtra por texto |
| `GET` | `/api/<tabla>/:id` | Un registro |
| `POST` | `/api/<tabla>` | Inserta (responde 201) |
| `PUT` | `/api/<tabla>/:id` | Modifica solo los campos enviados |
| `DELETE` | `/api/<tabla>/:id` | Cancela (ver abajo) |

| Tabla | Ruta | Quién puede | Cancelar (`DELETE`) |
|---|---|---|---|
| categorias | `/api/categorias` | Leer: todos. Escribir: administrador | `activa = FALSE`; `?definitivo=true` la borra |
| productos | `/api/productos` (`?categoria=<id>`) | Leer: todos. Escribir: administrador | `activo = FALSE`; `?definitivo=true` lo borra si no está en ningún pedido |
| usuarios | `/api/usuarios` (`?rol=`) | Administrador. `POST /api/usuarios/registro` es público y siempre crea un cliente | `activo = FALSE` (ya no puede iniciar sesión); `?definitivo=true` lo borra si no tiene pedidos |
| pedidos | `/api/pedidos` (`?estado=`, `?usuario=<id>`) | Con sesión. El cliente solo ve y cancela los suyos; el administrador, todos | `estado = 'cancelado'` y se devuelve el stock |
| detalle_pedidos | `/api/detalle-pedidos` (`?pedido=<id>`) | Con sesión, sobre pedidos que se puedan modificar | Quita la línea y devuelve el stock |

Detalles:
- `?todos=true` en categorías y productos incluye los inactivos, solo para el administrador. Así el panel puede reactivarlos con `PUT { "activa": true }` o `{ "activo": true }`.
- `POST /api/pedidos` recibe `{ direccion_entrega, lineas: [{ producto_id, cantidad }] }`. Crea el pedido y sus líneas en una transacción y toma el precio de cada producto. Si no hay stock suficiente responde 409 y no guarda nada.
- El cliente modifica sus pedidos solo mientras están en `pendiente`. El administrador puede cambiar las líneas hasta `preparando`, y además cambia el `estado` con `PUT`.
- Las contraseñas se envían en `password` y se guardan con bcrypt. Ninguna respuesta incluye `password_hash`.
- **Aporte del equipo:** el middleware `backend/src/middleware/validarCorreo.js` revisa el correo con una expresión regular antes de guardar un usuario (`POST /api/usuarios`, `POST /api/usuarios/registro` y `PUT /api/usuarios/:id`). Si no es válido, responde 400.
- Errores: siempre `{ "success": false, "message": "..." }` con el código adecuado:
  - 400: datos inválidos;
  - 401: sin sesión;
  - 403: sin permiso;
  - 404: no existe;
  - 409: repetido, sin stock o estado que no lo permite.

### Modo demostración (Fase I)

Para mostrar el frontend sin backend ni MySQL, crea `frontend/.env` con `VITE_MODO_DEMO=true`. En ese modo:
- el login es simulado (`Admin` / `1234`, en `frontend/src/api/demo.js`);
- el catálogo sale de `frontend/src/data/productos.js`.

## Estructura del proyecto

No se incluyen `node_modules/` ni `.env`, que no se suben al repositorio. Tampoco los archivos que suben los usuarios en `backend/uploads/`.

```
Programaci-n_web/
├── README.md                         Este archivo: puesta en marcha, API y estructura
├── .env.example                      Plantilla del .env (conexión a MySQL, usuarios de prueba, sesión)
├── .gitignore                        Lo que no se sube: node_modules, dist, .env, archivos subidos
├── docker-compose.yml                Alternativa a XAMPP: MySQL 8.4 en Docker
│
├── database/                         Scripts SQL que usa npm run init-db
│   ├── schema.sql                    Crea la base farmauis y sus 5 tablas con llaves y restricciones
│   └── datos.sql                     Datos de ejemplo: categorías, 20 productos y un pedido
│
├── backend/                          API REST con Express y MySQL (puerto 3000)
│   ├── package.json                  Dependencias y scripts: start, dev, init-db
│   ├── package-lock.json             Versiones exactas de las dependencias
│   ├── scripts/
│   │   └── init-db.js                Crea en XAMPP el usuario un_usr, la base, las tablas y los datos
│   ├── public/                       Servidor de contenidos (express.static en /publico)
│   │   └── turismo/
│   │       ├── imagenes.json         Título, municipio, descripción y créditos de cada foto
│   │       ├── catedral-sagrada-familia.jpg
│   │       ├── basilica-giron.jpg
│   │       ├── cerro-del-santisimo.jpg
│   │       └── LEEME.txt             Autores y licencias Creative Commons de las fotos
│   ├── uploads/                      Archivos que suben los usuarios (/api/archivos)
│   │   └── .gitkeep                  Mantiene la carpeta vacía en el repositorio
│   └── src/
│       ├── server.js                 Punto de entrada: middlewares, rutas, /publico y manejo de errores
│       ├── config/
│       │   ├── db.js                 Pool de conexiones a MySQL (lee el .env)
│       │   └── session.js            express-session: cookie farmauis.sid de 2 horas
│       ├── lib/
│       │   ├── http.js               HttpError y utilidades comunes de las rutas (ids, búsqueda)
│       │   ├── pedidos.js            Reglas de pedidos: quién puede verlos, estados y stock
│       │   └── transaccion.js        Ejecuta varias consultas en una transacción (ROLLBACK si falla)
│       ├── middleware/
│       │   ├── requireAuth.js        Exige sesión iniciada (401)
│       │   ├── requireAdmin.js       Exige el rol administrador (403)
│       │   └── validarCorreo.js      Aporte del equipo: valida el correo con una expresión regular
│       └── routes/                   Un express.Router por recurso
│           ├── auth.js               Login, sesión actual y cierre de sesión
│           ├── categorias.js         CRUD de categorías
│           ├── productos.js          CRUD de productos
│           ├── usuarios.js           CRUD de usuarios (contraseña con bcrypt)
│           ├── pedidos.js            CRUD de pedidos (crear descuenta stock, cancelar lo devuelve)
│           ├── detalle-pedidos.js    CRUD de las líneas de cada pedido
│           ├── archivos.js           Subir, listar, ver, descargar y borrar archivos (multer)
│           └── panel.js              Totales del panel de administración
│
└── frontend/                         Sitio en React 19 + Vite + React-Bootstrap (puerto 5173)
    ├── index.html                    Página base donde se monta React
    ├── package.json                  Dependencias y scripts: dev, build, lint
    ├── package-lock.json             Versiones exactas de las dependencias
    ├── vite.config.js                Configuración de Vite y proxy de /api y /publico al backend
    ├── .oxlintrc.json                Reglas del revisor de código (oxlint)
    ├── .env.example                  VITE_MODO_DEMO para usar el sitio sin backend
    ├── .gitignore
    ├── public/
    │   └── favicon.svg               Ícono de la pestaña del navegador
    ├── scripts/
    │   └── check-colores.cjs         Revisa que los textos usen la paleta y cumplan contraste AA
    └── src/
        ├── main.jsx                  Punto de entrada: Bootstrap, router, sesión y carrito
        ├── App.jsx                   Rutas públicas y privadas, y hojas de estilo
        ├── api/                      Comunicación con el backend
        │   ├── config.js             Elige backend real o modo demostración (VITE_MODO_DEMO)
        │   ├── client.js             Cliente HTTP común (fetch, JSON y errores)
        │   ├── crud.js               Listar, obtener, crear, modificar y cancelar en las 5 tablas
        │   ├── archivos.js           Subir, listar, ver, descargar y borrar archivos
        │   ├── auth.js               Login, sesión y cierre de sesión
        │   ├── catalog.js            Catálogo de productos y categorías
        │   └── demo.js               Login, sesión, panel y catálogo simulados (modo demostración)
        ├── assets/                   Archivos multimedia que empaqueta Vite
        │   ├── audio/
        │   │   └── musica-relajante.mp3   Audio de la sección "Sobre nosotros"
        │   ├── video/
        │   │   └── lavado-manos.mp4       Video con un consejo de salud
        │   └── img/
        │       ├── logo.svg               Logo de FarmaUIS
        │       ├── lavado-manos-portada.jpg   Imagen de portada del video
        │       ├── carrusel/
        │       │   └── vitaminas.svg      Ilustración del carrusel
        │       └── equipo/                Fotos de los integrantes (pie de página)
        ├── context/                  Estado global de la aplicación
        │   ├── AuthContext.jsx       Proveedor de la sesión del usuario
        │   ├── auth-context.js       Contexto y hook useAuth
        │   ├── CartContext.jsx       Proveedor del carrito (se guarda en el navegador)
        │   └── cart-context.js       Contexto y hook useCart
        ├── data/                     Contenido fijo del sitio
        │   ├── carrusel.js           Diapositivas del carrusel
        │   ├── equipo.js             Integrantes del equipo
        │   ├── preguntas.js          Preguntas frecuentes
        │   ├── productos.js          Catálogo del modo demostración
        │   └── sitio.js              Contacto y redes sociales
        ├── hooks/
        │   ├── useActiveSection.js   Sección visible de la portada (enlace activo del menú)
        │   ├── useCatalog.js         Carga, búsqueda, filtro y orden del catálogo
        │   └── useCategoryMenu.js    Categorías del submenú de la cabecera
        ├── utils/
        │   ├── format.js             Formato de precios, stock, fechas y plurales
        │   ├── ilustraciones.js      Qué dibujo usa cada producto
        │   ├── inicio.js             Subir al inicio al pulsar el logo
        │   └── pedidos.js            Estados de un pedido (los mismos del backend)
        ├── components/
        │   ├── auth/
        │   │   ├── LoginForm.jsx         Formulario de inicio de sesión
        │   │   ├── LoginModal.jsx        Login en un modal, sin salir de la página
        │   │   └── ProtectedRoute.jsx    Protege las rutas privadas: sin sesión lleva al login
        │   ├── carrito/
        │   │   └── BotonAgregar.jsx      Botón "Agregar al carrito"
        │   ├── layout/
        │   │   ├── SiteHeader.jsx        Cabecera fija con menú y submenús desplegables
        │   │   ├── SiteFooter.jsx        Pie de página: contacto, redes y equipo
        │   │   └── TeamMemberModal.jsx   Carnet 3D de cada integrante
        │   ├── home/                     Secciones de la portada
        │   │   ├── AnnouncementBar.jsx   Franja superior con zona de entregas y horario
        │   │   ├── HeroSection.jsx       Sección principal con la vitrina animada
        │   │   ├── PromoCarousel.jsx     Carrusel: cómo pedir, producto destacado y más
        │   │   ├── CatalogSection.jsx    Catálogo con búsqueda, categorías, orden y vista
        │   │   ├── ProductCard.jsx       Tarjeta de un producto
        │   │   ├── ProductDetailModal.jsx    Detalle de un producto en un modal
        │   │   ├── ProductoIlustracion.jsx   Dibujos SVG de los productos
        │   │   ├── TurismoSection.jsx    Fotos de Bucaramanga (desde /publico del backend)
        │   │   ├── AboutSection.jsx      Sobre nosotros, con audio y video
        │   │   ├── FaqSection.jsx        Preguntas frecuentes (acordeón)
        │   │   └── CareBanner.jsx        Banner final que lleva al carrito o al catálogo
        │   └── panel/                    Panel de administración (CRUD)
        │       ├── CrudTable.jsx         Tabla genérica: buscar, crear, editar y cancelar
        │       ├── CategoriasTab.jsx     Pestaña Categorías
        │       ├── ProductosTab.jsx      Pestaña Productos
        │       ├── UsuariosTab.jsx       Pestaña Usuarios
        │       ├── PedidosTab.jsx        Pestaña Pedidos
        │       ├── PedidoModal.jsx       Crear o editar un pedido con sus líneas (detalle_pedidos)
        │       ├── columnasPedido.jsx    Columnas de la tabla de pedidos
        │       └── FiltroEstado.jsx      Filtro de pedidos por estado
        ├── pages/                    Una página por ruta
        │   ├── HomePage.jsx          / (portada)
        │   ├── LoginPage.jsx         /login
        │   ├── CarritoPage.jsx       /carrito
        │   ├── PanelPage.jsx         /panel (solo administrador)
        │   ├── ProfilePage.jsx       /perfil
        │   ├── MisPedidosPage.jsx    /mis-pedidos
        │   ├── ArchivosPage.jsx      /archivos (subir y bajar archivos)
        │   └── NotFoundPage.jsx      Cualquier otra ruta (404)
        └── styles/
            ├── tokens.css            Paleta de colores y curvas de animación
            ├── index.css             Reglas globales mínimas
            ├── bootstrap-overrides.css   Ajustes a Bootstrap
            ├── app.css               Base, cabecera, hero y catálogo
            ├── header.css            Cabecera y menú
            ├── home.css              Secciones de la portada
            ├── footer.css            Pie de página y carnet del equipo
            ├── auth.css              Login, perfil y páginas internas
            └── panel.css             Panel de administración y tablas
```
