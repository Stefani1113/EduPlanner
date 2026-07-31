import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

closeMenu() {
  this.menuOpen = false;
}

preguntasFrecuentes = [
  {
    texto: '¿Qué problema busca solucionar EduPlanner?',
    respuesta: 'EduPlanner busca optimizar la gestión académica de las instituciones educativas, automatizando la generación de horarios, el control de asistencia y la organización de la información institucional en una sola plataforma.',
    abierta: false
  },
  {
    texto: '¿Cómo utiliza EduPlanner la Inteligencia Artificial?',
    respuesta: 'EduPlanner utiliza inteligencia artificial para encontrar las combinaciones más eficientes al generar horarios académicos, reduciendo conflictos de espacios, docentes y grupos, y optimizando el uso de los recursos institucionales.',
    abierta: false
  },
  {
    texto: '¿EduPlanner se encarga de toda la gestión de una institución educativa?',
    respuesta: 'EduPlanner centraliza los procesos más importantes, como la gestión de horarios, asistencia, notas y reportes, ofreciendo una solución integral y accesible para toda la comunidad educativa.',
    abierta: false
  },
  {
    texto: '¿Qué beneficios ofrece EduPlanner frente a realizarlo manualmente?',
    respuesta: 'Ahorra tiempo, reduce errores humanos, centraliza la información académica en un solo lugar y facilita el acceso, la organización y la consulta de datos para toda la institución.',
    abierta: false
  }
];

toggleFaq(index: number) {
  this.preguntasFrecuentes[index].abierta = !this.preguntasFrecuentes[index].abierta;
}
}