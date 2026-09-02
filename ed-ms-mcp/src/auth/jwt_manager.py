import time

import requests


class JWTManager :
    """Gestiona la autenticación y renovación del JWT de EduPlanner."""

    TOKEN_DURATION = 600 # 10 min
    SAFETY_MARGIN = 30 #Renovar el token cada 30sg

    def __init__(self, settings):
        self.settings = settings
        self._current_token: str | None = None
        self._token_expiration: float = 0

    # Función de login 
    def login(self) -> str :
        """Login completo con usuario y contraseña."""
        print ("Haciendo Login.....")
        response = requests.post(
            self.settings.EDUPLANNER_LOGIN_URL,
            json={
                "email" : self.settings.EDUPLANNER_ADMIN_USER,
                "password" : self.settings.EDUPLANNER_ADMIN_PASSWORD,
            },
        )

        response.raise_for_status()
        return response.json()["data"]["token"]

    # Función para refrescar JWT

    def refresh(self, current_token: str) -> str :
        """Renueva el token mandando el actual"""
        print("Renovando Token.....")
        headers = {"Authorization" : f"Bearer {current_token}"}
        response = requests.get(self.settings.EDUPLANNER_REFRESH_URL, headers= headers)
        response.raise_for_status()
        return response.json()["token"]

    # Función para obtener token 

    def get_valid_token(self) -> str :
        """Devuelve un token válido: Reutiliza el actual o lo renueva"""
        now = time.time()

        # Primera vez haciendo login
        if self._current_token is None :
            self._current_token = self.login()
            self._token_expiration = now + self.TOKEN_DURATION
            return self._current_token

        # Renovación de token antes de que expire
        if now >= (self._token_expiration - self.SAFETY_MARGIN) :
            try :
                self._current_token = self.refresh(self._current_token)
                self._token_expiration = now + self.TOKEN_DURATION
            except requests.exceptions.RequestException : 
                print("El refresh falló")
                self._current_token = self.login()
                self._token_expiration = now + self.TOKEN_DURATION

        return self._current_token
