import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ImportacionService,
  ImportReport
} from '../../services/importacion.service';

import { ModalService } from '../../../../core/services/modal.service';

type TipoError =
  | 'DUPLICADO'
  | 'FILA_INCOMPLETA'
  | 'FORMATO_INVALIDO'
  | 'RESTRICCION'
  | 'OTRO';

@Component({
  selector: 'app-importacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.scss']
})
export class ImportacionComponent {

  archivo: File | null = null;

  cargando = false;

  vista: 'formulario' | 'reporte' = 'formulario';

  reporte: ImportReport | null = null;

  errorGeneral = '';

  arrastrando = false;

  readonly extensionesPermitidas = ['.csv'];

  readonly tamanoMaximoMB = 10;

  constructor(
    private service: ImportacionService,
    private modalService: ModalService
  ) {}

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0] ?? null;

    this.procesarArchivo(file);

    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.cargando) {
      this.arrastrando = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.arrastrando = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.arrastrando = false;

    if (this.cargando) {
      return;
    }

    const file =
      event.dataTransfer?.files?.[0] ?? null;

    this.procesarArchivo(file);
  }

  quitarArchivo(): void {
    if (this.cargando) {
      return;
    }

    this.archivo = null;
    this.errorGeneral = '';
  }

  importar(): void {
    if (this.cargando) {
      return;
    }

    if (!this.archivo) {
      this.modalService.warning(
        'Seleccione un archivo CSV antes de continuar.'
      );
      return;
    }

    const validacion =
      this.validarArchivo(this.archivo);

    if (validacion) {
      this.errorGeneral = validacion;

      this.modalService.warning(
        validacion
      );

      return;
    }

    this.cargando = true;
    this.errorGeneral = '';
    this.reporte = null;

    this.service
      .importarEstudiantes(this.archivo)
      .subscribe({

        next: resp => {
          const idImport =
            Number(resp?.data?.idImport);

          if (
            !Number.isInteger(idImport) ||
            idImport <= 0
          ) {
            this.cargando = false;

            this.modalService.error(
              resp?.message ||
              'La importación terminó, pero el servidor no devolvió el identificador del reporte.'
            );

            return;
          }

          this.verReporte(idImport);
        },

        error: err => {
          this.cargando = false;

          this.errorGeneral =
            this.obtenerMensajeError(
              err,
              'No se pudo procesar el archivo.'
            );

          this.modalService.error(
            this.errorGeneral
          );
        }

      });
  }

  verReporte(idImport: number): void {
    if (
      !Number.isInteger(idImport) ||
      idImport <= 0
    ) {
      this.cargando = false;

      this.errorGeneral =
        'El identificador de la importación no es válido.';

      return;
    }

    this.cargando = true;
    this.errorGeneral = '';

    this.service
      .obtenerReporte(idImport)
      .subscribe({

        next: resp => {
          this.reporte =
            this.normalizarReporte(
              resp?.data
            );

          this.cargando = false;

          if (!this.reporte) {
            this.errorGeneral =
              'El servidor no devolvió un reporte válido.';

            this.modalService.error(
              this.errorGeneral
            );

            return;
          }

          this.vista = 'reporte';
        },

        error: err => {
          this.cargando = false;

          this.errorGeneral =
            this.obtenerMensajeError(
              err,
              'La importación fue procesada, pero no se pudo consultar el reporte.'
            );

          this.modalService.error(
            this.errorGeneral
          );
        }

      });
  }

  volver(): void {
    if (this.cargando) {
      return;
    }

    this.vista = 'formulario';

    this.reporte = null;

    this.archivo = null;

    this.errorGeneral = '';
  }

  porcentajeExito(): number {
    if (
      !this.reporte ||
      this.reporte.totalRows <= 0
    ) {
      return 0;
    }

    return Math.round(
      (
        this.reporte.successRows /
        this.reporte.totalRows
      ) * 100
    );
  }

  mensajeAmigable(
    mensaje: string
  ): string {
    return (
      mensaje ||
      'Ocurrió un error al procesar la fila.'
    );
  }

  private procesarArchivo(
    file: File | null
  ): void {
    this.errorGeneral = '';

    if (!file) {
      return;
    }

    const error =
      this.validarArchivo(file);

    if (error) {
      this.archivo = null;

      this.errorGeneral = error;

      this.modalService.warning(
        error
      );

      return;
    }

    this.archivo = file;
  }

  private validarArchivo(
    file: File
  ): string | null {

    const nombre =
      file.name.toLowerCase();

    const extensionValida =
      this.extensionesPermitidas.some(
        ext => nombre.endsWith(ext)
      );

    if (!extensionValida) {
      return 'El archivo debe estar en formato CSV.';
    }

    if (file.size === 0) {
      return 'El archivo está vacío.';
    }

    const tamanoMaximo =
      this.tamanoMaximoMB *
      1024 *
      1024;

    if (file.size > tamanoMaximo) {
      return `El archivo supera el tamaño máximo permitido de ${this.tamanoMaximoMB} MB.`;
    }

    return null;
  }

  private normalizarReporte(
    reporte:
      ImportReport |
      null |
      undefined
  ): ImportReport | null {

    if (!reporte) {
      return null;
    }

    return {
      idImport:
        Number(reporte.idImport),

      fileName:
        reporte.fileName ||
        'Archivo sin nombre',

      importDate:
        reporte.importDate || '',

      totalRows:
        Number(reporte.totalRows) || 0,

      successRows:
        Number(reporte.successRows) || 0,

      failedRows:
        Number(reporte.failedRows) || 0,

      errors:
        Array.isArray(reporte.errors)
          ? reporte.errors
          : []
    };
  }

  private obtenerMensajeError(
    err: any,
    mensajePorDefecto: string
  ): string {

    return (
      err?.error?.message ||
      err?.message ||
      mensajePorDefecto
    );
  }

  private clasificar(
    mensaje: string
  ): {
    tipo: TipoError;
    campo: string | null;
  } {

    const texto =
      (mensaje || '').toLowerCase();

    if (
      texto.includes('ya está registrado') ||
      texto.includes('ya esta registrado') ||
      texto.includes('duplicado')
    ) {

      if (texto.includes('correo')) {
        return {
          tipo: 'DUPLICADO',
          campo: 'Correo'
        };
      }

      if (texto.includes('documento')) {
        return {
          tipo: 'DUPLICADO',
          campo: 'Documento'
        };
      }

      if (
        texto.includes('celular') ||
        texto.includes('teléfono') ||
        texto.includes('telefono')
      ) {
        return {
          tipo: 'DUPLICADO',
          campo: 'Teléfono'
        };
      }

      return {
        tipo: 'DUPLICADO',
        campo: null
      };
    }

    if (
      texto.includes('la fila tiene') &&
      texto.includes('columnas')
    ) {
      return {
        tipo: 'FILA_INCOMPLETA',
        campo: null
      };
    }

    if (
      texto.includes('fecha de nacimiento') ||
      texto.includes('could not be parsed') ||
      texto.includes('datetimeparseexception')
    ) {
      return {
        tipo: 'FORMATO_INVALIDO',
        campo: 'Fecha de nacimiento'
      };
    }

    if (texto.includes('estrato')) {
      return {
        tipo: 'FORMATO_INVALIDO',
        campo: 'Estrato'
      };
    }

    if (
      texto.includes('tipo de documento')
    ) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Tipo de documento'
      };
    }

    if (texto.includes('género')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Género'
      };
    }

    if (
      texto.includes('tipo de sangre')
    ) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Tipo de sangre'
      };
    }

    if (
      texto.includes('correo electrónico')
    ) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Correo'
      };
    }

    if (texto.includes('celular')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Celular'
      };
    }

    if (texto.includes('acudiente')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Acudiente'
      };
    }

    if (texto.includes('dirección')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Dirección'
      };
    }

    if (texto.includes('nombre')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Nombre'
      };
    }

    if (texto.includes('apellidos')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Apellidos'
      };
    }

    if (texto.includes('documento')) {
      return {
        tipo: 'RESTRICCION',
        campo: 'Documento'
      };
    }

    return {
      tipo: 'OTRO',
      campo: null
    };
  }

  etiquetaTipoError(
    mensaje: string
  ): string {

    const tipo =
      this.clasificar(mensaje).tipo;

    if (tipo === 'DUPLICADO') {
      return 'Duplicado';
    }

    if (tipo === 'FILA_INCOMPLETA') {
      return 'Fila incompleta';
    }

    if (tipo === 'FORMATO_INVALIDO') {
      return 'Formato inválido';
    }

    if (tipo === 'RESTRICCION') {
      return 'Restricción incumplida';
    }

    return 'Otro error';
  }

  claseTipoError(
    mensaje: string
  ): string {

    const tipo =
      this.clasificar(mensaje).tipo;

    if (tipo === 'DUPLICADO') {
      return 'badge-duplicado';
    }

    if (tipo === 'FILA_INCOMPLETA') {
      return 'badge-fila';
    }

    if (tipo === 'FORMATO_INVALIDO') {
      return 'badge-formato';
    }

    if (tipo === 'RESTRICCION') {
      return 'badge-restriccion';
    }

    return 'badge-otro';
  }

  campoAfectado(
    mensaje: string
  ): string {

    return (
      this.clasificar(mensaje).campo ||
      '—'
    );
  }
}