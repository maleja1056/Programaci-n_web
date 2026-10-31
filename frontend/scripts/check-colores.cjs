// Revisión de colores del frontend (corrección de la Fase I: "mejorar el
// contraste en la barra de menús y en general").
// Uso: npm run check:colores   (también se ejecuta dentro de npm run lint)
//
// Comprueba dos cosas y termina con error si alguna falla:
//   1. Cada pareja texto/fondo de la paleta (src/styles/tokens.css) cumple el
//      contraste mínimo de WCAG AA: 4,5:1 para texto normal.
//   2. Ningún otro archivo CSS escribe el color del texto con un código suelto
//      (#hex, rgb() o hsl()): debe usar una variable de tokens.css, por
//      ejemplo color: var(--color-texto-suave).
// No necesita dependencias: solo Node.js.
const fs = require('fs');
const path = require('path');

const CARPETA_ESTILOS = path.resolve(__dirname, '../src/styles');
const ARCHIVO_TOKENS = path.join(CARPETA_ESTILOS, 'tokens.css');
const MINIMO_AA = 4.5;

// Fondos claros que usa el sitio (blanco, verdes, azules y naranjas pálidos
// de tarjetas, ilustraciones y avisos). Todo texto "sobre claro" se mide
// contra cada uno y cuenta el peor caso.
const FONDOS_CLAROS = [
  '#ffffff', '#fbfdfb', '#f0faf3', '#e8f5ec', '#e5f5e6', '#dff2e2',
  '#dcefe0', '#e6f7f0', '#e7f3e5', '#f1f3f1', '#eaf2ff', '#fff3e5',
  '#fff8e8', '#fff1ef',
];

// Parejas que se comprueban: [variable de texto, fondos]. Los fondos pueden
// ser variables (--color-...) o códigos #hex.
const PAREJAS = [
  ['--color-texto', FONDOS_CLAROS],
  ['--color-texto-suave', FONDOS_CLAROS],
  ['--color-marca', FONDOS_CLAROS],
  ['--color-info', FONDOS_CLAROS],
  ['--color-aviso', FONDOS_CLAROS],
  ['--color-peligro', FONDOS_CLAROS],
  ['--color-sobre-marca', ['--color-marca-fondo', '--color-marca-fondo-hover', '--color-oscuro-fondo', '--color-peligro', '#861d14']], // #861d14: botón rojo (hover) del panel
  ['--color-sobre-oscuro-suave', ['--color-marca-fondo', '--color-oscuro-fondo']],
];

// ---------- Cálculo de contraste (fórmula de WCAG 2.1) ----------
const aRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

const luminancia = (hex) => {
  const [r, g, b] = aRgb(hex).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a, b) => {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
};

// ---------- 1. Paleta ----------
const leerTokens = () => {
  const css = fs.readFileSync(ARCHIVO_TOKENS, 'utf8');
  const tokens = {};
  for (const m of css.matchAll(/(--color-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\b/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
};

function revisarPaleta(tokens) {
  const errores = [];
  const valor = (nombre) => {
    if (nombre.startsWith('#')) return nombre;
    if (!tokens[nombre]) throw new Error(`La variable ${nombre} no está en tokens.css`);
    return tokens[nombre];
  };

  for (const [texto, fondos] of PAREJAS) {
    let peor = { ratio: Infinity, fondo: '' };
    for (const fondo of fondos) {
      const ratio = contraste(valor(texto), valor(fondo));
      if (ratio < peor.ratio) peor = { ratio, fondo };
    }
    const ok = peor.ratio >= MINIMO_AA;
    console.log(
      `  ${ok ? '✓' : '✗'} ${texto.padEnd(28)} ${valor(texto)}  peor caso ${peor.ratio.toFixed(2)}:1 sobre ${peor.fondo}`
    );
    if (!ok) errores.push(`${texto} no llega a ${MINIMO_AA}:1 sobre ${peor.fondo}`);
  }
  return errores;
}

// ---------- 2. Colores de texto sueltos ----------
function revisarColoresSueltos() {
  const errores = [];
  // "color:" que no sea parte de background-color, border-color, etc.
  const regla = /(^|[^-\w])color\s*:\s*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/;

  for (const archivo of fs.readdirSync(CARPETA_ESTILOS)) {
    if (!archivo.endsWith('.css') || archivo === 'tokens.css') continue;
    const lineas = fs.readFileSync(path.join(CARPETA_ESTILOS, archivo), 'utf8').split('\n');
    lineas.forEach((linea, i) => {
      if (regla.test(linea)) {
        errores.push(`src/styles/${archivo}:${i + 1} usa un color suelto → ${linea.trim()}`);
      }
    });
  }
  return errores;
}

const tokens = leerTokens();
console.log('Contraste de la paleta (mínimo WCAG AA 4,5:1):');
const errores = [...revisarPaleta(tokens), ...revisarColoresSueltos()];

if (errores.length) {
  console.error(`\n${errores.length} problema(s) de color:`);
  for (const e of errores) console.error(`  - ${e}`);
  console.error('\nUsa las variables de src/styles/tokens.css para el color del texto.');
  process.exitCode = 1;
} else {
  console.log('\nColores correctos: todos los textos usan la paleta y cumplen AA.');
}
