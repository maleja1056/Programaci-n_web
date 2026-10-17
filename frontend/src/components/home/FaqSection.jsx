// Preguntas frecuentes (#preguntas) con el Accordion de React-Bootstrap:
// al abrir una pregunta se despliega su respuesta (efecto collapse).
// Las preguntas están en src/data/preguntas.js.
import Accordion from "react-bootstrap/Accordion";
import { preguntas } from "../../data/preguntas.js";

function FaqSection() {
  return (
    <section className="home-section faq-section" id="preguntas">
      <div className="section-heading">
        <div>
          <span className="section-kicker">PREGUNTAS FRECUENTES</span>
          <h2>Resolvemos tus dudas</h2>
          <p>Lo que más nos preguntan antes de comprar.</p>
        </div>
      </div>

      <Accordion className="faq-accordion" defaultActiveKey={preguntas[0].id}>
        {preguntas.map((item) => (
          <Accordion.Item eventKey={item.id} key={item.id}>
            <Accordion.Header as="h3">{item.pregunta}</Accordion.Header>
            <Accordion.Body>{item.respuesta}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}

export default FaqSection;
