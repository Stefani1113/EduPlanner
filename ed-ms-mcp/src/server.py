"""
EduPlanner MCP Server

Servidor MCP en Python con transporte HTTP (SSE) que interactua con los serviceios de EduPlanner y proporciona herramientas al agente de IA.
"""

import sys
from mcp.server import MCPServer

from auth.jwt_manager import JWTManager
from config.settings import settings
from resources.status import create_status_resource
from services.eduplanner_client import EduPlannerClient
from tools.academic_loads import create_academic_load_tool
from tools.courses import create_course_tool
from tools.subjects import create_subject_tool

def create_server() -> MCPServer:
    """Crea y configura el servidor MCP para consultar datos desde el microservicio de gestión académica de EduPlanner."""
    server = MCPServer(
        name="EduPlannerMCP",
        version="1.0.0",
        description="Servidor MCP para consultar información académica de el software EduPlanner",
        instructions="Este servidor proporciona herramientas para interactuar con la información académica de EduPlanner.",
    )

    # Autenticacion
    jwt_manager = JWTManager(settings)

    # Api cliente EduPlanner
    client = EduPlannerClient(
        settings,
        jwt_manager,
    )

    # Crear Tools
    create_subject_tool(
        server, 
        client,
    )

    create_course_tool(
        server,
        client,
    )

    create_academic_load_tool(
        server,
        client,
    )

    # Crear resources
    create_status_resource(
        server,
        settings,
    )

    return server


def main() -> None:
    """Punto de entrada principal para ejecutar el servidor MCP."""
    server = create_server()
    print(f"🚀 Iniciando servidor MCP '{server.name}' v{server.version} en http://{settings.HOST}:{settings.PORT} (transporte: {settings.TRANSPORT})...")

    if settings.TRANSPORT == "sse":
        server.run(transport="sse", host=settings.HOST, port=settings.PORT)
    elif settings.TRANSPORT == "streamable-http":
        server.run(transport="streamable-http", host=settings.HOST, port=settings.PORT)
    elif settings.TRANSPORT == "stdio":
        server.run(transport="stdio")
    else:
        print(f"❌ Transporte '{settings.TRANSPORT}' no válido. Opciones: sse, streamable-http, stdio")
        sys.exit(1)


if __name__ == "__main__":
    main()
