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

            # Cargar datos reales 
            data = load_scheduler_data(client)

            print("Datos cargador correctamente")

            # Generar y validar horario
            schedule, errors = generate_and_validate_schedule(
                data["teachers"],
                data["courses"],
                data["time_slots"],
                data["academic_loads"],
                data["teacher_availability"]
            )
            
            if errors:

                print("El horario no pudo ser validado")
                return {"success": False, "errors": errors}

            print(f"Horario generado correctamente :" f"{len(schedule)} clases")

            # Obtener el periodo
            courses = data["courses"]

            if not courses :
                return {
                    "sucess" : False,
                    "error" : "No existen cursos para generar el horario "
                }

            periods = {
                course["id_period"]
                for course in courses
                if course.get("id_period") is not None
            }

            if not periods :
                return {
                    "success" : False,
                    "error" : "No se pudo obtener el periodo académico de los cursos"
                }

            if len(periods) > 1 :
                return {
                    "success" : False,
                    "error" : (
                        "Los cursos pertenecen a diferentes periodos académicos "
                        "No se puede guardar una generación con varios periodos "
                    )
                }

            id_period = next(iter(periods))

            # Preparar datos para guardarlos
            schedules_to_save = []

            for item in schedule :
                schedules_to_save.append({
                    "idAcademicLoad" : item["id_academic_load"],
                    "idTimeSlot" : item["id_time_slot"],
                    "dayOfWeek" : item["day_of_week"]
                })

            payload = {
                "idPeriod": id_period,
                "generatedBy": 1,
                "observations": (
                    "Horario generado automáticamente "
                    "por EduPlanner IA"
                ),
                "scheduleType": "REGULAR",
                "schedules": schedules_to_save
            }

            # Guardar información en gestión académica
            print("Guardando horario en gestión académica....")

            # Endpoint donde se envia la información
            response = client.post(
                "/schedules/generations",
                payload
            )

            # Obtener ID de la generación
            generation_id = response.get("data")

            print(f"Horario guardado correctamente" f"ID generación : {generation_id}")

            # Devolver resultado al agente 
            return {
                "success" : True,
                "generation_id" : generation_id,
                "total_clases" : len(schedule),
                "schedule" : schedule
            }

        except Exception as exc:
            print(f"Error generando o guardando horario: {exc}")

            return {"success": False, "error": str(exc)}