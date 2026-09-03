from typing import Any 

def create_teacher_availability_tool(server, client):
    """Crea herramientas para consultar datos de la disponibilidad del docente desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Disponibilidad de Docente
    # -------------------------------------------------------------
    @server.tool(
            name="list_teacher_availability",
            description="Por medio del endpoint http://localhost:8080/eduplanner/teacher_availability?id_teacher=id consultar y devolver la disponibilidad de dicho docente al que pertenece ese id"
    )
    def list_techer_avalaibility(id_teacher: int) -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando listar disponibilidad de dicho docente")
        try :
            academic_teacher = client.get(
                f"/teacher_availability?id_teacher={id_teacher}"
            )
            return {"success" : True, "disponibilidad_docentes" : academic_teacher}
        except Exception as exc :
            return {"success" : False, "error" : f"Error consultando disponibilidad de dicho docente: {str(exc)}"}