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

// Cápsula blanda (perla) de Omega 3
function Perla({ x, y, giro, escala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
      <ellipse rx="22" ry="13" fill={BLANCO} {...trazo} />
      <ellipse rx="22" ry="13" fill="currentColor" opacity="0.3" />
      <ellipse cx="-8" cy="-5" rx="7" ry="2.6" fill={BLANCO} opacity="0.85" />
    </g>
  );
}

function Perlas() {
  return (
    <>
      <Perla x={86} y={46} giro={-8} escala={0.82} />
      <Perla x={60} y={78} giro={-22} />
      <Perla x={106} y={78} giro={16} escala={0.92} />
    </>
  );
}

// Frasco de multivitamínico: tabletas de varias formas en la etiqueta
function Multivitaminico() {
  return (
    <>
      <rect x="48" y="46" width="62" height="56" rx="13" fill={BLANCO} {...trazo} />
      <rect x="52" y="30" width="54" height="18" rx="5" fill="currentColor" />
      <path d="M58 38h42" stroke={BLANCO} strokeWidth="1.6" opacity="0.4" />
      <rect x="58" y="60" width="42" height="28" rx="6" fill="currentColor" opacity="0.14" />
      <circle cx="68" cy="74" r="5" fill="currentColor" opacity="0.7" />
      <rect x="75" y="69" width="9" height="10" rx="2" fill="currentColor" opacity="0.45" />
      <ellipse cx="92" cy="74" rx="5.5" ry="3.5" fill="currentColor" opacity="0.85" />
      <Reflejo x="53" y="52" width="3" height="36" />
      <g transform="translate(126 92) rotate(-20)">
        <ellipse rx="10" ry="6" fill={BLANCO} {...trazo} />
        <path d="M-6 0h12" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      </g>
    </>
  );
}

// Curita: tira adhesiva con almohadilla en el centro
function Curita() {
  const puntos = [];
  for (const x of [36, 46, 112, 122]) for (const y of [-5, 5]) puntos.push([x, y]);
  return (
    <g transform="rotate(-18 80 66)">
      <rect x="26" y="52" width="108" height="30" rx="15" fill={BLANCO} {...trazo} />
      <rect x="26" y="52" width="108" height="30" rx="15" fill="currentColor" opacity="0.18" />
      <rect x="62" y="55" width="36" height="24" rx="5" fill={BLANCO} {...trazo} />
      <path d="M68 62h24M68 67h24M68 72h24" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {puntos.map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={67 + y} r="1.4" fill="currentColor" opacity="0.6" />
      ))}
    </g>
  );
}

// Protector solar: frasco con tapa y un sol en la etiqueta
function Protector() {
  const rayos = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    rayos.push(`M${80 + Math.cos(a) * 11} ${70 + Math.sin(a) * 11}L${80 + Math.cos(a) * 16} ${70 + Math.sin(a) * 16}`);
  }
  return (
    <>
      <rect x="66" y="20" width="28" height="16" rx="4" fill="currentColor" />
      <rect x="58" y="34" width="44" height="70" rx="12" fill={BLANCO} {...trazo} />
      <circle cx="80" cy="70" r="7" fill="currentColor" opacity="0.75" />
      <path d={rayos.join("")} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M68 92h24" stroke="currentColor" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <Reflejo x="63" y="42" width="3" height="50" />
    </>
  );
}

// Botella de alcohol antiséptico: cuello angosto y etiqueta con una cruz
function Alcohol() {
  return (
    <>
      <rect x="71" y="18" width="18" height="12" rx="3" fill="currentColor" />
      <path
        d="M73 30h14v10c0 4 15 8 15 18v38a8 8 0 0 1-8 8H66a8 8 0 0 1-8-8V58c0-10 15-14 15-18z"
        fill={BLANCO}
        {...trazo}
      />
      <rect x="62" y="64" width="36" height="28" rx="4" fill="currentColor" opacity="0.16" />
      <path d="M80 70v16M72 78h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <Reflejo x="63" y="60" width="3" height="34" />
    </>
  );
}

// Rollo de venda con la punta desenrollada
function Venda() {
  return (
    <>
      <path
        d="M94 66c16 2 24 14 42 20l-4 12c-18-6-26-18-38-20z"
        fill={BLANCO}
        {...trazo}
      />
      <path d="M100 72l30 18" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <ellipse cx="70" cy="96" rx="26" ry="8" fill={BLANCO} {...trazo} />
      <rect x="44" y="38" width="52" height="58" fill={BLANCO} />
      <path d="M44 38v58M96 38v58" {...trazo} />
      <rect x="44" y="38" width="52" height="58" fill="currentColor" opacity="0.16" />
      <path d="M46 54h48M46 68h48M46 82h48" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <ellipse cx="70" cy="38" rx="26" ry="8" fill={BLANCO} {...trazo} />
      <ellipse cx="70" cy="38" rx="9" ry="3" fill="currentColor" opacity="0.35" />
    </>
  );
}

// Jarabe: frasco con vasito dosificador de tapa y una cuchara
function Jarabe() {
  return (
    <>
      <rect x="56" y="46" width="48" height="58" rx="10" fill={BLANCO} {...trazo} />
      <rect x="70" y="34" width="20" height="14" fill={BLANCO} {...trazo} />
      <path d="M64 35h32l-4-17H68z" fill="currentColor" />
      <path d="M70 26h20" stroke={BLANCO} strokeWidth="1.4" opacity="0.5" />
      <rect x="62" y="60" width="36" height="30" rx="5" fill="currentColor" opacity="0.16" />
      <path d="M80 64c5 7 7 10 7 13a7 7 0 0 1-14 0c0-3 2-6 7-13z" fill="currentColor" opacity="0.75" />
      <Reflejo x="60" y="52" width="3" height="40" />
      <path d="M116 95l-14-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="127" cy="97" rx="11" ry="5" fill={BLANCO} {...trazo} />
    </>
  );
}

// Tabletas redondas sueltas, con su ranura para partirlas
function Tableta({ x, y, r = 14 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="4" rx={r} ry={r * 0.9} fill="currentColor" opacity="0.35" />
      <circle r={r} fill={BLANCO} {...trazo} />
      <circle r={r - 4} fill="currentColor" opacity="0.14" />
      <path d={`M${-r + 5} 0h${2 * r - 10}`} stroke="currentColor" strokeWidth="1.6" />
    </g>
  );
}

function Tabletas() {
  return (
    <>
      <Tableta x={78} y={54} r={13} />
      <Tableta x={56} y={84} />
      <Tableta x={92} y={86} r={15} />
      <Tableta x={122} y={72} r={12} />
    </>
  );
}

// Cápsula abierta con los gránulos que lleva adentro
function Granulos() {
  const granulos = [
    [72, 88], [80, 94], [88, 86], [96, 93], [104, 87], [84, 79], [92, 99], [76, 99], [100, 78],
  ];
  return (
    <>
      <g transform="translate(54 58) rotate(-24)">
        <path d="M6-12h-22a12 12 0 0 0 0 24H6z" fill="currentColor" />
        <path d="M6-12v24" {...trazo} />
      </g>
      <g transform="translate(112 50) rotate(22)">
        <path d="M-6-12h22a12 12 0 0 1 0 24H-6z" fill={BLANCO} {...trazo} />
      </g>
      {granulos.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="3.4"
          fill={i % 2 ? BLANCO : "currentColor"}
          stroke="currentColor"
          strokeWidth="1.2"
          opacity={i % 2 ? 1 : 0.7}
        />
      ))}
    </>
  );
}

// Pastillero semanal (para tratamientos de todos los días)
function Pastillero() {
  const casillas = [0, 1, 2, 3, 4, 5, 6];
  return (
    <>
      <rect x="22" y="58" width="116" height="36" rx="8" fill={BLANCO} {...trazo} />
      {casillas.map((i) => (
        <g key={i}>
          {i > 0 && <path d={`M${22 + i * 16.6} 60v32`} stroke="currentColor" strokeWidth="1.2" opacity="0.35" />}
          {i % 2 === 0 ? (
            <circle cx={30.3 + i * 16.6} cy="78" r="4.2" fill="currentColor" opacity="0.75" />
          ) : (
            <rect
              x={24 + i * 16.6}
              y="44"
              width="12.6"
              height="14"
              rx="3"
              fill="currentColor"
              opacity="0.45"
            />
          )}
        </g>
      ))}
    </>
  );
}

// Barra de jabón con burbujas
function Jabon() {
  return (
    <>
      <g transform="rotate(-8 80 78)">
        <rect x="38" y="60" width="84" height="38" rx="15" fill={BLANCO} {...trazo} />
        <rect x="46" y="66" width="68" height="22" rx="10" fill="currentColor" opacity="0.16" />
        <Reflejo x="52" y="70" width="26" height="3" />
      </g>
      <circle cx="112" cy="46" r="9" fill={BLANCO} {...trazo} />
      <circle cx="129" cy="31" r="5.5" fill={BLANCO} {...trazo} />
      <circle cx="94" cy="38" r="4.5" fill={BLANCO} {...trazo} />
      <circle cx="109" cy="43" r="2.4" fill={BLANCO} opacity="0.9" />
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
  perlas: Perlas,
  multivitaminico: Multivitaminico,
  curita: Curita,
  protector: Protector,
  alcohol: Alcohol,
  venda: Venda,
  jarabe: Jarabe,
  tabletas: Tabletas,
  granulos: Granulos,
  pastillero: Pastillero,
  jabon: Jabon,
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
