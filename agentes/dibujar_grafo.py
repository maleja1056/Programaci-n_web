# Imprime el grafo de agentes en formato Mermaid (se puede pegar en el README
# o en https://mermaid.live para verlo como dibujo).
#   Uso (desde agentes/):  .venv/bin/python dibujar_grafo.py
from farmabot.grafo import grafo

print(grafo.get_graph().draw_mermaid())
