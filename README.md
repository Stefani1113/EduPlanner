# 🎓 EduPlanner

**EduPlanner** es una plataforma web orientada a la gestión y organización académica de instituciones educativas. El sistema permite centralizar diferentes procesos relacionados con la administración institucional, gestión académica, horarios, calificaciones, asistencia y generación automatizada de horarios mediante técnicas de inteligencia artificial.

El proyecto fue desarrollado como solución tecnológica para facilitar la administración de la información académica y optimizar la planificación de horarios, reduciendo el trabajo manual y permitiendo una gestión más organizada de los recursos académicos.

---

## 📌 Descripción

EduPlanner proporciona diferentes funcionalidades de acuerdo con el rol del usuario dentro de la institución educativa.

Entre sus principales características se encuentran:

* 👥 Gestión de usuarios y roles.
* 🔐 Autenticación y seguridad mediante JWT.
* 📧 Activación de cuentas y recuperación de contraseña.
* 👨‍🏫 Gestión de docentes.
* 👨‍🎓 Gestión de estudiantes.
* 🏫 Gestión de cursos y niveles académicos.
* 📚 Gestión de asignaturas.
* 🕐 Configuración de jornadas y bloques horarios.
* 📅 Gestión y generación automática de horarios.
* 🤖 Generación de horarios mediante un módulo de Inteligencia Artificial.
* 📝 Gestión de notas.
* 📊 Consulta de información académica.
* 🔔 Notificaciones en tiempo real sobre cambios en los horarios.
* 📄 Generación de horarios en formato PDF.
* 📥 Importación de información mediante archivos CSV.
* ⚙️ Configuración institucional.
* 🎨 Personalización visual mediante colores institucionales.

---

# 🎯 Objetivo

Desarrollar una plataforma web que permita gestionar de manera centralizada los procesos académicos y administrativos de una institución educativa, incorporando mecanismos de automatización para la generación de horarios y herramientas que faciliten el acceso a la información por parte de administradores, docentes, estudiantes y directivos.

---

# 👥 Roles del sistema

EduPlanner cuenta con cuatro roles principales:

| Rol               | Descripción                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Administrador** | Gestiona usuarios, cursos, docentes, configuraciones académicas y procesos administrativos. |
| **Docente**       | Consulta su información académica y horario asignado.                                       |
| **Estudiante**    | Consulta su información académica y horario correspondiente a su curso.                     |
| **Directivo**     | Puede consultar información académica y administrativa de la institución.                   |

---

# 🏗️ Arquitectura

EduPlanner utiliza una arquitectura basada en **microservicios**, permitiendo separar las diferentes responsabilidades del sistema y facilitar su mantenimiento y escalabilidad.

La arquitectura general está compuesta por:

```text
                         ┌─────────────────────┐
                         │      Angular        │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     API Gateway     │
                         └──────────┬──────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
               ▼                    ▼                    ▼
       ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
       │ Autenticación │    │ Administración│    │    Gestión    │
       │ Microservicio │    │ Microservicio │    │   Académica   │
       └───────────────┘    └───────────────┘    └───────┬───────┘
                                                         │
                          ┌──────────────────────────────┼──────────────┐
                          │                              │              │
                          ▼                              ▼              ▼
                   ┌──────────────┐              ┌────────────┐ ┌─────────────┐
                   │    Notas     │              │    IA      │ │Configuración│
                   │Microservicio │              │Microservicio│ │Institucional│
                   └──────────────┘              └─────┬──────┘ └─────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │     MCP     │
                                                 │   Server    │
                                                 └─────────────┘

                              ┌─────────────────┐
                              │      MySQL      │
                              │    Database     │
                              └─────────────────┘
```

---

# 🧩 Microservicios

El proyecto se encuentra dividido en los siguientes componentes:

### 🔐 ed-ms-autenticacion

Microservicio encargado de los procesos relacionados con:

* Inicio de sesión.
* Validación de credenciales.
* Generación y validación de tokens JWT.
* Activación de cuentas.
* Recuperación de contraseña.
* Seguridad y autenticación de usuarios.

**Puerto:** `8081`

---

### 👥 ed-ms-administracion

Gestiona los procesos administrativos relacionados con usuarios e información institucional.

Entre sus funcionalidades se encuentran:

* Gestión de usuarios.
* Gestión de roles.
* Activación y desactivación de usuarios.
* Asignación de roles.
* Gestión de información administrativa.
* Importación de usuarios mediante CSV.
* Gestión de fotografías de perfil.

**Puerto:** `8082`

Las fotografías de perfil utilizan **Cloudinary** como servicio de almacenamiento.

---

### 📚 ed-ms-gestion-academica

Es el componente encargado de la gestión académica y de horarios.

Permite administrar:

* Periodos académicos.
* Niveles académicos.
* Cursos.
* Asignaturas.
* Docentes.
* Disponibilidad docente.
* Cargas académicas.
* Jornadas.
* Bloques horarios.
* Generaciones de horarios.
* Publicación de horarios.
* Consulta de horarios.
* Generación de documentos PDF.

**Puerto:** `8083`

Context Path:

```text
/eduplanner
```

---

### 📝 ed-ms-notas

Microservicio encargado de la gestión de las calificaciones académicas.

Permite administrar y consultar las notas correspondientes a los procesos académicos de los estudiantes.

---

### 🤖 ed-ms-ia

Microservicio encargado de integrar las funcionalidades de Inteligencia Artificial de EduPlanner.

Este componente se comunica con el servidor MCP para utilizar herramientas relacionadas con la generación y validación de horarios.

La comunicación permite que el usuario pueda realizar solicitudes relacionadas con la planificación académica mediante lenguaje natural.

---

### 🔌 ed-ms-mcp

Servidor **Model Context Protocol (MCP)** utilizado para proporcionar herramientas especializadas al componente de Inteligencia Artificial.

Entre sus responsabilidades se encuentra la generación automatizada de horarios considerando diferentes restricciones académicas.

El servidor MCP expone herramientas utilizadas por el agente de IA para consultar información y ejecutar procesos relacionados con la planificación de horarios.

Endpoint utilizado durante el desarrollo:

```text
http://127.0.0.1:8000/mcp
```

---

### ⚙️ ed-ms-configuracion-institucional

Componente destinado a la gestión de configuraciones propias de la institución educativa.

Permite mantener información de configuración utilizada por la plataforma.

---

### 📦 ed-lib-common

Biblioteca compartida entre los diferentes microservicios.

Contiene elementos comunes como:

* DTOs.
* Entidades compartidas.
* Enumeraciones.
* Estructuras comunes.

La biblioteca no contiene lógica de negocio, con el objetivo de mantener separadas las responsabilidades de cada microservicio.

---

# 🤖 Generación automática de horarios

Una de las funcionalidades principales de EduPlanner es la generación automatizada de horarios.

El sistema utiliza un algoritmo de búsqueda con **backtracking**, integrado mediante el servidor MCP y el microservicio de Inteligencia Artificial.

Durante la generación se tienen en cuenta diferentes restricciones académicas, entre ellas:

* Disponibilidad de los docentes.
* Evitar cruces de docentes.
* Evitar cruces de cursos.
* Horas máximas diarias por docente.
* Horas máximas semanales por docente.
* Cantidad de horas requeridas por asignatura.
* Jornada académica.
* Bloques horarios disponibles.
* Periodos de descanso.
* Compatibilidad entre cursos y bloques horarios.
* Distribución de las horas de una asignatura durante la semana.

El proceso de generación produce un horario que posteriormente es almacenado por el microservicio de **Gestión Académica**.

> El servidor MCP participa en la generación y validación de la información, mientras que la persistencia definitiva de los horarios corresponde al microservicio de Gestión Académica.

---

# 📄 Generación de horarios en PDF

EduPlanner permite generar los horarios en formato PDF para facilitar su consulta y distribución.

La generación del documento utiliza **Thymeleaf** como motor de plantillas.

El formato está diseñado para utilizar una hoja:

```text
A4 - Horizontal
```

El documento contiene información como:

* Fecha de generación.
* Curso.
* Periodo académico.
* Docente.
* Estudiante.
* Horas de clase.
* Horario correspondiente de lunes a viernes.

---

# 🔐 Seguridad

La seguridad de la plataforma se basa principalmente en:

* Autenticación mediante JWT.
* Validación de tokens.
* Control de acceso según roles.
* Comunicación segura entre componentes.
* Validación de identidad del usuario.
* Protección de endpoints internos.

La identidad del usuario debe obtenerse a partir del token autenticado, evitando confiar directamente en identificadores enviados desde el frontend para operaciones que requieran validar permisos.

---

# 🛠️ Tecnologías utilizadas

## Frontend

* Angular
* TypeScript
* HTML5
* CSS
* WebSocket

## Backend

* Java
* Spring Boot
* Spring Cloud
* Spring Data JPA
* Spring Security
* OpenFeign
* Consul
* Thymeleaf

## Inteligencia Artificial

* Python
* CrewAI
* Model Context Protocol (MCP)
* Algoritmo de backtracking

## Base de datos

* MySQL

## Almacenamiento

* Cloudinary para fotografías de perfil.

## Infraestructura

* Docker
* Docker Compose
* Nginx
* API Gateway

---

# 📂 Estructura del proyecto

```text
EduPlanner/
│
├── ed-frontend/
│   └── Aplicación web Angular
│
├── ed-gateway/
│   └── API Gateway
│
├── ed-ms-autenticacion/
│   └── Microservicio de autenticación
│
├── ed-ms-administracion/
│   └── Microservicio administrativo
│
├── ed-ms-gestion-academica/
│   └── Gestión académica y horarios
│
├── ed-ms-notas/
│   └── Gestión de calificaciones
│
├── ed-ms-ia/
│   └── Integración con Inteligencia Artificial
│
├── ed-ms-mcp/
│   └── Servidor MCP y herramientas de generación
│
├── ed-ms-configuracion-institucional/
│   └── Configuración institucional
│
├── ed-lib-common/
│   └── Componentes compartidos
│
├── database/
│   └── Scripts de inicialización de base de datos
│
└── docker-compose.yml
```

---

# 🐳 Ejecución mediante Docker

EduPlanner puede ser desplegado mediante contenedores Docker utilizando Docker Compose.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al proyecto:

```bash
cd EduPlanner
```

### 2. Configurar las variables de entorno

Crear o configurar el archivo:

```text
.env
```

con las variables necesarias para la ejecución del proyecto, incluyendo las credenciales y configuraciones de:

* MySQL.
* Servicios backend.
* JWT.
* Cloudinary.
* Inteligencia Artificial.
* MCP.
* Gateway.

# 🗄️ Base de datos

EduPlanner utiliza **MySQL** para la persistencia de la información.

La estructura de datos se encuentra organizada de acuerdo con las responsabilidades de los diferentes componentes del sistema.

Entre las estructuras utilizadas para la gestión académica se encuentran:

* `academic_period`
* `academic_level`
* `school_shift`
* `course`
* `subject`
* `academic_teacher`
* `teacher_availability`
* `academic_load`
* `schedule_generation`
* `schedule_generation_course`
* `schedule`

Los scripts de inicialización se encuentran dentro del directorio:

```text
database/
```

Estos scripts permiten preparar la estructura y los datos necesarios para la ejecución del sistema.

---

# 🌐 Comunicación entre microservicios

Los microservicios se comunican mediante diferentes mecanismos dependiendo de la operación.

Entre ellos se utilizan:

* REST APIs.
* OpenFeign.
* Consul para descubrimiento de servicios.
* API Gateway.
* WebSocket para notificaciones.
* MCP para la comunicación con herramientas de Inteligencia Artificial.

Esta arquitectura permite mantener separados los diferentes módulos y facilita la comunicación entre ellos.

---

# 👨‍💻 Desarrollo

Para trabajar con el proyecto se recomienda contar con:

* Java JDK 21.
* Node.js y npm.
* Angular CLI.
* Python 3.12.
* MySQL.
* Docker.
* Docker Compose.
* Git.

También se recomienda utilizar un IDE como:

* Visual Studio Code.
* IntelliJ IDEA.
* Eclipse.

---

# 🧪 Pruebas

Durante el desarrollo se utilizaron herramientas como **Hoppscotch** para realizar pruebas de los endpoints REST y verificar la comunicación de los diferentes microservicios.

También se realizaron pruebas de:

* Autenticación.
* Gestión de usuarios.
* Gestión académica.
* Generación de horarios.
* Publicación de horarios.
* Comunicación entre microservicios.
* Notificaciones WebSocket.
* Generación de documentos PDF.
* Integración entre IA y MCP.

---

# 🚀 Flujo general del sistema

El funcionamiento general de EduPlanner puede resumirse de la siguiente manera:

```text
Usuario
   │
   ▼
Frontend Angular
   │
   ▼
API Gateway
   │
   ├──────────────► Autenticación
   │
   ├──────────────► Administración
   │
   ├──────────────► Gestión Académica
   │                       │
   │                       ▼
   │                Generación de horario
   │                       ▲
   │                       │
   │                IA + MCP Server
   │
   ├──────────────► Notas
   │
   └──────────────► Configuración
                           │
                           ▼
                         MySQL
```

Una vez generado y publicado un horario, los usuarios relacionados pueden consultar su información y recibir notificaciones cuando se produzcan actualizaciones.

---

# 📌 Estado del proyecto

EduPlanner corresponde a un proyecto académico/productivo desarrollado como solución integral para la gestión de procesos educativos.

El proyecto cuenta con los principales módulos de:

* Autenticación.
* Administración.
* Gestión académica.
* Gestión de notas.
* Inteligencia Artificial.
* Generación automática de horarios.
* Notificaciones en tiempo real.
* Configuración institucional.
* Generación de documentos PDF.

Por limitaciones de tiempo durante la etapa final del proyecto, algunas funcionalidades inicialmente contempladas quedaron pendientes de implementación completa, particularmente:

* Gestión del sistema.
* Módulo de horario de emergencia.

Las demás funcionalidades desarrolladas fueron integradas y probadas como parte de la solución final.

---

# 👩‍💻 Equipo de desarrollo

Proyecto desarrollado por:

* **María José Rojas**
* **Kariangel Silva**
* **Stefania Puerta**
* **Jeidy Córdoba**

---

# 📜 Licencia

Este proyecto fue desarrollado con fines académicos como parte del proceso de formación en **Análisis y Desarrollo de Software**.

Su uso, distribución o modificación deberá realizarse de acuerdo con las condiciones establecidas por los autores y la institución correspondiente.

---

# 💚 EduPlanner

**EduPlanner — Tecnología para una gestión académica más organizada.**
