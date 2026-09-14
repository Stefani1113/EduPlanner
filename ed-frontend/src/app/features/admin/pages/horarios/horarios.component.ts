import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HorariosService,
  MensajeIA
} from '../../services/horarios.service';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss']
})
export class HorariosComponent implements OnInit {

  chatAbierto = false;
  mensaje = '';
  cargando = false;
  mensajes: MensajeIA[] = [];
  emocionActual = 'normal';
  diaSeleccionado = 'Martes';

  horarios = [
    {
      hora: '6:00 am',
      horaFin: '7:00 am',
      lunes: 'Matemáticas',
      martes: 'Inglés',
      miercoles: 'Programación',
      jueves: 'Ciencias',
      viernes: 'Español',
      descanso: false
    },
    {
      hora: '7:00 am',
      horaFin: '8:00 am',
      lunes: 'Inglés',
      martes: 'Matemáticas',
      miercoles: 'Base de Datos',
      jueves: 'Programación',
      viernes: 'Sociales',
      descanso: false
    },
    {
      hora: '8:00 am',
      horaFin: '9:00 am',
      lunes: 'Programación',
      martes: 'Ciencias',
      miercoles: 'Matemáticas',
      jueves: 'Inglés',
      viernes: 'Educación Física',
      descanso: false
    },
    {
      hora: '9:00 am',
      horaFin: '10:00 am',
      lunes: 'Base de Datos',
      martes: 'Español',
      miercoles: 'Inglés',
      jueves: 'Matemáticas',
      viernes: 'Programación',
      descanso: false
    },
    {
      hora: '10:00 am',
      horaFin: '10:30 am',
      lunes: '',
      martes: '',
      miercoles: '',
      jueves: '',
      viernes: '',
      descanso: true
    },
    {
      hora: '11:00 am',
      horaFin: '12:00 pm',
      lunes: 'Ciencias',
      martes: 'Programación',
      miercoles: 'Sociales',
      jueves: 'Base de Datos',
      viernes: 'Matemáticas',
      descanso: false
    }
  ];

  constructor(
    private horariosService: HorariosService
  ) {}

  ngOnInit(): void {
    this.mensajes = this.horariosService.obtenerMensajeInicial();
  }

  seleccionarDia(dia: string): void {
    this.diaSeleccionado = dia;
  }

  abrirChat(): void {
    this.chatAbierto = true;
    if (this.mensajes.length === 0) {
      this.mensajes = this.horariosService.obtenerMensajeInicial();
    }
    this.emocionActual = 'normal';
  }

  cerrarChat(): void {
    this.chatAbierto = false;
    this.emocionActual = 'normal';
  }

  enviarMensaje(): void {
    const texto = this.mensaje.trim();
    if (!texto || this.cargando) {
      return;
    }

    this.mensajes.push({
      tipo: 'usuario',
      texto
    });

    this.mensaje = '';
    this.cargando = true;
    this.emocionActual = 'pensando';

    setTimeout(() => {
      const respuesta = this.horariosService.generarRespuesta(texto);
      this.mensajes.push({
        tipo: 'ia',
        texto: respuesta.texto
      });
      this.emocionActual = respuesta.emocion;
      this.cargando = false;
    }, 700);
  }

  obtenerImagenIA(): string {
    return `/assets/ia/ia-ordinary.png`;
  }

  usarPregunta(pregunta: string): void {
    this.mensaje = pregunta;
    this.enviarMensaje();
  }
}