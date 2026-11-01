// Ilustración de un producto del catálogo (tarjeta y modal de detalle).
// Son dibujos SVG propios, uno por tipo de producto: blíster, cápsulas,
// frasco, caja, tubo, dosificador, gasas, termómetro y vitaminas. El dibujo
// se elige en utils/ilustraciones.js.
// - El color de acento es currentColor: lo pone la clase art-<color> del
//   contenedor (azul, menta, naranja o verde según la categoría), y en los
//   productos agotados pasa a gris.
// - Todos comparten la misma luz (reflejo arriba a la izquierda) y una
//   sombra en el "piso" (.ilu-sombra). Al pasar el mouse sobre la tarjeta,
//   el objeto (.ilu-objeto) se eleva y la sombra se encoge (app.css).
const BLANCO = "#ffffff";

const trazo = { stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" };

// Reflejo de luz: franja blanca semitransparente
const Reflejo = (props) => <rect fill={BLANCO} opacity="0.65" rx="1.5" {...props} />;

function Blister() {
  const pastillas = [56, 80, 104].flatMap((x) => [48, 70].map((y) => [x, y]));
  return (
    <g transform="rotate(-8 80 60)">
      <rect x="34" y="28" width="92" height="62" rx="10" fill={BLANCO} {...trazo} />
      <rect x="34" y="28" width="92" height="62" rx="10" fill="currentColor" opacity="0.07" />
      {pastillas.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="9.5" fill="currentColor" opacity="0.16" />
          <circle cx={x} cy={y} r="7" fill={BLANCO} stroke="currentColor" strokeWidth="1.6" />
          <path d={`M${x - 4} ${y}h8`} stroke="currentColor" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
        </g>
      ))}
      <Reflejo x="40" y="33" width="26" height="3" />
    </g>
  );
}

function Capsula({ x, y, giro, escala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
      <rect x="-27" y="-10" width="54" height="20" rx="10" fill={BLANCO} {...trazo} />
      <path d="M0 -10H-17a10 10 0 0 0 0 20H0Z" fill="currentColor" />
      <path d="M0 -10v20" stroke="currentColor" strokeWidth="2" />
      <Reflejo x="-21" y="-6" width="13" height="3" />
    </g>
  );
}

function Capsulas() {
  return (
    <>
      <Capsula x={70} y={68} giro={-28} />
      <Capsula x={108} y={76} giro={18} escala={0.85} />
      <Capsula x={96} y={40} giro={62} escala={0.75} />
      <circle cx="46" cy="90" r="7" fill={BLANCO} {...trazo} />
      <path d="M42 90h8" stroke="currentColor" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
    </>
  );
}

function Frasco() {
  return (
    <>
      <rect x="56" y="44" width="48" height="58" rx="9" fill={BLANCO} {...trazo} />
      <rect x="52" y="28" width="56" height="18" rx="4" fill="currentColor" />
      {[60, 68, 76, 84, 92, 100].map((x) => (
        <path key={x} d={`M${x} 31v12`} stroke={BLANCO} strokeWidth="1.6" opacity="0.35" />
      ))}
      <rect x="56" y="58" width="48" height="28" fill="currentColor" opacity="0.15" />
      <path d="M74 72h12M80 66v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <Reflejo x="61" y="48" width="3" height="40" />
      <ellipse cx="118" cy="98" rx="8" ry="5" fill={BLANCO} {...trazo} />
      <ellipse cx="132" cy="94" rx="8" ry="5" fill={BLANCO} {...trazo} />
    </>
  );
}

function Caja() {
  return (
    <>
      <path d="M44 50 66 40l52 8-22 10Z" fill={BLANCO} {...trazo} />
      <path d="M44 50 66 40l52 8-22 10Z" fill="currentColor" opacity="0.08" />
      <path d="M96 58l22-10v42l-22 10Z" fill={BLANCO} {...trazo} />
      <path d="M96 58l22-10v42l-22 10Z" fill="currentColor" opacity="0.22" />
      <path d="M44 50l52 8v42l-52-8Z" fill={BLANCO} {...trazo} />
      <path d="M44 66l52 8v9l-52-8Z" fill="currentColor" opacity="0.8" />
      <path d="M58 54.5l14 2.1M58 59l24 3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M84 86.5v8M80 90.2l8 1.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function Tubo() {
  return (
    <g transform="rotate(-16 80 64)">
      <path d="M36 46H106L116 54V70L106 78H36Z" fill={BLANCO} {...trazo} />
      <rect x="26" y="43" width="12" height="38" rx="2" fill={BLANCO} {...trazo} />
      <rect x="26" y="43" width="12" height="38" rx="2" fill="currentColor" opacity="0.25" />
      <path d="M30 48v28M34 48v28" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <rect x="116" y="54" width="18" height="16" rx="3" fill="currentColor" />
      <rect x="52" y="53" width="44" height="18" rx="5" fill="currentColor" opacity="0.15" />
      <path d="M60 62h28" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <Reflejo x="42" y="50" width="56" height="3" />
    </g>
  );
}

function Dosificador() {
  return (
    <>
      <path d="M90 33h18v6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="68" y="28" width="26" height="9" rx="3" fill="currentColor" />
      <rect x="76" y="37" width="10" height="9" fill={BLANCO} {...trazo} />
      <rect x="56" y="46" width="50" height="56" rx="12" fill={BLANCO} {...trazo} />
      <path d="M57 74h48v16a11 11 0 0 1-11 11H68a11 11 0 0 1-11-11Z" fill="currentColor" opacity="0.18" />
      <rect x="64" y="58" width="34" height="12" rx="4" fill="currentColor" opacity="0.15" />
      <circle cx="74" cy="86" r="3" fill={BLANCO} opacity="0.9" />
      <circle cx="88" cy="92" r="2" fill={BLANCO} opacity="0.9" />
      <Reflejo x="61" y="52" width="3" height="34" />
      <circle cx="122" cy="58" r="6" fill={BLANCO} {...trazo} opacity="0.9" />
      <circle cx="132" cy="44" r="3.5" fill={BLANCO} {...trazo} opacity="0.9" />
    </>
  );
}

function Gasas() {
  const lineas = [];
  for (let x = 52; x <= 100; x += 8) lineas.push(`M${x} 50v38`);
  for (let y = 56; y <= 84; y += 7) lineas.push(`M46 ${y}h60`);
  return (
    <>
      <g transform="rotate(-6 80 66)">
        <rect x="52" y="36" width="64" height="48" rx="6" fill={BLANCO} {...trazo} opacity="0.85" />
        <rect x="42" y="46" width="68" height="46" rx="6" fill={BLANCO} {...trazo} />
        <path d={lineas.join("")} stroke="currentColor" strokeWidth="1" opacity="0.22" />
      </g>
      <g transform="rotate(28 112 46)">
        <rect x="86" y="38" width="52" height="16" rx="8" fill={BLANCO} {...trazo} />
        <rect x="104" y="38" width="16" height="16" fill="currentColor" opacity="0.3" />
        <circle cx="94" cy="46" r="1.2" fill="currentColor" />
        <circle cx="130" cy="46" r="1.2" fill="currentColor" />
      </g>
    </>
  );
}

function Termometro() {
  return (
    <g transform="rotate(-24 80 62)">
      <rect x="120" y="58" width="24" height="9" rx="4.5" fill="currentColor" opacity="0.45" />
      <rect x="30" y="52" width="94" height="21" rx="10.5" fill={BLANCO} {...trazo} />
      <rect x="46" y="56.5" width="40" height="12" rx="3" fill="currentColor" opacity="0.16" />
      <path d="M52 62.5h6M62 62.5h6M72 62.5h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="102" cy="62.5" r="5" fill="currentColor" />
      <Reflejo x="38" y="54.5" width="40" height="2.6" />
    </g>
  );
}

function Vitaminas() {
  return (
    <>
      <rect x="48" y="46" width="62" height="56" rx="13" fill={BLANCO} {...trazo} />
      <rect x="52" y="30" width="54" height="18" rx="5" fill="currentColor" />
      <path d="M58 38h42" stroke={BLANCO} strokeWidth="1.6" opacity="0.4" />
      <circle cx="79" cy="74" r="16" fill="currentColor" opacity="0.16" />
      <path d="M85.5 67.5a9 9 0 1 0 0 13" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <Reflejo x="53" y="52" width="3" height="36" />
      <g transform="translate(124 90)">
        <circle r="13" fill={BLANCO} {...trazo} />
        <circle r="9.5" fill="currentColor" opacity="0.28" />
        <path d="M0-9.5V9.5M-9.5 0H9.5M-6.7-6.7l13.4 13.4M6.7-6.7-6.7 6.7" stroke={BLANCO} strokeWidth="1.4" />
      </g>
    </>
  );
}

const DIBUJOS = {
  blister: Blister,
  capsulas: Capsulas,
  frasco: Frasco,
  caja: Caja,
  tubo: Tubo,
  dosificador: Dosificador,
  gasas: Gasas,
  termometro: Termometro,
  vitaminas: Vitaminas,
};

function ProductoIlustracion({ tipo, className = "" }) {
  const Dibujo = DIBUJOS[tipo] || Frasco;
  return (
    <svg
      className={`producto-ilustracion ${className}`.trim()}
      viewBox="0 0 160 120"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="ilu-sombra" cx="82" cy="105" rx="42" ry="5" fill="currentColor" />
      <g className="ilu-objeto">
        <Dibujo />
      </g>
    </svg>
  );
}

export default ProductoIlustracion;
