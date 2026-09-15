from typing import Any

# Adaptamos la información que devuelven los endpoint en formato JSON
# A lo que espera el algoritmo

def adapt_academic_loads(data: list[dict[str, Any]]) -> list[dict[str, Any]]:
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


def adapt_courses(data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id_course": course["idCourse"],
            "name": ["name"],
            "id_shift": course["idShift"],
            "id_period": course["idPeriod"],
            "status": course["status"]
        }
        for course in data
    ]


def adapt_teacher(data: dict[str, Any]) -> dict[str, Any]:
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


def load_scheduler_data(client, course_names: list[str] | None = None):

    # Cargas acdémicas
    academic_loads_response = client.get(
        "/academic-loads"
    )

    academic_loads_data = academic_loads_response["data"]

    academic_loads = adapt_academic_loads(
        academic_loads_data
    )

    # Cursos
    courses_response = client.get(
        "/courses"
    )

    courses_data = courses_response["data"]

    courses = adapt_courses(
        courses_data
    )

    # Filtrar cursos
    if course_names :
        requested_names = {
            name.strip().upper()
            for name in course_names
        }

        # Busca los cursos solicitados 
        select_courses = [
            course 
            for course in courses
            if course["status"]
            and course["name"].strip().upper() in requested_names
        ]

        # Verifica que los cursos solicitados existan
        found_names = {
            courses["name"].strip().upper()
            for course in select_courses
        }

        not_found = requested_names - found_names

        if not_found :
            raise ValueError(
                "No se encuentra los siguientes cursos: " + ", ".join(sorted(not_found))
            )

        courses = select_courses

    else : 
        # si no se especifican cursos se utilizan todos los cursos activos 
        courses = [
            courses
            for course in courses
            if course["status"]
        ]

    # Verificar que existen cursos
    if not courses :
        raise ValueError(
            "No existen cursos activos para generar horario"
        )

    print("Cursos seleccionados:")
    for course in courses :
        print (f"-{course['name']}" f"(ID: {course['id_course']})")

    # Periodos
    period_ids = {
        course["id_period"]
        for course in courses
        if course["status"]
    }

    if len(period_ids) != 1:
        raise ValueError(
            "Los cursos seleccionados no pertenecen al mismo periodo académico"
        )

    id_period =  next(iter(period_ids))

    # Filtrar cargas académica

    selected_course_ids = {
        course["id_course"]
        for course in courses
    }

    academic_loads = {
        course["id_course"]
        for course in courses 
    }

    academic_loads = [
        load 
        for load in academic_loads
        if load["status"]
        and load["id_course"] in selected_course_ids
    ]

    if not academic_loads :
        raise ValueError(
            "Los cursos seleccionados no tienen carga académica activa"
        )

    print(f"Cargas académicas seleccionadas: " f"{len(academic_loads)}")

    # Docentes necesarios
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

    # Disponibilidad de docentes
    teacher_availability = []

    for teacher_id in teacher_ids:

        availability_response = client.get(
            f"/teacher-availability?idTeacher={teacher_id}"
        )

        teacher_availability.extend(
            adapt_teacher_availability(
                availability_response["data"]
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

        time_slots_response = client.get(
            f"/time-slots?idShift={shift_id}"
        )

        time_slots.extend(
            adapt_time_slots(
                time_slots_response["data"]
            )
        )


# Devuelve todo
    return {
        "teachers": teachers,
        "courses": courses,
        "time_slots": time_slots,
        "academic_loads": academic_loads,
        "teacher_availability": teacher_availability,
        "id_period" : id_period
    }