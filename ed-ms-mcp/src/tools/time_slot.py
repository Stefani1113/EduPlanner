from typing import Any

def create_time_slot_tool(server, client):
    """Crea herramientas  para consultar datos de la disponibilidad del docente desde el microservicio de gestión académica de EduPlanner."""

    # -------------------------------------------------------------
    # 1. HERRAMIENTA: Listar Franjas por Jornada
    # -------------------------------------------------------------
    @server.tool(
            name="list_time_slot_shift",
            description="Por medio del endpoint http://localhost:8080/eduplanner/time-slots?idShift=id consultar y devolver la disponibilidad de dicho docente al que pertenece ese id"
    )
    def list_time_slot_shift(id_shift : int) :
        print(f"👉 [MCP Tool] Ejecutando listar franjas de dicha jornada")
        try :
            time_slot_shift = client.get(
                f"/time_slot/id_shift={id_shift}"
            )
            return {"success" : True, "franjas_de_jornada" : time_slot_shift}
        except Exception as exc : 
            return {"success" : False, "error" : f"Error al consultar franja de dicha jornada: {str(exc)}"}


