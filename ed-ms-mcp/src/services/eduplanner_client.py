from typing import Any

import requests

class EduPlannerClient : 
    """Http Client de Eduplanner"""

    def __init__(self, settings, jwt_manager):
        self.settings = settings
        self.jwt_manager = jwt_manager

    def get(self, endpoints: str ) -> Any:
        """Realice una solicitud GET autenticada a EduPlanner."""

        token = self.jwt_manager.get_valid_token()

        headers = {
            "Authorization": f"Bearer {token}"
        }

        url = (
            f"{self.settings.EDUPLANNER_BASE_URL}"
            f"{endpoints}"
        )

        response = requests.get(
            url, headers= headers,
        )

        response.raise_for_status()

        return response.json()