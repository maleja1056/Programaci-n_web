# Lee el .env de la raíz del proyecto (el mismo que usa el backend Express):
# datos de MySQL (XAMPP) y la API key de Google Gemini.
import os
from pathlib import Path

from dotenv import load_dotenv

RAIZ = Path(__file__).resolve().parents[2]
load_dotenv(RAIZ / ".env")

MYSQL = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "un_usr"),
    "password": os.getenv("MYSQL_PASSWORD", "una_clave"),
    "database": os.getenv("MYSQL_DATABASE", "farmauis"),
}

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
