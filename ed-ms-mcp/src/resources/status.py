import json

def create_status_resource(server, settings) :
    """Registrar el recurso de estado del servidor MCP."""

    
    # -------------------------------------------------------------
    # RECURSO DE ESTADO (MCP Resource)
    # -------------------------------------------------------------
    @server.resource(
        "system://status",
        name="server_status",
        description="Estado y herramientas disponibles en el servidor MCP",
        mime_type="application/json",
    )
    def server_status() -> str:
        """Retorna un recurso JSON informativo."""
        return json.dumps(
            {
                "status": "healthy",
                "server": "EduPlannerMCP",
                "version": "1.0.0",
                "transport": settings.TRANSPORT,
                "tools":
                    [
                        "list_subjects", 
                        "list_courses",
                        "list_academic_loads"],
            },
            indent = 2,
        )
