from typing import Any


def create_subject_tool(server, client) :
    """Crea la herramienta list_subjects para consultar datos de asignaturas desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Asignaturas
    # -------------------------------------------------------------
    @server.tool(
        name="list_subjects",
        description="Por medio del endpoint http://localhost:8080/eduplanner/subjects consultar y devolver la lista de todas las asignaturas registradas",
    )
    def list_subjects() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar asignaturas")
        try :
            subjects = client.get(
                "/subjects"
            )
            return {"success" : True, "asignaturas" : subjects}
        except Exception as exc : 
            return {"success" : False, "error": f"Error consultando asignaturas: {str(exc)}"}
        
