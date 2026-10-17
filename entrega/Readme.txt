==============================================================================
  07_FarmaUIS - Droguería en línea (Programación en la Web, UIS, Fase I)
==============================================================================

Aplicación web hecha en React (Vite + React-Bootstrap). En esta Fase I
funciona sola, sin servidor ni base de datos: el inicio de sesión es simulado
y el catálogo de productos está incluido en el código.

Usuario de prueba:   Admin
Contraseña:          1234

------------------------------------------------------------------------------
1. REQUISITOS
------------------------------------------------------------------------------
- Node.js versión 20.19 o superior (recomendado: la versión LTS más reciente).
  Se descarga de https://nodejs.org (incluye npm).
- Conexión a internet la primera vez, para descargar las dependencias.
- Un navegador actualizado (Chrome, Firefox o Edge).

Para comprobar la versión instalada, en una terminal:
    node -v
    npm -v

------------------------------------------------------------------------------
2. INSTALACIÓN Y EJECUCIÓN EN EL COMPUTADOR LOCAL
------------------------------------------------------------------------------
1) Descomprimir 07_FarmaUIS.zip.

2) Abrir una terminal (CMD, PowerShell o la terminal de VS Code) dentro de la
   carpeta 07_FarmaUIS (la que contiene el archivo package.json):
       cd ruta/donde/se/descomprimio/07_FarmaUIS

3) Instalar las dependencias (crea la carpeta node_modules, que no se incluye
   en el zip). Tarda uno o dos minutos:
       npm install

4) Iniciar la aplicación:
       npm run dev

5) Abrir en el navegador la dirección que muestra la terminal:
       http://localhost:5173

6) Para detener la aplicación, en la terminal presionar Ctrl + C.

------------------------------------------------------------------------------
3. CÓMO PROBAR LA APLICACIÓN
------------------------------------------------------------------------------
- Portada: carrusel, tres columnas con efecto fade, catálogo con buscador,
  filtro por categoría y menú "Ordenar por", acordeón de preguntas, sección
  "Sobre nosotros" con video, audio y letra capital, y pie de página con
  redes sociales y datos del equipo (clic en cada integrante).
- Rutas privadas: intentar abrir http://localhost:5173/panel o
  http://localhost:5173/perfil sin iniciar sesión redirige al login.
- Iniciar sesión: botón "Iniciar sesión" de la cabecera (abre un modal) con
  usuario Admin y contraseña 1234. Al entrar aparece el menú desplegable de
  rutas privadas (Panel y Mi perfil) y la opción "Cerrar sesión".
- Diseño adaptable: reducir el ancho de la ventana o abrir las herramientas
  del navegador (F12) en modo celular o tableta.

------------------------------------------------------------------------------
4. VERSIÓN DE PRODUCCIÓN (OPCIONAL)
------------------------------------------------------------------------------
Para generar y revisar la versión optimizada:
       npm run build
       npm run preview
y abrir la dirección que muestra la terminal (por defecto
http://localhost:4173). Los archivos generados quedan en la carpeta dist,
que se puede publicar en cualquier servidor web de archivos estáticos.

------------------------------------------------------------------------------
5. PROBLEMAS FRECUENTES
------------------------------------------------------------------------------
- "npm no se reconoce como un comando": Node.js no está instalado o hay que
  cerrar y volver a abrir la terminal después de instalarlo.
- "Failed to resolve import" al iniciar: faltan dependencias; ejecutar de
  nuevo npm install dentro de la carpeta 07_FarmaUIS.
- El puerto 5173 está ocupado: Vite usa automáticamente el siguiente libre
  (5174, 5175...); abrir la dirección que indique la terminal.

------------------------------------------------------------------------------
6. NOTA SOBRE ESTA FASE
------------------------------------------------------------------------------
Como lo permite la Fase I, la aplicación no se conecta a una base de datos:
el usuario y la contraseña se validan en el código (src/api/demo.js) y los
productos están en src/data/productos.js. La conexión con el backend
(Express) y la base de datos (MySQL) queda para la siguiente fase.
