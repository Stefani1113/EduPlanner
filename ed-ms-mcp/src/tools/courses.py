from typing import Any


def create_course_tool(server, client) :
    """Crea herramientas para consultar datos de cursos desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Cursos
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

    # -------------------------------------------------------------
    # 2. HERRAMIENTA: Listar Cursos por Id
    # -------------------------------------------------------------
    @server.tool(
        name="list_course_id",
        description=f"Por medio del endpoint http://localhost:8080/eduplanner/courses/id consultar y devolver el curso al cual pertenece ese id",
    )
    def list_course_id(id_course : int) -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar curso")
        try :
            courses = client.get(
                f"/courses/{id_course}"
            )
            return {"success" : True, "cursos" : courses}
        except Exception as exc :
            return {"success" : False, "error" : f"Error consultando curso: {str(exc)}"}

    # -------------------------------------------------------------
    # 3. HERRAMIENTA: Listar Cursos por Jornada
    # -------------------------------------------------------------
    @server.tool(
        name="list_course_shift",
        description="Por medio del endpoint http://localhost:8080/eduplanner/courses/filter?shift=id consultar y devolver la lista de los cursos los cuales pertenecen a el id de esa jornada"
    )
    def list_course_shift(id_shift : int) -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar cursos por jornada")
        try :
            course = client.get(
                f"/courses/filter?shift={id_shift}"
            )
            return {"success" : True, "curso" : course}
        except Exception as exc :
            return {"success" : False, "error" : f"Error consultando curso por jornada: {str(exc)}"}
