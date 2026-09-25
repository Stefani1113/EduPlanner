from typing import Any


# Traemos todas las páginas y devolvemos una sola lista
def get_all_pages(
    client,
    endpoint,
    page_size=100
):
    all_items = []
    page = 0

    while True:

        separator = "&" if "?" in endpoint else "?"

        response = client.get(
            f"{endpoint}{separator}page={page}&size={page_size}"
        )

        data = response["data"]

        # Respuesta paginada
        if isinstance(data, dict) and "content" in data:

            content = data["content"]

            if not isinstance(content, list):
                raise ValueError(
                    f"El contenido de {endpoint} no tiene formato de lista"
                )

            all_items.extend(content)

            total_pages = data.get("totalPages", 1)

            page += 1

            if page >= total_pages:
                break

        # Respuesta antigua sin paginación
        elif isinstance(data, list):

            all_items.extend(data)

            break

        else:

            raise ValueError(
                f"Formato de respuesta inesperado para {endpoint}"
            )
            

    return all_items


# Adaptamos la información que devuelven los endpoints
# al formato que espera el algoritmo
def adapt_academic_loads(
    data: list[dict[str, Any]]
) -> list[dict[str, Any]]:

    return [
        {
            "id_academic_load": load["idAcademicLoad"],
            "id_teacher": load["idTeacher"],
            "id_course": load["idCourse"],
            "id_subject": load["idSubject"],
            "weekly_hours": load["weeklyHours"],
            "priority": load["priority"],
            "status": load["status"]
        }
        for load in data
    ]


def adapt_courses(
    data: list[dict[str, Any]]
) -> list[dict[str, Any]]:

    return [
        {
            "id_course": course["idCourse"],
            "name": course["name"],
            "id_shift": course["idShift"],
            "id_period": course["idPeriod"],
            "status": course["status"]
        }
        for course in data
    ]


def adapt_teacher(
    data: dict[str, Any]
) -> dict[str, Any]:

    return {
        "id_academic_teacher": data["idAcademicTeacher"],
        "max_daily_hours": data["maxDailyHours"],
        "max_weekly_hours": data["maxWeeklyHours"],
        "status": data["status"]
    }


def adapt_teacher_availability(
    data: list[dict[str, Any]]
) -> list[dict[str, Any]]:

    return [
        {
            "id_teacher": availability["idTeacher"],
            "id_time_slot": availability["idTimeSlot"],
            "day_of_week": availability["dayOfWeek"],
            "available": availability["available"]
        }
        for availability in data
    ]


def adapt_time_slots(
    data: list[dict[str, Any]]
) -> list[dict[str, Any]]:

    return [
        {
            "id_time_slot": slot["idTimeSlot"],
            "id_shift": slot["idShift"],
            "slot_order": slot["slotOrder"],
            "start_time": slot["startTime"],
            "end_time": slot["endTime"],
            "break": slot["isBreak"],
            "status": slot["status"]
        }
        for slot in data
    ]


def load_scheduler_data(
    client,
    course_names: list[str] | None = None
):
    
    # Cargas académicas

    academic_loads_data = get_all_pages(
        client,
        "/academic-loads"
    )

    print("DEBUG academic_loads_data:")
    print(academic_loads_data)

    academic_loads = adapt_academic_loads(
        academic_loads_data
    )
    academic_loads = adapt_academic_loads(
        academic_loads_data
    )


    # Cursos
    courses_data = get_all_pages(
    client,
    "/courses"
    )

    print("DEBUG courses_data:")
    print(courses_data)

    courses = adapt_courses(
        courses_data
    )


    #Filtrar cursos

    if course_names:

        requested_names = set()

        for name in course_names:

            # Si llega una lista dentro de la lista
            if isinstance(name, list):

                for nested_name in name:

                    requested_names.add(
                        str(nested_name).strip().upper()
                    )

            else:

                requested_names.add(
                    str(name).strip().upper()
                )


        # Busca los cursos solicitados
        select_courses = [
            course
            for course in courses
            if course["status"]
            and course["name"].strip().upper() in requested_names
        ]


        # Verifica que los cursos solicitados existan
        found_names = {
            course["name"].strip().upper()
            for course in select_courses
        }


        not_found = requested_names - found_names

        if not_found:

            raise ValueError(
                "No se encuentra los siguientes cursos: "
                + ", ".join(sorted(not_found))
            )


        courses = select_courses


    else:

        # Si no se especifican cursos
        # se utilizan todos los cursos activos
        courses = [
            course
            for course in courses
            if course["status"]
        ]


    # Verificar que existen cursos
    if not courses:

        raise ValueError(
            "No existen cursos activos para generar horario"
        )


    print("Cursos seleccionados:")

    for course in courses:

        print(
            f"- {course['name']} "
            f"(ID: {course['id_course']})"
        )


    # Periodo

    period_ids = {
        course["id_period"]
        for course in courses
        if course["status"]
    }


    if len(period_ids) != 1:

        raise ValueError(
            "Los cursos seleccionados no pertenecen "
            "al mismo periodo académico"
        )


    id_period = next(iter(period_ids))


    # filtar cargas academicas

    selected_course_ids = {
        course["id_course"]
        for course in courses
    }


    academic_loads = [
        load
        for load in academic_loads
        if load["status"]
        and load["id_course"] in selected_course_ids
    ]


    if not academic_loads:

        raise ValueError(
            "Los cursos seleccionados no tienen "
            "carga académica activa"
        )


    print(
        f"Cargas académicas seleccionadas: "
        f"{len(academic_loads)}"
    )


    #Docentes necesarios

    teacher_ids = {
        load["id_teacher"]
        for load in academic_loads
        if load["status"]
    }


    teachers = []


    for teacher_id in teacher_ids:
        teacher_response = client.get(
            f"/academic-teachers/{teacher_id}"
        )

        teachers.append(
            adapt_teacher(
                teacher_response["data"]
            )
        )


    # Disponibilidad de docente

    teacher_availability = []


    for teacher_id in teacher_ids:

        availability_data = get_all_pages(
            client,
            f"/teacher-availability?idTeacher={teacher_id}"
        )


        teacher_availability.extend(
            adapt_teacher_availability(
                availability_data
            )
        )


    # Franjas horarias

    shift_ids = {
        course["id_shift"]
        for course in courses
        if course["status"]
    }


    time_slots = []


    for shift_id in shift_ids:

        time_slots_data = get_all_pages(
            client,
            f"/time-slots?idShift={shift_id}"
        )


        time_slots.extend(
            adapt_time_slots(
                time_slots_data
            )
        )


    # Devuelve todo

    return {
        "teachers": teachers,
        "courses": courses,
        "time_slots": time_slots,
        "academic_loads": academic_loads,
        "teacher_availability": teacher_availability,
        "id_period": id_period
    }