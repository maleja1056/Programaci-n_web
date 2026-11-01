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

## Estructura del frontend

```
frontend/src/
├── main.jsx                 Punto de entrada: Bootstrap, estilos globales, router, sesión y carrito
├── App.jsx                  Rutas públicas y privadas
├── api/                     Comunicación con el backend (fetch a /api) y modo demostración
│   ├── config.js            Interruptor VITE_MODO_DEMO (backend por defecto)
│   ├── client.js            Cliente HTTP común
│   ├── crud.js              Listar, obtener, crear, modificar y cancelar en las 5 tablas
│   ├── archivos.js          Subir, listar, ver, descargar y borrar archivos
│   ├── auth.js / catalog.js Funciones que usa la app (backend o demo)
│   └── demo.js              Login, sesión, panel y catálogo simulados
├── context/                 Estado global: sesión (AuthContext) y carrito (CartContext)
├── data/                    Equipo, contacto y redes, carrusel, preguntas y catálogo de la demo (productos.js)
├── hooks/
│   ├── useActiveSection.js  Sección visible de la portada (enlace activo de la cabecera)
│   ├── useCategoryMenu.js   Categorías del submenú de la cabecera
│   └── useCatalog.js        Carga, búsqueda y filtro del catálogo
├── utils/
│   ├── format.js            Formato de precios, stock, fechas y plurales
│   └── pedidos.js           Estados de un pedido (los mismos del backend)
├── components/
│   ├── auth/                Login (modal y formulario) y protección de rutas
│   ├── layout/              Cabecera (con menú Collapse en móvil), pie de página y modal del equipo
│   ├── home/                Secciones de la portada (hero, categorías, catálogo, Bucaramanga, preguntas)
│   ├── carrito/             Botón "Agregar al carrito"
│   └── panel/               CRUD del panel: tabla genérica (CrudTable), una pestaña por tabla y el modal de pedidos
├── pages/                   Inicio, login, panel, perfil, carrito, mis pedidos, archivos y 404
└── styles/                  Hojas de estilo (tokens de color, app, cabecera, pie, auth, inicio, panel)
```
