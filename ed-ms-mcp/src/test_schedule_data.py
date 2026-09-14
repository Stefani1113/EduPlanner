from auth.jwt_manager import JWTManager
from config.settings import settings
from services.eduplanner_client import EduPlannerClient

from algorithms.scheduler_data import load_scheduler_data
from algorithms.scheduler import generate_and_validate_schedule


def main():

    # Crear autenticación
    jwt_manager = JWTManager(settings)

    # Crear cliente
    client = EduPlannerClient(
        settings,
        jwt_manager
    )

    print("Cargando datos para generar horario...\n")

    # Obtener datos reales del backend
    data = load_scheduler_data(client)

    print("================================")
    print("DATOS CARGADOS")
    print("================================")

    print("Docentes:", len(data["teachers"]))
    print("Cursos:", len(data["courses"]))
    print("Bloques horarios:", len(data["time_slots"]))
    print("Cargas académicas:", len(data["academic_loads"]))
    print("Disponibilidades:", len(data["teacher_availability"]))

    print("\nDISPONIBILIDADES POR DOCENTE:")

    for teacher_id in [1, 2, 3, 4]:

        availability = [
            item
            for item in data["teacher_availability"]
            if item["id_teacher"] == teacher_id
            and item["available"]
        ]

        print(
            f"Docente {teacher_id}: "
            f"{len(availability)} bloques disponibles"
        )

    print("\nDocentes:")
    for teacher in data["teachers"]:
        print(teacher)

    print("\nCursos:")
    for course in data["courses"]:
        print(course)

    # =================================
    # GENERAR HORARIO
    # =================================

    print("\nGenerando horario...\n")

    schedule, errors = generate_and_validate_schedule(
        data["teachers"],
        data["courses"],
        data["time_slots"],
        data["academic_loads"],
        data["teacher_availability"]
    )

    print("================================")
    print("RESULTADO DEL HORARIO")
    print("================================")

    if errors:

        print("El horario tiene errores:")

        for error in errors:
            print("-", error)

    else:

        print("Horario generado correctamente")
        print("Cantidad de clases:", len(schedule))

        print("\nHORARIO:")

        for class_item in schedule:
            print(class_item)


if __name__ == "__main__":
    main()