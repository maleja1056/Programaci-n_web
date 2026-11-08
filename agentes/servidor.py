# Servidor HTTP del chatbot: el backend Express (routes/chat.js) le envía cada
# mensaje a POST /chat y recibe la respuesta junto con los agentes que la
# prepararon.
#   Iniciar:  .venv/bin/uvicorn servidor:app --port 8123   (desde agentes/)
import logging

from fastapi import FastAPI
from pydantic import BaseModel, Field

from farmabot.grafo import grafo

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Agentes del chatbot de FarmaUIS")


class Turno(BaseModel):
    rol: str
    texto: str = Field(max_length=1000)


class Peticion(BaseModel):
    mensaje: str = Field(min_length=1, max_length=500)
    historial: list[Turno] = Field(default_factory=list, max_length=10)
    usuario_id: int | None = None


@app.get("/salud")
def salud():
    return {"estado": "correcto"}


@app.post("/chat")
def chat(peticion: Peticion):
    resultado = grafo.invoke(
        {
            "mensaje": peticion.mensaje.strip(),
            "historial": [t.model_dump() for t in peticion.historial],
            "usuario_id": peticion.usuario_id,
            "recorrido": [],
        }
    )
    return {
        "respuesta": resultado["respuesta"],
        "fuente": resultado["fuente"],
        "agentes": resultado["recorrido"],
        "productos": resultado.get("productos", []),
    }
