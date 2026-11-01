-- Datos de ejemplo de FarmaUIS. Lo ejecuta "npm run init-db" (desde backend/)
-- después de schema.sql y de crear los usuarios de prueba (los usuarios se
-- crean desde el script porque sus contraseñas necesitan hash bcrypt).
-- Se puede ejecutar varias veces: INSERT IGNORE no duplica las filas que ya
-- existen (mismo id o mismo valor único).
SET NAMES utf8mb4;

USE farmauis;

-- Categorías del catálogo (las mismas del modo demostración del frontend)
INSERT IGNORE INTO categorias (id, nombre, descripcion) VALUES
  (1, 'Medicamentos', 'Medicamentos de venta libre y productos farmacéuticos'),
  (2, 'Cuidado personal', 'Productos para higiene y cuidado personal'),
  (3, 'Vitaminas y suplementos', 'Vitaminas y suplementos nutricionales'),
  (4, 'Primeros auxilios', 'Materiales e insumos para primeros auxilios');

-- Productos: el 7, el 8 y el 13 requieren fórmula médica y el 9 está agotado
INSERT IGNORE INTO productos
  (id, categoria_id, nombre, descripcion, precio, stock, requiere_formula)
VALUES
  (1, 1, 'Acetaminofén 500 mg', 'Analgésico y antipirético', 8500, 50, FALSE),
  (2, 1, 'Ibuprofeno 400 mg', 'Antiinflamatorio y analgésico', 12000, 35, FALSE),
  (3, 2, 'Gel antibacterial', 'Gel para higiene de manos', 7500, 40, FALSE),
  (4, 2, 'Crema humectante', 'Crema para hidratación de la piel', 18000, 20, FALSE),
  (5, 3, 'Vitamina C', 'Suplemento de vitamina C', 15000, 25, FALSE),
  (6, 4, 'Gasas estériles', 'Paquete de gasas para curaciones', 6000, 60, FALSE),
  (7, 1, 'Amoxicilina 500 mg', 'Antibiótico de amplio espectro', 16500, 30, TRUE),
  (8, 1, 'Losartán 50 mg', 'Antihipertensivo para el control de la presión arterial', 14000, 18, TRUE),
  (9, 4, 'Termómetro digital', 'Termómetro de lectura rápida con alarma de fiebre', 22000, 0, FALSE),
  (10, 1, 'Loratadina 10 mg', 'Antihistamínico para alergias y rinitis', 9000, 40, FALSE),
  (11, 1, 'Omeprazol 20 mg', 'Protector gástrico para la acidez', 11000, 30, FALSE),
  (12, 1, 'Jarabe para la tos', 'Jarabe expectorante con miel, frasco de 120 ml', 13500, 22, FALSE),
  (13, 1, 'Metformina 850 mg', 'Antidiabético para el control de la glucosa', 12500, 25, TRUE),
  (14, 2, 'Protector solar FPS 50', 'Protección solar diaria para piel expuesta al sol', 32000, 15, FALSE),
  (15, 2, 'Jabón antibacterial líquido', 'Jabón líquido para manos, frasco de 400 ml', 9500, 35, FALSE),
  (16, 3, 'Multivitamínico', 'Vitaminas y minerales para el día a día, 30 tabletas', 28000, 20, FALSE),
  (17, 3, 'Omega 3', 'Suplemento de aceite de pescado, 60 cápsulas blandas', 35000, 12, FALSE),
  (18, 4, 'Alcohol antiséptico', 'Alcohol al 70 % para desinfección, 350 ml', 6500, 45, FALSE),
  (19, 4, 'Curitas', 'Caja de 20 curitas de tela adhesivas', 4500, 70, FALSE),
  (20, 4, 'Venda elástica', 'Venda de 5 cm para sujeción y soporte', 7000, 30, FALSE);

-- Pedido de ejemplo del cliente de prueba (se busca por su correo para no
-- depender del id que le haya tocado al crearlo)
INSERT IGNORE INTO pedidos (id, usuario_id, estado, direccion_entrega)
SELECT 1, id, 'entregado', 'Calle 9 # 27-15, Bucaramanga'
FROM usuarios
WHERE correo = 'cliente@farmauis.local';

-- Líneas del pedido 1: el subtotal lo calcula MySQL (columna generada)
INSERT IGNORE INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
SELECT 1, p.id, d.cantidad, p.precio
FROM (
  SELECT 1 AS producto_id, 2 AS cantidad
  UNION ALL SELECT 3, 1
  UNION ALL SELECT 5, 1
) AS d
JOIN productos p ON p.id = d.producto_id
WHERE EXISTS (SELECT 1 FROM pedidos WHERE id = 1);
