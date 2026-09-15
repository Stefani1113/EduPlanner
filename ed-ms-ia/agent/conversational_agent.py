import os

from dotenv import load_dotenv
from crewai import Agent, Task, LLM
from crewai.mcp import MCPServerHTTP
from crewai.mcp.filters import create_static_tool_filter


# ============================================================
# CARGAR VARIABLES DE ENTORNO
# ============================================================

env_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    ".env"
)

load_dotenv(
    dotenv_path=os.path.abspath(env_path)
)


# ============================================================
# FILTRO DE HERRAMIENTAS MCP
# ============================================================

tool_filter = create_static_tool_filter(
    allowed_tool_names=[
        "generate_schedule"
    ]
)


# ============================================================
# CONEXIÓN CON EL MCP
# ============================================================

mcp_server = MCPServerHTTP(
    url=os.getenv(
        "MCP_SERVER_URL",
        "http://127.0.0.1:8000/mcp"
    ),
    tool_filter=tool_filter
)


# ============================================================
# MODELO DE IA
# ============================================================

llm = LLM(
    model=os.getenv(
        "LLM_MODEL",
        "gemini-3.5-flash-lite"
    ),
    api_key=os.getenv("GEMINI_API_KEY")
)

print("================================")
print("CONFIGURACIÓN GEMINI")
print("PROVIDER:", os.getenv("LLM_PROVIDER"))
print("MODEL:", os.getenv("LLM_MODEL"))
print("================================")


# ============================================================
# AGENTE
# ============================================================

agent = Agent(
    role="Asistente de planificación académica de EduPlanner",

    goal=(
        "Ayudar a generar horarios académicos utilizando "
        "la herramienta de generación de horarios de EduPlanner."
    ),

    backstory=(
        "Eres el asistente inteligente de EduPlanner. "
        "Cuando el usuario solicita generar un horario, "
        "utilizas la herramienta correspondiente del MCP."
    ),

    mcps=[mcp_server],

    tools=[],

    llm=llm,

    verbose=True
)


# ============================================================
# CARGAR HERRAMIENTAS MCP
# ============================================================

print("\n🔎 Cargando herramientas MCP filtradas...")

try:

    mcp_tools = agent.get_mcp_tools(agent.mcps)

    print(
        f"\n✅ Cantidad de herramientas encontradas: "
        f"{len(mcp_tools)}"
    )

    for tool in mcp_tools:

        print(f"\n🔧 ANTES:")
        print(f"   name: {tool.name}")
        print(f"   original: {tool.original_tool_name}")

        # Cambiamos el nombre para que OpenAI lo acepte
        tool.name = tool.original_tool_name

        print(f"\n🔧 DESPUÉS:")
        print(f"   name: {tool.name}")
        print(f"   original: {tool.original_tool_name}")

    # Agregamos las herramientas al agente
    agent.tools.extend(mcp_tools)

    print("\n✅ Herramientas MCP agregadas al agente.")

except Exception as e:

    print("\n❌ Error cargando herramientas MCP:")
    print(e)


def process_message(user_input: str) -> str:

    task = Task(
        description=(
            f"El usuario realizó la siguiente solicitud:\n\n"
            f"{user_input}\n\n"
            "Analiza la solicitud. "
            "Si el usuario solicita generar un horario académico, "
            "debes utilizar la herramienta generate_schedule "
            "disponible mediante el MCP de EduPlanner. "
            "Después de ejecutar la herramienta, explica claramente "
            "el resultado al usuario."
        ),

        expected_output=(
            "Una respuesta clara en español indicando el resultado "
            "de la solicitud. Si se generó un horario, indica que "
            "fue generado correctamente y proporciona la información "
            "disponible sobre la generación."
        ),

        agent=agent
    )

    result = agent.execute_task(task)

    return str(result)


if __name__ == "__main__":

    print("\n🤖 Agente EduPlanner listo.")
    print("Escribe una solicitud para probarlo.")
    print("Escribe 'salir' para terminar.\n")

    while True:

        user_input = input("👤 Tú: ")

        if user_input.lower() == "salir":
            break

        response = process_message(user_input)

        print("\n🤖 EduPlanner:")
        print(response)
        print()
