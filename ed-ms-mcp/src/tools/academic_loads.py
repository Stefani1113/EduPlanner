from typing import Any

def create_academic_load_tool(server, client) :
    """Crea la herramienta list_academic_loads para consultar datos de cargas academicas desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 4. HERRAMIENTA: Listar Cargas académicas
    # -------------------------------------------------------------
    @server.tool(
        name="list_academic_loads",
        description="Por medio del endpoint http://localhost:8080/eduplanner/academic-loads consultar y devolver la lista de todas las cargas academicas registradas",
    )
    def list_academic_loads() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar cargas académicas")
        try : 
            academic_loads = client.get(
                "/academic-loads"
            )
            return {"success" : True, "cargas académicas" : academic_loads}
        except Exception as exc : 
            return {"success" : False, "error" : f"Error consultando cargas académicas: {str(exc)}"}

    # -------------------------------------------------------------
    # 5. HERRAMIENTA: Listar Cargas académicas por Docente
    # -------------------------------------------------------------
    @server.tool(
        name="List_academic_loads_teacher"
        description="Por medio del endpoint http://localhost:8080/eduplanner/academic-loads/filter?teacher=id consultar y devolver la lista de las cargar académicas de el docente al que pertenece ese Id",
    )
    def list_academic_loads_teacher(id_teacher = int) -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar cargas académicas por Docente")
        try :
            academic_loads_teacher = client.get(
                "/academic-loads/{id_teacher}"
            )
            return {"success" : True, "cargas académicas" : academic_loads_teacher}
        except Exception as exc :
            return {"success" : False, "error" : f"Error consultando cargas academicas de dicho docente: {str(exc)}"}