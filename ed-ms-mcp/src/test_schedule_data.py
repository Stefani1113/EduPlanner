from auth.jwt_manager import JWTManager
from config.settings import settings
from services.eduplanner_client import EduPlannerClient

from algorithms.scheduler_data import load_scheduler_data


def main():

    # Crear autenticación
    jwt_manager = JWTManager(settings)

    # Crear cliente
    client = EduPlannerClient(
        settings,
        jwt_manager
    )

    print("Cargando datos para generar horario...\n")

    data = load_scheduler_data(client)

    print("================================")
    print("DATOS CARGADOS")
    print("================================")

    print("Docentes:", len(data["teachers"]))
    print("Cursos:", len(data["courses"]))
    print("Bloques horarios:", len(data["time_slots"]))
    print("Cargas académicas:", len(data["academic_loads"]))
    print("Disponibilidades:", len(data["teacher_availability"]))

    print("\nDocentes:")
    for teacher in data["teachers"]:
        print(teacher)

    print("\nCursos:")
    for course in data["courses"]:
        print(course)


if __name__ == "__main__":
    main()