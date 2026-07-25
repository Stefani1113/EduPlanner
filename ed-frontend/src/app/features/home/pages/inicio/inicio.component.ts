import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

  preguntasFrecuentes = [
    {
      texto: '¿Los pilares fundamentales de nuestro sistema institución, permitirán mejorar la organización y la gestión de los procesos dentro de la institución?',
      respuesta: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, excepturi nesciunt natus iste culpa quisquam voluptas facere perspiciatis dolorem alias voluptates enim fuga amet, quaerat dolore repellendus deleniti necessitatibus odit obcaecati! Sint officia tempore assumenda porro incidunt quos vel voluptatum.',
      abierta: false
    },
    {
      texto: '¿Los pilares fundamentales de nuestro sistema institución, permitirán mejorar la organización y la gestión de los procesos dentro de la institución?',
      respuesta: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, excepturi nesciunt natus iste culpa quisquam voluptas facere perspiciatis dolorem alias voluptates enim fuga amet, quaerat dolore repellendus deleniti necessitatibus odit obcaecati! Sint officia tempore assumenda porro incidunt quos vel voluptatum.',
      abierta: false
    },
    {
      texto: '¿Los pilares fundamentales de nuestro sistema institución, permitirán mejorar la organización y la gestión de los procesos dentro de la institución?',
      respuesta: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, excepturi nesciunt natus iste culpa quisquam voluptas facere perspiciatis dolorem alias voluptates enim fuga amet, quaerat dolore repellendus deleniti necessitatibus odit obcaecati! Sint officia tempore assumenda porro incidunt quos vel voluptatum.',
      abierta: false
    },
    {
      texto: '¿Los pilares fundamentales de nuestro sistema institución, permitirán mejorar la organización y la gestión de los procesos dentro de la institución?',
      respuesta: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, excepturi nesciunt natus iste culpa quisquam voluptas facere perspiciatis dolorem alias voluptates enim fuga amet, quaerat dolore repellendus deleniti necessitatibus odit obcaecati! Sint officia tempore assumenda porro incidunt quos vel voluptatum.',
      abierta: false
    }
  ];

  toggleFaq(index: number) {
    this.preguntasFrecuentes[index].abierta = !this.preguntasFrecuentes[index].abierta;
  }
}