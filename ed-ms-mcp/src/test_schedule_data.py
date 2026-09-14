from auth.jwt_manager import JWTManager
from config.settings import settings
from services.eduplanner_client import EduPlannerClient

from algorithms.scheduler_data import adapt_academic_loads


def main():

    # Crear autenticación
    jwt_manager = JWTManager(settings)

    # Crear cliente
    client = EduPlannerClient(
        settings,
        jwt_manager
    )

    print("Consultando cargas académicas...")

    response = client.get("/academic-loads")

    # Tomamos únicamente la lista de cargas
    academic_loads = adapt_academic_loads(response["data"])

    print("\nCargas adaptadas:")
    
    for load in academic_loads:
        print(load)


if __name__ == "__main__":
    main()