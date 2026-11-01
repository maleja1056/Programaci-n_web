// Qué dibujo usa cada producto (ProductoIlustracion.jsx).
// Se elige por palabras del nombre; si ninguna coincide (por ejemplo, un
// producto nuevo creado desde el panel), se usa el dibujo de su categoría.

const POR_NOMBRE = [
  [/omega/, "perlas"],
  [/multivitam/, "multivitaminico"],
  [/curita/, "curita"],
  [/protector|bloqueador/, "protector"],
  [/alcohol/, "alcohol"],
  [/acetaminof|paracetamol|tableta|naproxeno|loratadina/, "blister"],
  [/amoxicil|capsula|omeprazol|antibiotico/, "capsulas"],
  [/ibuprofen|aspirina|jarabe/, "frasco"],
  [/losart|enalapril|metformina|caja/, "caja"],
  [/crema|locion|pomada|ungüento|protector/, "tubo"],
  [/gel|jabon|alcohol|shampoo|champu/, "dosificador"],
  [/gasa|venda|curita|esparadrapo|algodon/, "gasas"],
  [/termometro|tensiometro/, "termometro"],
  [/vitamina|suplemento|multivitam|omega|zinc|calcio/, "vitaminas"],
];

const POR_CATEGORIA = {
  medicamentos: "frasco",
  "cuidado personal": "tubo",
  "vitaminas y suplementos": "vitaminas",
  "primeros auxilios": "gasas",
};

// Minúsculas y sin tildes, como la búsqueda del catálogo
const normalizar = (texto = "") =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ilustracionDe(nombre, categoria) {
  const texto = normalizar(nombre);
  const encontrada = POR_NOMBRE.find(([patron]) => patron.test(texto));
  if (encontrada) return encontrada[1];
  return POR_CATEGORIA[normalizar(categoria)] || "frasco";
}
