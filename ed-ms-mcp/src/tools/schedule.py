from typing import Any

def generate_schedule_tool(server, client) :
    """Crea herramienta para consultar restricciones y crear horario académico"""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Generar horario
    # -------------------------------------------------------------
    @server.tool(
        name="generate_schedule",
        description="Genera un horario académico utilizando los datos reales de EduPlanner y respetando las restricciones de docentes, cursos, disponibilidad, jornadas, bloques y horas académicas"
    )
    def generate_schedule() -> dict[str, Any] :
        try : 
            academic_teacher = client.get(
                f"/academic-teachers/{id_academic_teacher}"
            )
            return {"success" : True, "docente_academico" : academic_teacher}
        except Exception as exc : 
                    return {"success" : False, "error" : f"Error al consultar el docente: {str(exc)}"}
        