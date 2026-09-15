import os

from dotenv import load_dotenv
from crewai import Agent, LLM
from crewai.mcp import MCPServerHTTP
from crewai.mcp.filters import create_static_tool_filter


env_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    ".env"
)

load_dotenv(
    dotenv_path=os.path.abspath(env_path)
)


tool_filter = create_static_tool_filter(
    allowed_tool_names=[
        "generate_schedule"
    ]
)


mcp_server = MCPServerHTTP(
    url=os.getenv(
        "MCP_SERVER_URL",
        "http://127.0.0.1:8000/mcp"
    ),
    tool_filter=tool_filter
)


llm = LLM(
    model=os.getenv(
        "LLM_MODEL",
        "gpt-4o-mini"
    ),
    api_key=os.getenv("OPENAI_API_KEY")
)


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


print("\n🔎 Cargando herramientas MCP filtradas...")

try:

    mcp_tools = agent.get_mcp_tools(agent.mcps)

    print(
        f"\n✅ Cantidad de herramientas encontradas: "
        f"{len(mcp_tools)}"
    )

    for tool in mcp_tools:
        print(f"🔧 {tool.name}")

    tool = mcp_tools[0]

    print("\n========== ANTES ==========")
    print("name:", tool.name)
    print("original_tool_name:", tool.original_tool_name)

    tool.name = "generate_schedule"

    print("\n========== DESPUÉS ==========")
    print("name:", tool.name)
    print("original_tool_name:", tool.original_tool_name)

except Exception as e:

    print("\n❌ Error:")
    print(e)