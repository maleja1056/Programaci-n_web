# Consultas de solo lectura a MySQL que usan los agentes. Todas usan
# parámetros (%s) para evitar inyección SQL y solo muestran productos activos,
# igual que GET /api/productos del backend.
import unicodedata

import pymysql

from .configuracion import MYSQL

# Palabras que no sirven para buscar productos
PALABRAS_VACIAS = {
    "tienen", "tiene", "hay", "venden", "vende", "busco", "quiero", "necesito",
    "precio", "precios", "cuanto", "cuesta", "vale", "valor", "stock", "de",
    "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "para", "por",
    "que", "me", "mi", "y", "o", "con", "sin", "en", "algun", "alguna", "es",
    "son", "hola", "buenas", "buenos", "dias", "tardes", "noches", "favor",
    "disponible", "disponibles", "producto", "productos", "comprar", "cual",
    "cuales", "como", "se", "lo", "le", "al", "a", "su", "sus", "ustedes",
}


def normalizar(texto: str) -> str:
    """Minúsculas y sin tildes: "Acetaminofén" -> "acetaminofen"."""
    sin_tildes = unicodedata.normalize("NFD", texto)
    sin_tildes = "".join(c for c in sin_tildes if unicodedata.category(c) != "Mn")
    return sin_tildes.lower()


def palabras_clave(texto: str) -> list[str]:
    palabras = "".join(c if c.isalnum() else " " for c in normalizar(texto)).split()
    return [p for p in palabras if len(p) > 2 and p not in PALABRAS_VACIAS]


def _conectar():
    return pymysql.connect(
        **MYSQL,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
    )


def _consultar(sql: str, params: tuple = ()) -> list[dict]:
    with _conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute(sql, params)
        return list(cursor.fetchall())


def _producto(fila: dict) -> dict:
    return {
        "id": fila["id"],
        "nombre": fila["nombre"],
        "categoria": fila["categoria"],
        "precio": float(fila["precio"]),
        "stock": int(fila["stock"]),
        "requiere_formula": bool(fila["requiere_formula"]),
    }


def categorias() -> list[str]:
    filas = _consultar("SELECT nombre FROM categorias ORDER BY nombre")
    return [f["nombre"] for f in filas]


def buscar_productos(texto: str, limite: int = 6) -> list[dict]:
    """Productos activos cuyo nombre, descripción o categoría contienen alguna
    palabra del mensaje. MySQL compara sin distinguir tildes (utf8mb4)."""
    palabras = palabras_clave(texto)[:5]
    if not palabras:
        return []
    condiciones = " OR ".join(
        ["(p.nombre LIKE %s OR p.descripcion LIKE %s OR c.nombre LIKE %s)"] * len(palabras)
    )
    params: list = []
    for p in palabras:
        params += [f"%{p}%"] * 3
    filas = _consultar(
        f"""SELECT p.id, p.nombre, c.nombre AS categoria, p.precio, p.stock,
                   p.requiere_formula
            FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
            WHERE p.activo = TRUE AND ({condiciones})
            ORDER BY p.nombre LIMIT %s""",
        tuple(params + [limite]),
    )
    return [_producto(f) for f in filas]


def pedidos_de_usuario(usuario_id: int, limite: int = 5) -> list[dict]:
    filas = _consultar(
        """SELECT p.id, p.estado, p.creado_en,
                  COALESCE(SUM(d.subtotal), 0) AS total,
                  COALESCE(SUM(d.cantidad), 0) AS unidades
           FROM pedidos p LEFT JOIN detalle_pedidos d ON d.pedido_id = p.id
           WHERE p.usuario_id = %s
           GROUP BY p.id ORDER BY p.creado_en DESC LIMIT %s""",
        (usuario_id, limite),
    )
    return [
        {
            "id": f["id"],
            "estado": f["estado"],
            "fecha": f["creado_en"].strftime("%Y-%m-%d"),
            "total": float(f["total"]),
            "unidades": int(f["unidades"]),
        }
        for f in filas
    ]
