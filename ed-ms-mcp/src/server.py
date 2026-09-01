"""
Servidor MCP en Python con transporte HTTP (SSE) desde el micorservicio de gestión académica.
La lógica de las herramientas y la configuración residen directamente en este archivo.
"""

import json
import os
import sys
import time
import requests

from typing import Any

from dotenv import load_dotenv
from mcp.server import MCPServer
from starlette.requests import Request
from starlette.responses import JSONResponse

# Cargar variables de entorno desde .env
load_dotenv()

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

TOKEN_DURATION = 600 # 10 min
SAFETY_MARGIN = 30 #Renovar el token cada 30sg

_current_token : str | None = None
_token_expiration : float = 0


# Función de login 

def login() -> str :
    """Login completo con usuario y contraseña."""
    print ("Haciendo Login.....")
    response = requests.post(
        EDUPLANNER_LOGIN_URL,
        json={
            "email" : EDUPLANNER_ADMIN_USER,
            "password" : EDUPLANNER_ADMIN_PASSWORD,
        },
    )

    response.raise_for_status()
    return response.json()["data"]["token"]

# Función para refrescar JWT

def refresh(current_token: str) -> str :
    """Renueva el token mandando el actual"""
    print("Renovando Token.....")
    headers = {"Authorization" : f"Bearer {current_token}"}
    response = requests.get(EDUPLANNER_REFRESH_URL, headers= headers)
    response.raise_for_status()
    return response.json()["token"]

# Función para obtener token 

def valid_token() -> str :
    """Devuelve un token válido: Reutiliza el actual o lo renueva"""
    global _current_token, _token_expiration

    now = time.time()

    # Primera vez haciendo login
    if _current_token is None :
        _current_token = login()
        _token_expiration = now + TOKEN_DURATION
        return _current_token

    # Renovación de token antes de que expire
    if now >= (_token_expiration - SAFETY_MARGIN) :
        try :
            _current_token = refresh(_current_token)
            _token_expiration = now + TOKEN_DURATION
        except requests.exceptions.RequestException : 
            print("El refresh falló")
            _current_token = login()
            _token_expiration = now + TOKEN_DURATION

    return _current_token
    

def create_server() -> MCPServer:
    """Crea y configura el servidor MCP para consultar datos desde el microservicio de gestión académica de EduPlanner."""
    server = MCPServer(
        name="MathToolsServer",
        version="1.0.0",
        description="Servidor MCP con consultas desde 2 endpoints (http://localhost:8080/eduplanner/subjects , http://localhost:8080/eduplanner/courses)",
        instructions="Este servidor provee herramientas para listar asignaturas y cursos.",
    )

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Asignaturas
    # -------------------------------------------------------------
    @server.tool(
        name="listar_asignaturas",
        description="Por medio del endpoint http://localhost:8080/eduplanner/subjects consultar y devolver la lista de todas las asignaturas registradas",
    )
    def listar_asignaturas() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar asignaturas")
        try :
            token = valid_token() 
            headers = {"Authorization" : f"Bearer {token}"}
            response = requests.get(f"{EDUPLANNER_BASE_URL}/subjects", headers=headers)
            response.raise_for_status()
            return {"success" : True, "asignaturas" : response.json() }
        except requests.exceptions.RequestException as exc : 
            return {"success" : False, "error": f"Error consultando asignaturas: {str(exc)}"}
        

    # -------------------------------------------------------------
    # 2. HERRAMIENTA: Listar Cursos
    # -------------------------------------------------------------
    @server.tool(
        name="listar_cursos",
        description="Por medio del endpoint http://localhost:8080/eduplanner/courses consultar y devolver la lista de todas los cursos registrados",
    )
    def listar_cursos() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar cursos")
        try : 
            token = valid_token()
            headers = {"Authorization" : f"Bearer {token}"}
            response = requests.get(f"{EDUPLANNER_BASE_URL}/courses", headers=headers)
            response.raise_for_status()
            return {"success" : True, "cursos" : response.json() }
        except requests.exceptions.RequestException as exc : 
            return {"success" : False, "error" : f"Error consultando cursos: {str(exc)}"}


    # -------------------------------------------------------------
    # 3. HERRAMIENTA: Listar Cargas académicas
    # -------------------------------------------------------------
    @server.tool(
        name="listar_carga_academica",
        description="Por medio del endpoint http://localhost:8080/eduplanner/academic-loads consultar y devolver la lista de todas las cargas academicas registradas",
    )
    def listar_cursos() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar carga académica")
        try : 
            token = valid_token()
            headers = {"Authorization" : f"Bearer {token}"}
            response = requests.get(f"{EDUPLANNER_BASE_URL}/courses", headers=headers)
            response.raise_for_status()
            return {"success" : True, "cargas" : response.json() }
        except requests.exceptions.RequestException as exc : 
            return {"success" : False, "error" : f"Error consultando cargas academicas: {str(exc)}"}

    # -------------------------------------------------------------
    # 4. HERRAMIENTA: Listar Cargas académicas
    # -------------------------------------------------------------

    # -------------------------------------------------------------
    # RECURSO DE ESTADO (MCP Resource)
    # -------------------------------------------------------------
    @server.resource(
        "system://status",
        name="server_status",
        description="Estado y herramientas disponibles en el servidor MCP",
        mime_type="application/json",
    )
    def server_status() -> str:
        """Retorna un recurso JSON informativo."""
        return json.dumps(
            {
                "status": "healthy",
                "server": "MathToolsServer",
                "version": "1.0.0",
                "transport": TRANSPORT,
                "tools": ["listar_asignaturas", "listar_cursos"],
            },
            indent = 2,
        )

    return server


def main() -> None:
    """Punto de entrada principal para ejecutar el servidor MCP."""
    server = create_server()
    print(f"🚀 Iniciando servidor MCP '{server.name}' v{server.version} en http://{HOST}:{PORT} (transporte: {TRANSPORT})...")

    if TRANSPORT == "sse":
        server.run(transport="sse", host=HOST, port=PORT)
    elif TRANSPORT == "streamable-http":
        server.run(transport="streamable-http", host=HOST, port=PORT)
    elif TRANSPORT == "stdio":
        server.run(transport="stdio")
    else:
        print(f"❌ Transporte '{TRANSPORT}' no válido. Opciones: sse, streamable-http, stdio")
        sys.exit(1)


if __name__ == "__main__":
    main()
