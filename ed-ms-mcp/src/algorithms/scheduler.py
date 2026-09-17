import random

# Restricciones 

# Verifica dsiponibilidad horaria del docente 
def teacher_is_available(id_teacher, id_time_slot, day_of_week, teacher_availability) :
    for availability in teacher_availability :
        if (
            availability["id_teacher"] == id_teacher
            and availability["id_time_slot"] == id_time_slot
            and availability["day_of_week"] == day_of_week
        ) :
            return availability["available"]
        
    return False

# Verifica si ese docente ya tiene asignada una clase 
def available_teacher(schedule, id_teacher, id_time_slot, day_of_week) :
    for clas in schedule :
        if(
            clas["id_teacher"] == id_teacher
            and clas["id_time_slot"] == id_time_slot 
            and clas["day_of_week"] == day_of_week
        ) :
            return False
    return True

# Verifica si ese curso ya tiene clase o no 
def available_course(schedule, id_course, id_time_slot, day_of_week) :
    for clas in schedule :
        if(
            clas["id_course"] == id_course
            and clas["id_time_slot"] == id_time_slot
            and clas["day_of_week"] == day_of_week 
        ) :
            return False
    return True

# Máximos de horas diarias de un docente
def daily_teaching_hours(schedule, id_teacher, day_of_week, max_daily_hours) :
    count = 0

    for clas in schedule :
        if(
            clas["id_teacher"] == id_teacher
            and clas["day_of_week"] == day_of_week
        ) :
            count += 1

    return count < max_daily_hours

# Máximo de horas semanales 
def weekly_teaching_hours(schedule, id_teacher, max_weekly_hours) :
    count = 0

    for clas in schedule :
        if clas["id_teacher"] == id_teacher :
            count += 1
    return count < max_weekly_hours

# Respetar descansos 
def rest_space(space) :
    return not space["break"]

# No colocar 5 horas de una sola signatura en un solo día 
MAX_SUBJECT_DAY = 2

def availability_subject_of_day(schadule, id_course, id_subject, day_of_week) :
    count = 0

    for clas in schadule :
        if(
            clas ["id_course"] == id_course
            and clas["id_subject"] == id_subject
            and clas["day_of_week"] == day_of_week
        ) :
            count += 1

    return count < MAX_SUBJECT_DAY

# Verifica que todos los requisitos sean validos 
def valid_space(schedule, load, teacher, course, space, day_of_week, teacher_availability) :

    id_teacher = load["id_teacher"]
    id_course = load["id_course"]
    id_subject = load["id_subject"]

    # El espacio debe estar activo 
    if not space["status"] :
        return False

    # No puede ser descanso
    if not rest_space(space) :
        return False

    # La jornada del curso debe coincidir
    if course["id_shift"] != space["id_shift"] :
        return False

    # El docente debe estar disponible
    if not teacher_is_available(id_teacher, space["id_time_slot"], day_of_week, teacher_availability) :
        return False

    # El docente no puede tener otra clase ahí
    if not available_teacher(schedule, id_teacher, space["id_time_slot"], day_of_week) :
        return False

    # El curso no puede tener otra clase ahí
    if not available_course(schedule, id_course, space["id_time_slot"], day_of_week) :
        return False

    # Máximo de horas diarias del docente 
    if not daily_teaching_hours(schedule, id_teacher, day_of_week, teacher["max_daily_hours"]) :
        return False

    # Máximo de horas semanales de docente 
    if not weekly_teaching_hours(schedule, id_teacher, teacher["max_weekly_hours"]) :
        return False

    # Distribución de la asignatura
    if not availability_subject_of_day(schedule, id_course, id_subject, day_of_week) :
        return False
    
    return True

# Genera un horario
def generate_schedule(teachers, courses, time_slots, academic_loads, teacher_availability) : 
    schedule = []

    # Filtrar datos por estado
    academic_loads_active = [load for load in academic_loads if load["status"]]
    teachers_active = [teacher for teacher in teachers if teacher["status"]]
    courses_active = [course for course in courses if course["status"]]

    # Procesa primero las cargas con mayor prioridad
    academic_loads_sorted = sorted(academic_loads_active, key=lambda load: load["priority"])

    def backtrack(load_index, assigned_hours) :

        # Caso base 
        if load_index == len(academic_loads_sorted) :
            return True

        load = academic_loads_sorted[load_index]

        id_teacher = load["id_teacher"]
        id_course = load["id_course"]

        teacher = next(
            teacher for teacher in teachers_active
            if teacher["id_academic_teacher"] == id_teacher
        )

        course = next(
            course for course in courses_active
            if course["id_course"] == id_course
        )

        # Pregunta si ya termino este load
        if assigned_hours == load["weekly_hours"] :
            return backtrack(
                load_index + 1,
                0
            )

        # Mazcla días y bloques en cada intento
        days = list(range(1, 6))
        random.shuffle(days)

        slots = time_slots.copy()
        random.shuffle(slots)

        # Probar dias
        for day_of_week in days : 

            # Probar espacios
            for space in slots:
                if valid_space(schedule, load, teacher, course, space, day_of_week, teacher_availability) :

                    clas = {
                        "id_academic_load" :
                            load["id_academic_load"],

                        "id_teacher" :
                            load["id_teacher"],

                        "id_course" :
                            load["id_course"],

                        "id_subject" :
                            load["id_subject"],

                        "id_time_slot" :
                            space["id_time_slot"],

                        "day_of_week" :
                            day_of_week
                    }

                    # Asigno la clase
                    schedule.append(clas)

                    # Intento colocar otra
                    if backtrack(load_index, assigned_hours + 1) :
                        return True

                    # No se pudo asignar clase, asi que deshago la anterio
                    schedule.pop()

        # No encontramos solución
        return False

    # Empezamos de nuevo 
    if backtrack(0, 0) :
        return schedule

    return None

# Revisa un horario ya generado y devuelve una lista de problemas encontrados
def validate_schedule(schedule, teachers, courses, time_slots, academic_loads, teacher_availability):
    errors = []

    # Diccionarios de apoyo
    teachers_by_id = {teacher["id_academic_teacher"]: teacher for teacher in teachers}
    slots_by_id = {slot["id_time_slot"]: slot for slot in time_slots}

    # Ningún docente puede tener dos clases en el mismo día
    seen_teacher_slots = set()
    for clas in schedule:
        key = (clas["id_teacher"], clas["day_of_week"], clas["id_time_slot"])
        if key in seen_teacher_slots:
            errors.append(f"Docente {clas['id_teacher']} tiene 2 clases el mismo día {clas['day_of_week']}, bloque {clas['id_time_slot']}")
        seen_teacher_slots.add(key)

    # Ningún curso puede tener dos clases en el mismo día
    seen_course_slots = set()
    for clas in schedule:
        key = (clas["id_course"], clas["day_of_week"], clas["id_time_slot"])
        if key in seen_course_slots:
            errors.append(f"Curso {clas['id_course']} tiene 2 clases el mismo día {clas['day_of_week']}, bloque {clas['id_time_slot']}")
        seen_course_slots.add(key)

    # Ningún bloque usado puede ser un descanso
    for clas in schedule:
        slot = slots_by_id[clas["id_time_slot"]]
        if slot["break"]:
            errors.append(f"Se asignó una clas en un bloque de descanso: {clas}")

    # El bloque debe pertenecer a la jornada del curso
    courses_by_id_full = {c["id_course"]: c for c in courses}
    for clas in schedule:
        slot = slots_by_id[clas["id_time_slot"]]
        course = courses_by_id_full[clas["id_course"]]
        if slot["id_shift"] != course["id_shift"]:
            errors.append(f"Bloque de jornada equivocada para el curso {clas['id_course']}: {clas}")

    # La disponibilidad del docente debe respetarse
    availability_set = {
        (a["id_teacher"], a["id_time_slot"], a["day_of_week"])
        for a in teacher_availability if a["available"]
    }
    for clas in schedule:
        key = (clas["id_teacher"], clas["id_time_slot"], clas["day_of_week"])
        if key not in availability_set:
            errors.append(f"Docente {clas['id_teacher']} no estaba disponible en: {clas}")

    # Horas diarias y semanales máximas por docente
    for teacher_id, teacher in teachers_by_id.items():
        teacher_class = [course for course in schedule if course["id_teacher"] == teacher_id]

        # Semanales
        if len(teacher_class) > teacher["max_weekly_hours"]:
            errors.append(f"Docente {teacher_id} excede sus horas semanales máximas ({len(teacher_class)} > {teacher['max_weekly_hours']})")

        # Diarias
        for day in range(1, 6):
            day_class = [c for c in teacher_class if c["day_of_week"] == day]
            if len(day_class) > teacher["max_daily_hours"]:
                errors.append(f"Docente {teacher_id} excede sus horas diarias máximas el día {day} ({len(day_class)} > {teacher['max_daily_hours']})")

    # Cada carga académica debe cumplir las horas semanales requeridas
    for load in academic_loads:
        if not load["status"]:
            continue
        load_class = [c for c in schedule if c["id_academic_load"] == load["id_academic_load"]]
        if len(load_class) != load["weekly_hours"]:
            errors.append(
                f"La carga {load['id_academic_load']} tiene {len(load_class)} horas asignadas, "
                f"pero necesita exactamente {load['weekly_hours']}"
            )

    return errors

# Genera el horario y lo valida antes de devolverlo.
def generate_and_validate_schedule(teachers, courses, time_slots, academic_loads, teacher_availability):
    schedule = generate_schedule(teachers, courses, time_slots, academic_loads, teacher_availability)

    if schedule is None:
        return None, ["No fue posible generar un horario con las restricciones actuales"]

    errors = validate_schedule(schedule, teachers, courses, time_slots, academic_loads, teacher_availability)

    if errors:
        return None, errors  # no paso la validación

    return schedule, []  # horario válido

if __name__ == "__main__":
    schedule, errors = generate_and_validate_schedule()

    if errors:
        print("El horario generado tiene problemas:")
        for error in errors:
            print(" -", error)
    else:
        print("Horario generado y validado correctamente:")
        for clas in schedule:
            print(clas)