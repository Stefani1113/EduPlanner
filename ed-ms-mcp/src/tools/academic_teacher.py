from typing import Any

def create_academic_teacher_tool(server, client) :
    """Crea herramientas  para consultar datos del docente desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Franjas por Jornada
    # -------------------------------------------------------------
    @server.tool(
        name="list_academic_teacher",
        description="Por medio del endpoint http://localhost:8080/eduplanner/academic-teachers/id consultar y devolver la información del docente al que pertenece ese id"
    )
    def list_academic_teacher(id_academic_teacher : int) :
        print(f"👉 [MCP Tool] Ejecutando listar docente")
        try : 
            academic_teacher = client.get(
                f"/academic_teachers/{id_academic_teacher}"
            )
            return {"success" : True, "docente_academico" : academic_teacher}
        except Exception as exc : 
                    return {"success" : False, "error" : f"Error al consultar el docente: {str(exc)}"}
        