from typing import Any

from algorithms.scheduler import generate_and_validate_schedule
import algorithms.scheduler as scheduler_module
from algorithms.scheduler_data import load_scheduler_data


def create_scheduler_tool(server, client):
    """Crea la herramienta para generar el horario académico completo."""

    # -------------------------------------------------------------
    # HERRAMIENTA: Generar Horario
    # -------------------------------------------------------------
    @server.tool(
        name="generate_schedule",
        description=(
            "Genera el horario académico completo consultando docentes, cursos, "
            "bloques horarios, cargas académicas y disponibilidad docente reales "
            "desde EduPlanner, ejecuta el algoritmo de asignación con backtracking, "
            "y valida el resultado antes de devolverlo."
        ),
    )
    def generate_schedule_tool() -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando generación de horario")
        try:
            data = load_scheduler_data(client)

            schedule, errors = generate_and_validate_schedule(
                data["teachers"],
                data["courses"],
                data["time_slots"],
                data["academic_loads"],
                data["teacher_availability"]
            )
            
            if errors:
                return {"success": False, "errors": errors}

            return {"success": True, "schedule": schedule, "total_clases": len(schedule)}

        except Exception as exc:
            return {"success": False, "error": f"Error generando el horario: {str(exc)}"}