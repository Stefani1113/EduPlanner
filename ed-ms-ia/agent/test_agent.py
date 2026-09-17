from conversational_agent import process_message


print("\n🤖 Agente EduPlanner iniciado")
print("Escribe 'salir' para terminar.\n")


while True:

    user_input = input("Usuario: ").strip()

    if user_input.lower() in ["salir", "exit"]:
        print("Conversación finalizada.")
        break

    if not user_input:
        continue

    response = process_message(user_input)

    print("\n🤖 Asistente:")
    print(response)
    print()