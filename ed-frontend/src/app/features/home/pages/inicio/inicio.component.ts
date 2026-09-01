import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

  constructor(
    private modalService: ModalService
  ) {}

menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

closeMenu() {
  this.menuOpen = false;
}

irA(idSeccion: string, event?: Event): void {
  if (event) {
    event.preventDefault();
  }

  const elemento = document.getElementById(idSeccion);

  if (elemento) {
    elemento.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  this.closeMenu();
}


  // ==========================================================
  // EmailJS: reemplaza estos 3 valores con los de tu cuenta
  // (los obtienes gratis en https://www.emailjs.com)
  // ==========================================================
  private readonly EMAILJS_SERVICE_ID = 'TU_SERVICE_ID';
  private readonly EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
  private readonly EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY';


  private readonly ASUNTOS: Record<string, string> = {
    soporte: 'Soporte técnico',
    cuenta: 'Problemas con mi cuenta',
    sugerencia: 'Sugerencia',
    otro: 'Otro'
  };


  formularioSoporte = {
    nombreRemitente: '',
    emailSoporte: '',
    asuntoSoporte: '',
    mensajeSoporte: ''
  };

  enviandoSoporte = false;


  enviarSoporte(): void {

    const formulario = this.formularioSoporte;

    if (
      !formulario.nombreRemitente.trim() ||
      !formulario.emailSoporte.trim() ||
      !formulario.asuntoSoporte ||
      !formulario.mensajeSoporte.trim()
    ) {
      this.modalService.warning(
        'Por favor completa todos los campos antes de enviar tu mensaje.'
      );
      return;
    }

    this.enviandoSoporte = true;

    const parametros = {
      from_name: formulario.nombreRemitente.trim(),
      from_email: formulario.emailSoporte.trim(),
      subject: this.ASUNTOS[formulario.asuntoSoporte] || formulario.asuntoSoporte,
      message: formulario.mensajeSoporte.trim()
    };

    emailjs
      .send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        parametros,
        { publicKey: this.EMAILJS_PUBLIC_KEY }
      )
      .then(() => {
        this.enviandoSoporte = false;

        this.modalService.success(
          'Tu mensaje fue enviado correctamente. Te responderemos pronto.'
        );

        this.formularioSoporte = {
          nombreRemitente: '',
          emailSoporte: '',
          asuntoSoporte: '',
          mensajeSoporte: ''
        };
      })
      .catch(err => {
        this.enviandoSoporte = false;

        console.error('Error enviando soporte:', err);

        this.modalService.error(
          'No se pudo enviar tu mensaje. Inténtalo nuevamente en unos minutos.'
        );
      });
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