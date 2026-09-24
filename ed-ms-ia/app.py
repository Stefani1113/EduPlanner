"""
Servidor Flask - API REST del Agente Conversacional CrewAI + MCP.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from agent.conversational_agent import process_message

import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/api/status", methods=["GET"])
def status():
    """Estado del servidor del agente."""
    mcp_url = os.getenv("MCP_SERVER_URL", "http://0.0.0.0:8000")
    return jsonify({
        "status": "online",
        "mcp": {
            "online": True,
            "url": f"${mcp_url}/mcp"
        },
        "llm": {
            "provider": "gemini",
            "model": "gemini-3.5-flash-lite"
        }
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    """Recibe un mensaje y lo procesa mediante el agente."""

    data = request.get_json() or {}

    data = request.get_json(silent=True) or {}

    print("📩 DATOS RECIBIDOS:", data)
    print("📩 CONTENT-TYPE:", request.content_type)

    message = data.get("message", "").strip()

    if not message:
        return jsonify({
            "success": False,
            "error": "Mensaje requerido"
        }), 400

    try:
        response = process_message(message)

        return jsonify({
            "success": True,
            "response": response
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("================================")
    print("🚀 EDUPLANNER IA")
    print("================================")
    print("Servidor Flask:")
    print("http://0.0.0.0:5000")
    print("================================")

    app.run(
    host="0.0.0.0",
    port=5000,
    debug=False
)