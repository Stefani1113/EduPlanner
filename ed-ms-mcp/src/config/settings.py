import os

from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Settings: 
    # Configuración leída desde variables de entorno (.env)
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "8000"))
    TRANSPORT = os.getenv("TRANSPORT", "sse").lower().strip()

    # Variable de entorno de EduPlanner
    EDUPLANNER_BASE_URL = os.getenv("EDUPLANNER_BASE_URL")
    EDUPLANNER_LOGIN_URL = os.getenv("EDUPLANNER_LOGIN_URL")
    EDUPLANNER_REFRESH_URL = os.getenv("EDUPLANNER_REFRESH_URL")
    EDUPLANNER_ADMIN_USER = os.getenv("EDUPLANNER_ADMIN_USER")
    EDUPLANNER_ADMIN_PASSWORD = os.getenv("EDUPLANNER_ADMIN_PASSWORD")

settings = Settings()