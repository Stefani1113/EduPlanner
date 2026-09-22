import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsuariosService,
  RegisterStudentDTO,
  CourseBasicoDTO
} from '../../services/usuarios.service';

interface ErrorImportacion {
  rowNumber: number;
  error: string;
}

interface ReporteImportacion {
  idImport: number | string;
  fileName: string;
  importDate: Date;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ErrorImportacion[];
}

interface EstudianteImportado {
  name: string;
  surnames: string;
  email: string;
  document: string;
  documentType: string;
  documentIssuePlace: string;
  phoneNumber: string;
  gender: string;
  birthdate: string | null;
  address: string;
  bloodType: string;
  disabilities: string;
  stratum: number | undefined;
  populationType: string;
  healthRegime: string;
  eps: string;
  guardianName: string;
  guardianPhone: string;
  idCourse: number | null;
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

  @Input() cursos: CourseBasicoDTO[] = [];

  @Output() importarCompletado =
    new EventEmitter<void>();

  // ============================================================
  // ESTADO DE LA VISTA
  // ============================================================

  vista: 'formulario' | 'reporte' = 'formulario';

  archivo: File | null = null;

  arrastrando = false;

  cargando = false;

  errorGeneral = '';

  tamanoMaximoMB = 10;

  reporte: ReporteImportacion | null = null;

  estudiantes: EstudianteImportado[] = [];

  // Curso seleccionado opcionalmente cuando el CSV
  // no contiene una columna de curso.
  cursoSeleccionado: number | null = null;

  private contadorImportacion = 1;

  constructor(
    private usuariosService: UsuariosService
  ) {}

  // ============================================================
  // ARCHIVO
  // ============================================================

  seleccionarArchivo(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.procesarArchivo(input.files[0]);
  }

  onDragOver(event: DragEvent): void {

    event.preventDefault();
    event.stopPropagation();

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

  private procesarArchivo(file: File): void {

    this.errorGeneral = '';

    // Validar extensión
    const nombre =
      file.name.toLowerCase();

    if (!nombre.endsWith('.csv')) {

      this.errorGeneral =
        'El archivo seleccionado debe ser un archivo CSV.';

      return;
    }

    // Validar tamaño
    const tamanoMB =
      file.size / 1024 / 1024;

    if (tamanoMB > this.tamanoMaximoMB) {

      this.errorGeneral =
        `El archivo supera el tamaño máximo permitido de ${this.tamanoMaximoMB} MB.`;

      return;
    }

    this.archivo = file;

    this.reporte = null;

    this.vista = 'formulario';

    this.estudiantes = [];
  }

  quitarArchivo(): void {

    if (this.cargando) {
      return;
    }

    this.archivo = null;

    this.estudiantes = [];

    this.errorGeneral = '';
  }

  // ============================================================
  // IMPORTACIÓN
  // ============================================================

  importar(): void {

    if (!this.archivo) {

      this.errorGeneral =
        'Selecciona un archivo CSV antes de importar.';

      return;
    }

    if (this.cargando) {
      return;
    }

    this.errorGeneral = '';

    this.cargando = true;

    this.leerArchivoParaImportar(this.archivo);
  }

  private leerArchivoParaImportar(
    archivo: File
  ): void {

    const reader = new FileReader();

    reader.onload = () => {

      try {

        const contenido =
          String(reader.result || '');

        if (!contenido.trim()) {

          this.finalizarConError(
            'El archivo CSV está vacío.'
          );

          return;
        }

        this.procesarCSV(contenido);

      } catch (error) {

        console.error(
          'Error procesando CSV:',
          error
        );

        this.finalizarConError(
          'No fue posible procesar el archivo CSV.'
        );
      }
    };

    reader.onerror = () => {

      this.finalizarConError(
        'No fue posible leer el archivo seleccionado.'
      );
    };

    reader.readAsText(
      archivo,
      'UTF-8'
    );
  }

  // ============================================================
  // CSV
  // ============================================================

  private procesarCSV(
    contenido: string
  ): void {

    const lineas =
      contenido
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(
          linea =>
            linea.trim().length > 0
        );

    if (lineas.length < 2) {

      this.finalizarConError(
        'El archivo debe tener encabezados y al menos un estudiante.'
      );

      return;
    }

    const separador =
      this.detectarSeparador(
        lineas[0]
      );

    const encabezados =
      this.parsearLinea(
        lineas[0],
        separador
      ).map(
        campo =>
          this.normalizar(campo)
      );

    const estudiantes: EstudianteImportado[] = [];

    const errores: ErrorImportacion[] = [];

    for (
      let i = 1;
      i < lineas.length;
      i++
    ) {

      const valores =
        this.parsearLinea(
          lineas[i],
          separador
        );

      if (
        valores.length === 1 &&
        !valores[0].trim()
      ) {
        continue;
      }

      const estudiante =
        this.crearEstudiante(
          encabezados,
          valores
        );

      const erroresFila =
        this.validarEstudiante(
          estudiante
        );

      if (erroresFila.length > 0) {

        erroresFila.forEach(
          mensaje => {

            errores.push({
              rowNumber: i + 1,
              error: mensaje
            });

          }
        );

      } else {

        estudiantes.push(
          estudiante
        );
      }
    }

    this.estudiantes =
      estudiantes;

    if (
      estudiantes.length === 0
    ) {

      this.generarReporte(
        lineas.length - 1,
        0,
        errores
      );

      return;
    }

    this.registrarEstudiantes(
      estudiantes,
      lineas.length - 1,
      errores
    );
  }

  private detectarSeparador(
    linea: string
  ): string {

    const comas =
      (linea.match(/,/g) || []).length;

    const puntosYComas =
      (linea.match(/;/g) || []).length;

    return puntosYComas > comas
      ? ';'
      : ',';
  }

  private parsearLinea(
    linea: string,
    separador: string
  ): string[] {

    const resultado: string[] = [];

    let actual = '';

    let dentroComillas = false;

    for (
      let i = 0;
      i < linea.length;
      i++
    ) {

      const caracter =
        linea[i];

      if (caracter === '"') {

        if (
          dentroComillas &&
          linea[i + 1] === '"'
        ) {

          actual += '"';

          i++;

        } else {

          dentroComillas =
            !dentroComillas;
        }

        continue;
      }

      if (
        caracter === separador &&
        !dentroComillas
      ) {

        resultado.push(
          actual.trim()
        );

        actual = '';

        continue;
      }

      actual += caracter;
    }

    resultado.push(
      actual.trim()
    );

    return resultado;
  }

  // ============================================================
  // CREAR ESTUDIANTE
  // ============================================================

  private crearEstudiante(
    encabezados: string[],
    valores: string[]
  ): EstudianteImportado {

    const obtener =
      (...nombres: string[]): string => {

        for (
          const nombre of nombres
        ) {

          const indice =
            encabezados.indexOf(
              this.normalizar(nombre)
            );

          if (
            indice !== -1
          ) {

            return (
              valores[indice] || ''
            ).trim();
          }
        }

        return '';
      };

    const cursoTexto =
      obtener(
        'idCourse',
        'id_course',
        'idcurso',
        'curso',
        'course',
        'grado'
      );

    const idCourse =
      this.obtenerIdCurso(
        cursoTexto
      );

    const stratumTexto =
      obtener(
        'stratum',
        'estrato'
      );

    const stratum =
      Number(stratumTexto);

    return {

      name: obtener(
        'name',
        'nombre',
        'nombres'
      ),

      surnames: obtener(
        'surnames',
        'surname',
        'apellido',
        'apellidos'
      ),

      email: obtener(
        'email',
        'correo',
        'correo electronico',
        'correo electrónico'
      ),

      document: obtener(
        'document',
        'documento',
        'cedula',
        'cédula'
      ),

      documentType:
        obtener(
          'documentType',
          'tipo documento',
          'tipo_documento'
        ) || 'CC',

      documentIssuePlace:
        obtener(
          'documentIssuePlace',
          'lugar expedicion',
          'lugar de expedicion',
          'lugar de expedición'
        ),

      phoneNumber:
        obtener(
          'phoneNumber',
          'telefono',
          'teléfono',
          'celular'
        ),

      gender:
        obtener(
          'gender',
          'genero',
          'género'
        ),

      birthdate:
        this.formatearFecha(
          obtener(
            'birthdate',
            'fecha nacimiento',
            'fecha de nacimiento',
            'fecha_nacimiento'
          )
        ),

      address:
        obtener(
          'address',
          'direccion',
          'dirección'
        ),

      bloodType:
        obtener(
          'bloodType',
          'tipo sangre',
          'tipo de sangre'
        ),

      disabilities:
        obtener(
          'disabilities',
          'discapacidad',
          'discapacidades'
        ),

      stratum:
        Number.isFinite(stratum)
          ? stratum
          : undefined,

      populationType:
        obtener(
          'populationType',
          'tipo poblacion',
          'tipo de población'
        ),

      healthRegime:
        obtener(
          'healthRegime',
          'regimen salud',
          'régimen de salud'
        ),

      eps:
        obtener('eps'),

      guardianName:
        obtener(
          'guardianName',
          'nombre acudiente',
          'acudiente',
          'nombre del acudiente'
        ),

      guardianPhone:
        obtener(
          'guardianPhone',
          'telefono acudiente',
          'teléfono acudiente',
          'telefono del acudiente',
          'teléfono del acudiente'
        ),

      idCourse
    };
  }

  // ============================================================
  // VALIDACIÓN
  // ============================================================

  private validarEstudiante(
    estudiante: EstudianteImportado
  ): string[] {

    const errores: string[] = [];

    if (!estudiante.name) {

      errores.push(
        'Campo obligatorio: nombre'
      );
    }

    if (!estudiante.surnames) {

      errores.push(
        'Campo obligatorio: apellidos'
      );
    }

    if (!estudiante.email) {

      errores.push(
        'Campo obligatorio: correo'
      );

    } else if (
      !this.emailValido(
        estudiante.email
      )
    ) {

      errores.push(
        'Correo electrónico inválido'
      );
    }

    if (!estudiante.document) {

      errores.push(
        'Campo obligatorio: documento'
      );
    }

    if (
      estudiante.idCourse === null ||
      estudiante.idCourse === undefined
    ) {

      errores.push(
        'Curso no encontrado o no especificado'
      );
    }

    if (!estudiante.guardianName) {

      errores.push(
        'Campo obligatorio: nombre del acudiente'
      );
    }

    return errores;
  }

  private emailValido(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);
  }

  // ============================================================
  // REGISTRO EN BACKEND
  // ============================================================

  private registrarEstudiantes(
    estudiantes: EstudianteImportado[],
    totalFilas: number,
    erroresIniciales: ErrorImportacion[]
  ): void {

    const errores = [
      ...erroresIniciales
    ];

    let procesados = 0;

    let exitosos = 0;

    estudiantes.forEach(
      estudiante => {

        const dto: RegisterStudentDTO = {

          name:
            estudiante.name,

          surnames:
            estudiante.surnames,

          email:
            estudiante.email,

          phoneNumber:
            estudiante.phoneNumber || undefined,

          document:
            estudiante.document,

          documentType:
            estudiante.documentType || 'CC',

          documentIssuePlace:
            estudiante.documentIssuePlace ||
            undefined,

          gender:
            estudiante.gender ||
            undefined,

          birthdate:
            estudiante.birthdate,

          address:
            estudiante.address ||
            undefined,

          bloodType:
            estudiante.bloodType ||
            undefined,

          disabilities:
            estudiante.disabilities ||
            undefined,

          stratum:
            estudiante.stratum,

          populationType:
            estudiante.populationType ||
            undefined,

          healthRegime:
            estudiante.healthRegime ||
            undefined,

          eps:
            estudiante.eps ||
            undefined,

          guardian: {

            guardianName:
              estudiante.guardianName,

            guardianPhone:
              estudiante.guardianPhone || ''
          },

          idCourse:
            estudiante.idCourse as number
        };

        this.usuariosService
          .registrarEstudiante(dto)
          .subscribe({

            next: () => {

              exitosos++;

              procesados++;

              if (
                procesados ===
                estudiantes.length
              ) {

                this.generarReporte(
                  totalFilas,
                  exitosos,
                  errores
                );
              }
            },

            error: (error) => {

              procesados++;

              errores.push({

                rowNumber:
                  this.obtenerFilaEstudiante(
                    estudiante,
                    estudiantes
                  ),

                error:
                  this.obtenerMensajeError(
                    error
                  )
              });

              if (
                procesados ===
                estudiantes.length
              ) {

                this.generarReporte(
                  totalFilas,
                  exitosos,
                  errores
                );
              }
            }
          });
      }
    );
  }

  // ============================================================
  // REPORTE
  // ============================================================

  private generarReporte(
    total: number,
    exitosos: number,
    errores: ErrorImportacion[]
  ): void {

    this.reporte = {

      idImport:
        this.contadorImportacion++,

      fileName:
        this.archivo?.name || '',

      importDate:
        new Date(),

      totalRows:
        total,

      successRows:
        exitosos,

      failedRows:
        errores.length,

      errors:
        errores
    };

    this.cargando = false;

    this.vista = 'reporte';

    if (exitosos > 0) {
      this.importarCompletado.emit();
    }
  }

  private finalizarConError(
    mensaje: string
  ): void {

    this.cargando = false;

    this.errorGeneral =
      mensaje;
  }

  // ============================================================
  // BOTONES
  // ============================================================

  volver(): void {

    this.vista = 'formulario';

    this.reporte = null;

    this.errorGeneral = '';

    this.cargando = false;
  }

  // ============================================================
  // INFORMACIÓN DEL REPORTE
  // ============================================================

  porcentajeExito(): number {

    if (
      !this.reporte ||
      this.reporte.totalRows === 0
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

  claseTipoError(
    error: string
  ): string {

    const texto =
      error.toLowerCase();

    if (
      texto.includes('correo') ||
      texto.includes('email')
    ) {
      return 'error-correo';
    }

    if (
      texto.includes('curso')
    ) {
      return 'error-curso';
    }

    if (
      texto.includes('documento')
    ) {
      return 'error-documento';
    }

    if (
      texto.includes('obligatorio')
    ) {
      return 'error-validacion';
    }

    return 'error-general';
  }

  etiquetaTipoError(
    error: string
  ): string {

    const texto =
      error.toLowerCase();

    if (
      texto.includes('correo') ||
      texto.includes('email')
    ) {
      return 'Correo';
    }

    if (
      texto.includes('curso')
    ) {
      return 'Curso';
    }

    if (
      texto.includes('documento')
    ) {
      return 'Documento';
    }

    if (
      texto.includes('obligatorio')
    ) {
      return 'Obligatorio';
    }

    return 'Validación';
  }

  campoAfectado(
    error: string
  ): string {

    const texto =
      error.toLowerCase();

    if (
      texto.includes('correo') ||
      texto.includes('email')
    ) {
      return 'Correo';
    }

    if (
      texto.includes('curso')
    ) {
      return 'Curso';
    }

    if (
      texto.includes('documento')
    ) {
      return 'Documento';
    }

    if (
      texto.includes('nombre del acudiente') ||
      texto.includes('acudiente')
    ) {
      return 'Acudiente';
    }

    if (
      texto.includes('nombre')
    ) {
      return 'Nombre';
    }

    if (
      texto.includes('apellidos')
    ) {
      return 'Apellidos';
    }

    return 'Registro';
  }

  mensajeAmigable(
    error: string
  ): string {

    if (!error) {
      return 'Error desconocido.';
    }

    return error;
  }

  // ============================================================
  // CURSOS
  // ============================================================

  private obtenerIdCurso(
    valor: string
  ): number | null {

    if (!valor) {

      return this.cursoSeleccionado;
    }

    const numero =
      Number(valor);

    if (
      Number.isInteger(numero) &&
      this.cursos.some(
        curso =>
          curso.idCourse === numero
      )
    ) {

      return numero;
    }

    const buscado =
      this.normalizarCurso(
        valor
      );

    const curso =
      this.cursos.find(
        item =>
          this.normalizarCurso(
            item.name
          ) === buscado
      );

    if (curso) {
      return curso.idCourse;
    }

    return this.cursoSeleccionado;
  }

  private normalizarCurso(
    valor: string
  ): string {

    return this.normalizar(valor)
      .replace(/\s+/g, '')
      .replace(/_/g, '-');
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  private normalizar(
    valor: string
  ): string {

    return valor
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim()
      .replace(
        /\s+/g,
        ' '
      );
  }

  private formatearFecha(
    valor: string
  ): string | null {

    if (!valor) {
      return null;
    }

    const texto =
      valor.trim();

    if (
      /^\d{4}-\d{2}-\d{2}$/
        .test(texto)
    ) {
      return texto;
    }

    const slash =
      texto.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (slash) {

      const dia =
        slash[1].padStart(2, '0');

      const mes =
        slash[2].padStart(2, '0');

      const anio =
        slash[3];

      return `${anio}-${mes}-${dia}`;
    }

    const guion =
      texto.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      );

    if (guion) {

      const dia =
        guion[1].padStart(2, '0');

      const mes =
        guion[2].padStart(2, '0');

      const anio =
        guion[3];

      return `${anio}-${mes}-${dia}`;
    }

    return texto;
  }

  private obtenerMensajeError(
    error: any
  ): string {

    if (
      error?.error?.message
    ) {
      return String(
        error.error.message
      );
    }

    if (
      error?.error?.data?.message
    ) {
      return String(
        error.error.data.message
      );
    }

    if (
      error?.message
    ) {
      return String(
        error.message
      );
    }

    if (
      error?.status
    ) {
      return `Error HTTP ${error.status}.`;
    }

    return 'No fue posible registrar el estudiante.';
  }

  private obtenerFilaEstudiante(
    estudiante: EstudianteImportado,
    estudiantes: EstudianteImportado[]
  ): number {

    const indice =
      estudiantes.indexOf(
        estudiante
      );

    return indice >= 0
      ? indice + 2
      : 0;
  }
}