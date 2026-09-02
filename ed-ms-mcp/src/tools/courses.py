from typing import Any


def create_course_tool(server, client) :
    """Crea la herramienta list_courses para consultar datos de cursos desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 2. HERRAMIENTA: Listar Cursos
    # -------------------------------------------------------------
    @server.tool(
        name="list_courses",
        description="Por medio del endpoint http://localhost:8080/eduplanner/courses consultar y devolver la lista de todas los cursos registrados",
    )
    def list_courses() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar cursos")
        try : 
            courses = client.get(
                "/courses"
            )
            return {"success" : True, "cursos" : courses }
        except Exception as exc : 
            return {"success" : False, "error" : f"Error consultando cursos: {str(exc)}"}

