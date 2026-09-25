from typing import Any
import traceback

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
            "Genera el horario académico de uno o varios cursos específicos "
            "o de todos los cursos si no se especifican. "
            "Consulta docentes, cursos, bloques horarios, cargas académicas "
            "y disponibilidad docente reales desde EduPlanner, ejecuta el "
            "algoritmo de asignación con backtracking y valida el resultado "
            "antes de devolverlo. "
            "El parámetro course_names permite indicar los nombres de los cursos, "
            "por ejemplo ['1A'] o ['1A', '2A']."
        ),
    )
    def generate_schedule_tool(course_names : list[str] | None = None) -> dict[str, Any]:
        print(f"👉 [MCP Tool] Ejecutando generación de horario")
        try:

            # Cargar datos reales 
            data = load_scheduler_data(client, course_names)

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

                print("❌ El horario no pudo ser generado/validado")
                print(f"Conflictos encontrados: {len(errors)}")

                return {
                    "success": False,
                    "conflicts": errors,
                    "total_conflicts": len(errors),
                    "message": (
                        "No fue posible generar un horario válido "
                        "debido a los conflictos encontrados."
                    )
                }

            # Verificar que existe el horario
            if not schedule:

                print("❌ El algoritmo no generó clases")

                return {
                    "success": False,
                    "conflicts": [
                        {
                            "type": "NO_SCHEDULE",
                            "message": (
                                "El algoritmo no pudo generar ninguna "
                                "asignación para el horario."
                            )
                        }
                    ],
                    "total_conflicts": 1,
                    "message": "No se pudo generar el horario."
                }

            print(
                f"✅ Horario generado correctamente: "
                f"{len(schedule)} clases"
            )

            # Obtener el curso 
            courses = data["courses"]

            if not courses:

                return {
                    "success": False,
                    "conflicts": [
                        {
                            "type": "NO_COURSES",
                            "message": (
                                "No existen cursos disponibles "
                                "para generar el horario."
                            )
                        }
                    ],
                    "total_conflicts": 1,
                    "message": "No existen cursos para generar el horario."
                }

            # Obtener el periodo
            periods = {
                course["id_period"]
                for course in courses
                if course.get("id_period") is not None
            }

            if not periods:

                return {
                    "success": False,
                    "conflicts": [
                        {
                            "type": "NO_PERIOD",
                            "message": (
                                "No se pudo obtener el periodo académico "
                                "de los cursos."
                            )
                        }
                    ],
                    "total_conflicts": 1,
                    "message": (
                        "No se pudo obtener el periodo académico "
                        "de los cursos."
                    )
                }

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

            # Verifica que todos pertenezcan al mismo periodo
            if len(periods) > 1 :
                return {
                    "success": False,
                    "conflicts": [
                        {
                            "type": "MULTIPLE_PERIODS",
                            "message": (
                                "Los cursos pertenecen a diferentes "
                                "periodos académicos. No se puede guardar "
                                "una generación con varios periodos."
                            )
                        }
                    ],
                    "total_conflicts": 1,
                    "message": (
                        "Los cursos pertenecen a diferentes "
                        "periodos académicos."
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
                "courses" :[
                    course["name"]
                    for course in data["courses"]
                ],
                "total_clases" : len(schedule),
                "schedule" : schedule,
                "message": (
                    "El horario fue generado, validado y guardado "
                    "correctamente."
                )
            }

        except Exception as e:
            traceback.print_exc()

            return {
                "success": False,
                "conflicts": [
                    {
                        "type": "SYSTEM_ERROR",
                        "message": str(e)
                    }
                ],
                "total_conflicts": 1,
                "message": "Ocurrió un error durante la generación o almacenamiento del horario."
            }