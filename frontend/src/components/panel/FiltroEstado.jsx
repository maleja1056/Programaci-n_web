// Selector "Filtrar por estado" de la tabla de pedidos (pestaña Pedidos del
// panel y página Mis pedidos).
import Form from "react-bootstrap/Form";
import { ESTADOS_PEDIDO } from "../../utils/pedidos.js";

function FiltroEstado({ valor, alCambiar }) {
  return (
    <Form.Select
      aria-label="Filtrar por estado"
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
    >
      <option value="">Todos los estados</option>
      {ESTADOS_PEDIDO.map(({ valor: estado, texto }) => (
        <option key={estado} value={estado}>
          {texto}
        </option>
      ))}
    </Form.Select>
  );
}

export default FiltroEstado;
