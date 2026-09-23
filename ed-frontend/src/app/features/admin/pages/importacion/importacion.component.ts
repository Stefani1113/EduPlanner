import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ImportacionService,
  ImportReport
} from '../../services/importacion.service';

interface ErrorImportacion {
  rowNumber: number;
  rowData?: string;
  error: string;
}

interface ReporteImportacion {
  idImport: number;
  fileName: string;
  importDate: string | Date;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ErrorImportacion[];
}

interface EstudianteImportado {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  lugarExpedicionDocumento: string;
  genero: string;
  fechaNacimiento: string;
  direccion: string;
  tipoSangre: string;
  discapacidades: string;
  estrato: string;
  tipoPoblacion: string;
  regimenSalud: string;
  eps: string;
  nombreAcudiente: string;
  telefonoAcudiente: string;
  idCurso: number | null;
}

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

  @Output() importarCompletado = new EventEmitter<void>();

  vista: 'formulario' | 'reporte' = 'formulario';

  archivo: File | null = null;

  arrastrando = false;
  cargando = false;

  errorGeneral = '';

  tamanoMaximoMB = 10;

  reporte: ReporteImportacion | null = null;

  estudiantes: EstudianteImportado[] = [];

  contadorImportacion = 1;

  columnasEsperadas: string[] = [
    'nombre',
    'apellidos',
    'correo',
    'telefono',
    'documento',
    'tipo_documento',
    'lugar_expedicion_documento',
    'genero',
    'fecha_nacimiento',
    'direccion',
    'tipo_sangre',
    'discapacidades',
    'estrato',
    'tipo_poblacion',
    'regimen_salud',
    'eps',
    'nombre_acudiente',
    'telefono_acudiente',
    'id_curso'
  ];

  constructor(
    private importacionService: ImportacionService
  ) {}

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.procesarArchivo(file);

    input.value = '';
  }

  procesarArchivo(file: File): void {
    this.errorGeneral = '';

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.errorGeneral = 'Solo se permiten archivos CSV.';
      this.archivo = null;
      return;
    }

    const tamanoMB = file.size / (1024 * 1024);

    if (tamanoMB > this.tamanoMaximoMB) {
      this.errorGeneral =
        `El archivo supera el tamaño máximo permitido de ${this.tamanoMaximoMB} MB.`;

      this.archivo = null;
      return;
    }

    this.archivo = file;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.cargando) {
      return;
    }

    this.arrastrando = true;
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

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.procesarArchivo(files[0]);
  }

  quitarArchivo(): void {
    if (this.cargando) {
      return;
    }

    this.archivo = null;
    this.errorGeneral = '';
    this.estudiantes = [];
  }

  importar(): void {
    this.errorGeneral = '';

    if (!this.archivo) {
      this.errorGeneral = 'Selecciona un archivo CSV antes de importar.';
      return;
    }

    if (this.cargando) {
      return;
    }

    this.validarCSVAntesDeEnviar(this.archivo);
  }

  private validarCSVAntesDeEnviar(file: File): void {
    this.cargando = true;
    this.errorGeneral = '';

    const reader = new FileReader();

    reader.onload = (): void => {
      try {
        const contenido = String(reader.result ?? '');

        const valido = this.validarEstructuraCSV(contenido);

        if (!valido) {
          this.cargando = false;
          return;
        }

        this.estudiantes = this.extraerEstudiantes(contenido);

        if (this.estudiantes.length === 0) {
          this.errorGeneral =
            'El archivo CSV no contiene registros de estudiantes válidos.';
          this.cargando = false;
          return;
        }

        this.enviarArchivo(file);

      } catch (error) {
        this.cargando = false;

        this.errorGeneral =
          this.obtenerMensajeError(error);
      }
    };

    reader.onerror = (): void => {
      this.cargando = false;

      this.errorGeneral =
        'No fue posible leer el archivo CSV.';
    };

    reader.readAsText(file, 'UTF-8');
  }

  private enviarArchivo(file: File): void {
    this.importacionService.importarEstudiantes(file).subscribe({
      next: (respuesta): void => {

        const idImport = Number(respuesta.data);

        if (!idImport || Number.isNaN(idImport)) {
          this.cargando = false;

          this.errorGeneral =
            'El servidor no devolvió un identificador de importación válido.';

          return;
        }

        this.obtenerReporte(idImport, file.name);
      },

      error: (error): void => {
        this.cargando = false;

        this.errorGeneral =
          this.obtenerMensajeError(error);
      }
    });
  }

  private obtenerReporte(
    idImport: number,
    nombreArchivo: string
  ): void {

    this.importacionService.obtenerReporte(idImport).subscribe({
      next: (respuesta): void => {

        this.reporte = this.convertirReporte(
          respuesta.data,
          nombreArchivo
        );

        this.vista = 'reporte';
        this.cargando = false;

        this.contadorImportacion++;

        this.importarCompletado.emit();
      },

      error: (error): void => {
        this.cargando = false;

        this.errorGeneral =
          this.obtenerMensajeError(error);
      }
    });
  }

  private convertirReporte(
    reporte: ImportReport,
    nombreArchivo: string
  ): ReporteImportacion {

    return {
      idImport: reporte.idImport,
      fileName: reporte.fileName || nombreArchivo,
      importDate: reporte.importDate,
      totalRows: Number(reporte.totalRows) || 0,
      successRows: Number(reporte.successRows) || 0,
      failedRows: Number(reporte.failedRows) || 0,
      errors: Array.isArray(reporte.errors)
        ? reporte.errors.map((error): ErrorImportacion => ({
            rowNumber: Number(error.rowNumber) || 0,
            rowData: error.rowData || '',
            error: error.error || ''
          }))
        : []
    };
  }

  private validarEstructuraCSV(contenido: string): boolean {

    const lineas = contenido
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map(linea => linea.trim())
      .filter(linea => linea.length > 0);

    if (lineas.length < 2) {
      this.errorGeneral =
        'El archivo CSV debe contener encabezados y al menos un estudiante.';

      return false;
    }

    const separador = this.detectarSeparador(lineas[0]);

    const encabezados = this.parsearLinea(
      lineas[0],
      separador
    ).map(encabezado =>
      this.normalizarEncabezado(encabezado)
    );

    if (encabezados.length !== this.columnasEsperadas.length) {
      this.errorGeneral =
        `El archivo debe contener exactamente ${this.columnasEsperadas.length} columnas. Se encontraron ${encabezados.length}.`;

      return false;
    }

    const columnasFaltantes = this.columnasEsperadas.filter(
      columna => !encabezados.includes(columna)
    );

    if (columnasFaltantes.length > 0) {
      this.errorGeneral =
        `Faltan columnas obligatorias: ${columnasFaltantes.join(', ')}.`;

      return false;
    }

    const columnasExtra = encabezados.filter(
      encabezado => !this.columnasEsperadas.includes(encabezado)
    );

    if (columnasExtra.length > 0) {
      this.errorGeneral =
        `El archivo contiene columnas no permitidas: ${columnasExtra.join(', ')}.`;

      return false;
    }

    return true;
  }

  private extraerEstudiantes(
    contenido: string
  ): EstudianteImportado[] {

    const lineas = contenido
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter(linea => linea.trim().length > 0);

    if (lineas.length < 2) {
      return [];
    }

    const separador = this.detectarSeparador(lineas[0]);

    const encabezados = this.parsearLinea(
      lineas[0],
      separador
    ).map(encabezado =>
      this.normalizarEncabezado(encabezado)
    );

    const estudiantes: EstudianteImportado[] = [];

    for (let i = 1; i < lineas.length; i++) {

      const valores = this.parsearLinea(
        lineas[i],
        separador
      );

      if (
        valores.length === 0 ||
        valores.every(valor => valor.trim() === '')
      ) {
        continue;
      }

      const registro: Record<string, string> = {};

      encabezados.forEach((encabezado, indice) => {
        registro[encabezado] =
          (valores[indice] ?? '').trim();
      });

      const estudiante: EstudianteImportado = {
        nombre: registro['nombre'] || '',
        apellidos: registro['apellidos'] || '',
        correo: registro['correo'] || '',
        telefono: registro['telefono'] || '',
        documento: registro['documento'] || '',
        tipoDocumento: registro['tipo_documento'] || '',
        lugarExpedicionDocumento:
          registro['lugar_expedicion_documento'] || '',
        genero: registro['genero'] || '',
        fechaNacimiento:
          this.convertirFechaCSV(
            registro['fecha_nacimiento'] || ''
          ),
        direccion: registro['direccion'] || '',
        tipoSangre: registro['tipo_sangre'] || '',
        discapacidades:
          registro['discapacidades'] || '',
        estrato: registro['estrato'] || '',
        tipoPoblacion:
          registro['tipo_poblacion'] || '',
        regimenSalud:
          registro['regimen_salud'] || '',
        eps: registro['eps'] || '',
        nombreAcudiente:
          registro['nombre_acudiente'] || '',
        telefonoAcudiente:
          registro['telefono_acudiente'] || '',
        idCurso:
          this.convertirNumero(
            registro['id_curso'] || ''
          )
      };

      estudiantes.push(estudiante);
    }

    return estudiantes;
  }

  private detectarSeparador(linea: string): string {

    const comas = (linea.match(/,/g) || []).length;
    const puntosComa = (linea.match(/;/g) || []).length;

    return puntosComa > comas ? ';' : ',';
  }

  private parsearLinea(
    linea: string,
    separador: string
  ): string[] {

    const resultado: string[] = [];

    let valorActual = '';
    let dentroComillas = false;

    for (let i = 0; i < linea.length; i++) {

      const caracter = linea[i];

      if (caracter === '"') {

        if (
          dentroComillas &&
          linea[i + 1] === '"'
        ) {
          valorActual += '"';
          i++;
        } else {
          dentroComillas = !dentroComillas;
        }

      } else if (
        caracter === separador &&
        !dentroComillas
      ) {

        resultado.push(valorActual);
        valorActual = '';

      } else {

        valorActual += caracter;
      }
    }

    resultado.push(valorActual);

    return resultado;
  }

  private normalizarEncabezado(
    encabezado: string
  ): string {

    return encabezado
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  private convertirFechaCSV(
    fecha: string
  ): string {

    const valor = fecha.trim();

    if (!valor) {
      return '';
    }

    let dia = '';
    let mes = '';
    let anio = '';

    const partes = valor.split(/[\/-]/);

    if (partes.length === 3) {

      if (partes[0].length === 4) {
        anio = partes[0];
        mes = partes[1];
        dia = partes[2];
      } else {
        dia = partes[0];
        mes = partes[1];
        anio = partes[2];
      }
    }

    if (
      !dia ||
      !mes ||
      !anio
    ) {
      return valor;
    }

    if (anio.length === 2) {
      anio =
        Number(anio) >= 50
          ? `19${anio}`
          : `20${anio}`;
    }

    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  private convertirNumero(
    valor: string
  ): number | null {

    const numero = Number(
      valor.trim()
    );

    return Number.isFinite(numero)
      ? numero
      : null;
  }

  porcentajeExito(): number {

    if (!this.reporte || this.reporte.totalRows <= 0) {
      return 0;
    }

    return Math.round(
      (
        this.reporte.successRows /
        this.reporte.totalRows
      ) * 100
    );
  }

  claseTipoError(error: string): string {

    const tipo = this.detectarTipoError(error);

    switch (tipo) {
      case 'correo':
        return 'error-correo';

      case 'documento':
        return 'error-documento';

      case 'curso':
        return 'error-curso';

      case 'datos':
        return 'error-datos';

      default:
        return 'error-general';
    }
  }

  etiquetaTipoError(error: string): string {

    const tipo = this.detectarTipoError(error);

    switch (tipo) {
      case 'correo':
        return 'Correo';

      case 'documento':
        return 'Documento';

      case 'curso':
        return 'Curso';

      case 'datos':
        return 'Datos';

      default:
        return 'Error';
    }
  }

  campoAfectado(error: string): string {

    const tipo = this.detectarTipoError(error);

    switch (tipo) {
      case 'correo':
        return 'correo';

      case 'documento':
        return 'documento';

      case 'curso':
        return 'id_curso';

      case 'datos':
        return 'datos del estudiante';

      default:
        return 'registro';
    }
  }

  mensajeAmigable(error: string): string {

    const texto = error?.trim() || '';

    if (!texto) {
      return 'No fue posible procesar este registro.';
    }

    const tipo = this.detectarTipoError(texto);

    if (tipo === 'correo') {
      return 'El correo electrónico no es válido o ya se encuentra registrado.';
    }

    if (tipo === 'documento') {
      return 'El documento no es válido o ya se encuentra registrado.';
    }

    if (tipo === 'curso') {
      return 'El curso indicado no existe o no está disponible.';
    }

    if (tipo === 'datos') {
      return 'Uno o varios datos del estudiante no cumplen con el formato esperado.';
    }

    return texto;
  }

  private detectarTipoError(
    error: string
  ): string {

    const texto = (
      error || ''
    ).toLowerCase();

    if (
      texto.includes('correo') ||
      texto.includes('email') ||
      texto.includes('mail')
    ) {
      return 'correo';
    }

    if (
      texto.includes('documento') ||
      texto.includes('identificacion') ||
      texto.includes('identificación')
    ) {
      return 'documento';
    }

    if (
      texto.includes('curso') ||
      texto.includes('idcourse') ||
      texto.includes('id_curso')
    ) {
      return 'curso';
    }

    if (
      texto.includes('campo') ||
      texto.includes('formato') ||
      texto.includes('obligatorio') ||
      texto.includes('fecha') ||
      texto.includes('telefono') ||
      texto.includes('teléfono')
    ) {
      return 'datos';
    }

    return 'general';
  }

  volver(): void {

    this.vista = 'formulario';
    this.reporte = null;
    this.errorGeneral = '';
    this.cargando = false;
    this.arrastrando = false;
  }

  formatearFechaReporte(
    fecha: string | Date
  ): string {

    if (!fecha) {
      return '';
    }

    const fechaConvertida =
      fecha instanceof Date
        ? fecha
        : new Date(fecha);

    if (
      Number.isNaN(
        fechaConvertida.getTime()
      )
    ) {
      return String(fecha);
    }

    return fechaConvertida.toLocaleString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  private obtenerMensajeError(
    error: unknown
  ): string {

    const respuesta = error as {
      error?: {
        message?: string;
      };
      message?: string;
    };

    if (
      respuesta?.error?.message
    ) {
      return respuesta.error.message;
    }

    if (
      respuesta?.message
    ) {
      return respuesta.message;
    }

    return 'Ocurrió un error al procesar el archivo.';
  }

  obtenerFilaEstudiante(
    numeroFila: number
  ): EstudianteImportado | null {

    const indice = numeroFila - 2;

    if (
      indice < 0 ||
      indice >= this.estudiantes.length
    ) {
      return null;
    }

    return this.estudiantes[indice];
  }
}
