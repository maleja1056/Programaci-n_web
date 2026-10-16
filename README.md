# Programacion_web
## Inicio de sesión (FarmaUIS)

> Implementación académica: no está pensada para producción.

- El backend valida el correo y la contraseña contra la tabla `usuarios` (contraseñas con hash bcrypt).
- La sesión se guarda en el servidor con `express-session` y viaja en la cookie `farmauis.sid` (`HttpOnly`, `SameSite=Lax`). Las sesiones se guardan en memoria, así que se pierden al reiniciar el backend.
- Rutas: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` y la ruta privada `GET /api/panel/resumen` (responde 401 sin sesión).
- En el frontend: `/login` es público y `/panel` está protegido con `ProtectedRoute`.

### Primer uso

1. Copia `.env.example` como `.env` en la raíz y completa `MYSQL_*`, `SESSION_SECRET` y `ADMIN_*`.
2. Levanta MySQL con `docker compose up -d`. La primera vez que se crea el volumen, Docker ejecuta `database/schema.sql` y crea todas las tablas.
   Si tu volumen ya existía antes de este cambio, crea las tablas que falten (el script no borra datos):
   `docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < database/schema.sql`
3. Crea el administrador con `cd backend && npm run crear-admin`.
4. Inicia el backend (`npm run dev` en `backend/`) y el frontend (`npm run dev` en `frontend/`), y entra en `http://localhost:5173/login`.
