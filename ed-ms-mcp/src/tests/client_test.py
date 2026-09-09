"""
Cliente de prueba para verificar el servidor MCP Streamable HTTP.
Lee la configuración automáticamente desde .env (o usa http://127.0.0.1:8000 por defecto).
"""

import asyncio
import json
import os
import sys

from dotenv import load_dotenv
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamable_http_client

# Cargar variables de entorno
load_dotenv()

DEFAULT_HOST = os.getenv("HOST", "127.0.0.1")
DEFAULT_PORT = os.getenv("PORT", "8000")
DEFAULT_URL = f"http://{DEFAULT_HOST}:{DEFAULT_PORT}"


async def run_client_tests(base_url: str = DEFAULT_URL) -> bool:
    """Ejecuta pruebas sobre las 2 herramientas del servidor MCP."""
    mcp_endpoint = f"{base_url.rstrip('/')}/mcp"
    print(f"\n🚀 Conectando al servidor MCP en {mcp_endpoint}...")

    try:
        async with streamable_http_client(mcp_endpoint) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                # 1. Inicialización de sesión
                print("🤝 Realizando handshake de inicialización...")
                init_result = await session.initialize()
                print(f"✅ Inicializado con éxito: Servidor={init_result.server_info.name} (v{init_result.server_info.version})")

                # 2. Listar herramientas
                print("\n📋 Listando herramientas disponibles en el servidor...")
                tools_response = await session.list_tools()
                print(f"📦 Total de herramientas encontradas: {len(tools_response.tools)}")
                for tool in tools_response.tools:
                    print(f"  - 🔧 {tool.name}: {tool.description}")

                print("\n🧪 Ejecutando pruebas sobre las herramientas...")

                # 3. Probar herramienta de listar asignaturas 
                print("\n1️⃣  Probando listar asignaturas")
                subject_res = await session.call_tool("listar_asignaturas", {})
                print("###############", subject_res)
                print(f"   Resultado: {subject_res}")

                # 4. Probar herramienta de listar cursos
                print("\n2️⃣  Probando listar cursos")
                courses_res = await session.call_tool("listar_cursos", {})
                print(f"   Resultado: {courses_res}")


                print("\n🎉 ¡Todas las pruebas finalizaron con éxito!")
                return True

    except Exception as exc:
        print(f"\n❌ Error durante la ejecución de las pruebas: {exc}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False


def main() -> None:
    server_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    success = asyncio.run(run_client_tests(server_url))
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
