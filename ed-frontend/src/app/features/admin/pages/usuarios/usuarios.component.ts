import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { BreadcrumbService } from '../../services/breadcrumb.service';

import {
RegistroUsuarioModalComponent,
UsuarioRegistrado,
TipoRegistro
} from './registro-usuario-modal/registro-usuario-modal.component';

import {
EditarUsuarioModalComponent,
UsuarioEditado,
TipoEdicion
} from './editar-usuario-modal/editar-usuario-modal.component';

import { ImportacionComponent } from '../importacion/importacion.component';

import {
UsuariosService,
UserResponseDTO,
ID_ROL_ADMINISTRADOR,
ID_ROL_DOCENTE,
ID_ROL_ESTUDIANTE,
ID_ROL_DIRECTIVO,
TeachingRequestDTO,
UpdateStudentDTO,
UpdateStaffDTO
} from '../../services/usuarios.service';

import { ModalService } from '../../../../core/services/modal.service';

type Rol =
| 'Todos'
| 'Administrador'
| 'Docente'
| 'Estudiante'
| 'Directivo';

type Estado =
| 'Activo'
| 'Inactivo';

type Tab =
| 'listado'
| 'importacion';

const ROL_A_ID: Partial<Record<Rol, number>> = {
Administrador: ID_ROL_ADMINISTRADOR,
Docente: ID_ROL_DOCENTE,
Estudiante: ID_ROL_ESTUDIANTE,
Directivo: ID_ROL_DIRECTIVO
};

const ID_A_ROL: Record<number, Exclude<Rol, 'Todos'>> = {
[ID_ROL_ADMINISTRADOR]: 'Administrador',
[ID_ROL_DOCENTE]: 'Docente',
[ID_ROL_ESTUDIANTE]: 'Estudiante',
[ID_ROL_DIRECTIVO]: 'Directivo'
};

interface Curso {
idCourse: number;
name: string;
status: boolean;
}

interface Usuario {
id: number;
idRole: number;
foto: string | null;
nombre: string;
correo: string;
telefono: string;
rol: Exclude<Rol, 'Todos'>;
grado: string | null;
estado: Estado;
detalle: UserResponseDTO;
}

@Component({
selector: 'app-usuarios',
standalone: true,
imports: [
CommonModule,
FormsModule,
RegistroUsuarioModalComponent,
EditarUsuarioModalComponent,
ImportacionComponent
],
templateUrl: './usuarios.component.html',
styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit, OnDestroy {

@ViewChild(RegistroUsuarioModalComponent)
modalRegistro?: RegistroUsuarioModalComponent;


tabs: { key: Tab; label: string }[] = [
{
key: 'listado',
label: 'Listado'
},
{
key: 'importacion',
label: 'Importación'
}
];

activeTab: Tab = 'listado';


roles: Rol[] = [
'Todos',
'Administrador',
'Docente',
'Directivo',
'Estudiante'
];


rolSeleccionado: Rol = 'Todos';


gradoSeleccionado = 'Todos los cursos';

grados: string[] = [
'Todos los cursos'
];

cursos: Curso[] = [];

cargandoCursos = false;

mostrarFiltroRol = false;

mostrarMenuRegistrar = false;


tipoRegistro: TipoRegistro | null = null;

guardandoUsuario = false;


usuarioEnEdicion: UserResponseDTO | null = null;

tipoEdicion: TipoEdicion | null = null;

guardandoEdicion = false;

cargandoEdicion = false;


busqueda = '';

usuarios: Usuario[] = [];

cargando = false;

exportando = false;

errorCarga = '';

cambiandoEstado = new Set<number>();


constructor(
private breadcrumbService: BreadcrumbService,
private usuariosService: UsuariosService,
private modalService: ModalService
) {}


@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {

if (
  !this.mostrarFiltroRol &&
  !this.mostrarMenuRegistrar
) {
  return;
}

const target = event.target as HTMLElement;

if (!target.closest('.role-box')) {
  this.mostrarFiltroRol = false;
}

if (!target.closest('.registrar-box')) {
  this.mostrarMenuRegistrar = false;
}

}


ngOnInit(): void {

this.actualizarBreadcrumb();


this.cargarCursos();

}

ngOnDestroy(): void {

this.breadcrumbService.setExtra(null);

}


private cargarCursos(): void {

this.cargandoCursos = true;

this.usuariosService
  .listarCursos()
  .pipe(

    catchError(err => {

      console.error(
        'Error cargando cursos:',
        err
      );

      return of({
        data: [],
        message: ''
      });
    }),

    finalize(() => {

      this.cargandoCursos = false;

    })

  )
  .subscribe(res => {

    this.cursos = (res.data ?? [])
      .filter(curso => curso.status)
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          'es'
        )
      );


 
    this.grados = [
      'Todos los cursos',
      ...this.cursos.map(
        curso => curso.name
      )
    ];



    this.cargarUsuarios();

  });

}


private cargarUsuarios(): void {
  this.cargando = true;
  this.errorCarga = '';

  if (this.rolSeleccionado === 'Todos') {
    this.usuariosService
      .listar()
      .pipe(
        catchError(err => {
          console.error('Error cargando usuarios:', err);

          this.errorCarga = this.obtenerMensajeError(
            err,
            'No se pudo cargar el listado de usuarios. Verifica tu conexión con el servidor.'
          );

          return of({
            data: [],
            message: ''
          });
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe(res => {
        this.usuarios = (res.data ?? []).map(usuario =>
          this.mapearUsuario(usuario)
        );
      });

    return;
  }

  if (
    this.rolSeleccionado === 'Estudiante' &&
    this.gradoSeleccionado !== 'Todos los cursos'
  ) {
    const idCurso = this.obtenerIdCursoSeleccionado();

    if (idCurso !== null) {
      this.usuariosService
        .listarPorCurso(idCurso)
        .pipe(
          catchError(err => {
            console.error(
              'Error cargando estudiantes por curso:',
              err
            );

            this.errorCarga = this.obtenerMensajeError(
              err,
              'No se pudo cargar los estudiantes del curso.'
            );

            return of({
              data: [],
              message: ''
            });
          }),
          finalize(() => {
            this.cargando = false;
          })
        )
        .subscribe(res => {
          this.usuarios = (res.data ?? []).map(usuario =>
            this.mapearUsuario(usuario)
          );
        });

      return;
    }
  }

  const idRol = ROL_A_ID[this.rolSeleccionado];

  if (idRol === undefined) {
    this.usuarios = [];
    this.cargando = false;
    return;
  }

  this.usuariosService
    .listar(idRol)
    .pipe(
      catchError(err => {
        console.error('Error cargando usuarios:', err);

        this.errorCarga = this.obtenerMensajeError(
          err,
          'No se pudo cargar el listado de usuarios. Verifica tu conexión con el servidor.'
        );

        return of({
          data: [],
          message: ''
        });
      }),
      finalize(() => {
        this.cargando = false;
      })
    )
    .subscribe(res => {
      this.usuarios = (res.data ?? []).map(usuario =>
        this.mapearUsuario(usuario)
      );
    });
}


private obtenerIdCursoSeleccionado(): number | null {

if (
  this.rolSeleccionado !== 'Estudiante'
) {
  return null;
}


if (
  this.gradoSeleccionado ===
  'Todos los cursos'
) {
  return null;
}


const curso =
  this.cursos.find(
    c =>
      c.name ===
      this.gradoSeleccionado
  );


return curso?.idCourse ?? null;

}


private obtenerNombreCurso(
idCourse: number | null | undefined
): string | null {


if (
  idCourse === null ||
  idCourse === undefined
) {
  return null;
}


const curso =
  this.cursos.find(
    c =>
      c.idCourse === idCourse
  );


return curso?.name ?? null;

}


private mapearUsuario(
dto: UserResponseDTO
): Usuario {


const nombreCurso =
  dto.idRole === ID_ROL_ESTUDIANTE
    ? this.obtenerNombreCurso(
        dto.idCourse
      )
    : null;


return {

  id:
    dto.idUser,

  idRole:
    dto.idRole,

  foto:
    dto.photoUrl ?? null,

  nombre:
    `${dto.name ?? ''} ${dto.surnames ?? ''}`.trim(),

  correo:
    dto.email ?? '',

  telefono:
    dto.phoneNumber ?? '',

  rol:
    ID_A_ROL[dto.idRole] ??
    'Docente',

 
  grado:
    nombreCurso,

  estado:
    dto.status
      ? 'Activo'
      : 'Inactivo',

  detalle:
    dto
};

}


get usuariosFiltrados(): Usuario[] {

const term =
  this.busqueda
    .trim()
    .toLowerCase();


if (!term) {

  return this.usuarios;

}


return this.usuarios.filter(
  usuario => {

    const valores = [

      usuario.nombre,

      usuario.correo,

      usuario.telefono,

      usuario.detalle.document,

      usuario.rol,

      usuario.grado ?? '',

      String(usuario.id)

    ];


    return valores.some(
      valor =>
        String(valor)
          .toLowerCase()
          .includes(term)
    );

  }
);

}


get totalRol(): number {

return this.usuariosFiltrados.length;

}

get activosRol(): number {

return this.usuariosFiltrados
  .filter(
    usuario =>
      usuario.estado === 'Activo'
  )
  .length;

}

get inactivosRol(): number {

return this.usuariosFiltrados
  .filter(
    usuario =>
      usuario.estado === 'Inactivo'
  )
  .length;

}


seleccionarRol(
rol: Rol
): void {

this.rolSeleccionado = rol;


this.gradoSeleccionado =
  'Todos los cursos';

this.busqueda = '';

this.mostrarFiltroRol = false;

this.actualizarBreadcrumb();

this.cargarUsuarios();

}


seleccionarGrado(
grado: string
): void {


this.rolSeleccionado =
  'Estudiante';

this.gradoSeleccionado =
  grado;

this.busqueda = '';

this.mostrarFiltroRol = false;

this.actualizarBreadcrumb();

this.cargarUsuarios();

}


cambiarTab(
tab: Tab
): void {

this.activeTab = tab;

this.mostrarFiltroRol = false;

this.mostrarMenuRegistrar = false;

this.actualizarBreadcrumb();

}


toggleEstado(
usuario: Usuario
): void {

if (
  this.cambiandoEstado.has(
    usuario.id
  )
) {
  return;
}

const nuevoEstado =
  usuario.estado !== 'Activo';

this.modalService.confirm(
  nuevoEstado
    ? `¿Está seguro de activar al usuario ${usuario.nombre}?`
    : `¿Está seguro de inactivar al usuario ${usuario.nombre}?`,
  nuevoEstado
    ? 'Confirmar activación'
    : 'Confirmar inactivación',
  nuevoEstado
    ? 'Activar'
    : 'Inactivar',
  'Cancelar'
).then(confirmado => {

  if (!confirmado) {
    return;
  }

  this.cambiandoEstado.add(
    usuario.id
  );

  this.usuariosService
    .actualizarEstado(
      usuario.id,
      nuevoEstado
    )
    .pipe(
      finalize(() =>
        this.cambiandoEstado.delete(
          usuario.id
        )
      )
    )
    .subscribe({

      next: res => {

        usuario.estado =
          nuevoEstado
            ? 'Activo'
            : 'Inactivo';

        usuario.detalle.status =
          nuevoEstado;

        if (nuevoEstado) {
          this.modalService.success(
            res.message ||
            'El usuario fue activado exitosamente.'
          );
        } else {
          this.modalService.warning(
            res.message ||
            'El usuario fue inactivado exitosamente.',
            'Usuario inactivado'
          );
        }

      },

      error: err => {

        console.error(err);

        this.modalService.error(
          this.obtenerMensajeError(
            err,
            'No se pudo actualizar el estado del usuario. Intenta de nuevo.'
          )
        );

      }

    });

});
}
estaCambiandoEstado(
id: number
): boolean {

return this.cambiandoEstado.has(id);

}


abrirRegistro(
tipo: TipoRegistro
): void {

this.tipoRegistro = tipo;

this.mostrarMenuRegistrar = false;

this.mostrarFiltroRol = false;

}

cerrarModal(): void {

if (
  !this.guardandoUsuario
) {

  this.tipoRegistro = null;

}

}

guardarUsuario(
evento: UsuarioRegistrado
): void {

if (
  this.guardandoUsuario
) {
  return;
}


this.guardandoUsuario = true;



if (
  evento.tipo === 'Docente'
) {

  this.usuariosService
    .registrarDocente(
      evento.payload
    )
    .subscribe({

      next: res =>
        this.onRegistroExitoso(
          res.message ||
          'Docente registrado correctamente. Se envió un correo de activación.'
        ),

      error: err =>
        this.onRegistroFallido(
          err,
          'No se pudo registrar el docente.'
        )

    });


  return;
}



if (
  evento.tipo === 'Estudiante'
) {

  this.usuariosService
    .registrarEstudiante(
      evento.payload
    )
    .subscribe({

      next: res =>
        this.onRegistroExitoso(
          res.message ||
          'Estudiante registrado correctamente. Se envió un correo de activación.'
        ),

      error: err =>
        this.onRegistroFallido(
          err,
          'No se pudo registrar el estudiante.'
        )

    });


  return;
}



this.usuariosService
  .registrarPersonal(
    evento.payload
  )
  .subscribe({

    next: res =>
      this.onRegistroExitoso(
        res.message ||
        'Usuario registrado correctamente. Se envió un correo de activación.'
      ),

    error: err =>
      this.onRegistroFallido(
        err,
        'No se pudo registrar el usuario.'
      )

  });

}

private onRegistroExitoso(
mensaje: string
): void {

this.guardandoUsuario = false;

this.tipoRegistro = null;

this.cargarUsuarios();

this.modalService.success(
  mensaje
);

}

private onRegistroFallido(
err: any,
mensajePorDefecto: string
): void {

this.guardandoUsuario = false;

console.error(err);


const mensajeError =
  this.obtenerMensajeError(
    err,
    mensajePorDefecto
  );


if (this.modalRegistro) {

  this.modalRegistro.onErrorGuardado(
    mensajeError
  );

} else {

  this.modalService.error(
    mensajeError
  );

}

}


editar(
usuario: Usuario
): void {

if (
  this.cargandoEdicion ||
  this.guardandoEdicion
) {
  return;
}


this.mostrarFiltroRol = false;

this.mostrarMenuRegistrar = false;

this.cargandoEdicion = true;


this.usuariosService
  .obtenerPorId(
    usuario.id
  )
  .pipe(

    finalize(() =>
      this.cargandoEdicion = false
    )

  )
  .subscribe({

    next: res => {

      this.usuarioEnEdicion =
        res.data;


      this.tipoEdicion =
        this.obtenerTipoEdicion(
          res.data.idRole
        );

    },


    error: err => {

      console.error(err);


      this.modalService.error(
        this.obtenerMensajeError(
          err,
          'No se pudieron cargar los datos del usuario.'
        )
      );

    }

  });

}

cerrarEdicion(): void {

if (
  this.guardandoEdicion ||
  this.cargandoEdicion
) {
  return;
}


this.usuarioEnEdicion = null;

this.tipoEdicion = null;

}

guardarEdicion(
evento: UsuarioEditado
): void {

if (
  this.guardandoEdicion
) {
  return;
}


this.guardandoEdicion = true;



if (
  evento.tipo === 'Docente'
) {

  this.usuariosService
    .actualizarDocente(
      evento.id,
      evento.payload as TeachingRequestDTO
    )
    .subscribe({

      next: res =>
        this.finalizarEdicion(
          res.message ||
          'Docente actualizado correctamente.'
        ),

      error: err =>
        this.errorEdicion(err)

    });


  return;
}



if (
  evento.tipo === 'Estudiante'
) {

  this.usuariosService
    .actualizarEstudiante(
      evento.id,
      evento.payload as UpdateStudentDTO
    )
    .subscribe({

      next: res =>
        this.finalizarEdicion(
          res.message ||
          'Estudiante actualizado correctamente.'
        ),

      error: err =>
        this.errorEdicion(err)

    });


  return;
}



this.usuariosService
  .actualizarStaff(
    evento.id,
    evento.payload as UpdateStaffDTO
  )
  .subscribe({

    next: res =>
      this.finalizarEdicion(
        res.message ||
        'Usuario actualizado correctamente.'
      ),

    error: err =>
      this.errorEdicion(err)

  });

}

private finalizarEdicion(
mensaje: string
): void {

this.guardandoEdicion = false;

this.usuarioEnEdicion = null;

this.tipoEdicion = null;

this.cargarUsuarios();

this.modalService.success(
  mensaje
);

}

private errorEdicion(
err: any
): void {

this.guardandoEdicion = false;

console.error(err);


this.modalService.error(
  this.obtenerMensajeError(
    err,
    'No se pudieron guardar los cambios del usuario.'
  )
);

}

private obtenerTipoEdicion(
idRole: number
): TipoEdicion {

return idRole === ID_ROL_DOCENTE
  ? 'Docente'
  : idRole === ID_ROL_ESTUDIANTE
    ? 'Estudiante'
    : 'Staff';

}


exportarCSV(): void {

if (
  this.exportando ||
  this.cargando ||
  this.usuariosFiltrados.length === 0
) {
  return;
}


this.exportando = true;


try {

  const headers = [

    'ID',
    'Nombre',
    'Apellidos',
    'Correo',
    'Teléfono',
    'Documento',
    'Tipo documento',
    'Lugar expedición',
    'Género',
    'Fecha nacimiento',
    'Dirección',
    'Tipo sangre',
    'Discapacidades',
    'Estrato',
    'Tipo población',
    'Régimen salud',
    'EPS',
    'Cargo',
    'Títulos profesionales',
    'Descripción cualificaciones',
    'Rol',
    'Curso',
    'Estado'

  ];


  const rows =
    this.usuariosFiltrados.map(
      usuario => {

        const u =
          usuario.detalle;


        return [

          u.idUser,
          u.name,
          u.surnames,
          u.email,
          u.phoneNumber,
          u.document,
          u.documentType,
          u.documentIssuePlace,
          u.gender,
          u.birthdate,
          u.address,
          u.bloodType,
          u.disabilities,
          u.stratum,
          u.populationType,
          u.healthRegime,
          u.eps,
          u.position,
          u.professionalDegrees,
          u.qualificationsDesc,
          u.roleName,


          usuario.grado ?? '',

          u.status
            ? 'Activo'
            : 'Inactivo'

        ];

      }
    );


  const csv =
    '\uFEFF' +
    [headers, ...rows]
      .map(row =>
        row
          .map(value =>
            this.escaparCSV(value)
          )
          .join(',')
      )
      .join('\r\n');


  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement('a');


  link.href = url;


  link.download =
    `usuarios_${this.normalizarNombreArchivo(
      this.rolSeleccionado
    )}_${this.fechaArchivo()}.csv`;


  document.body.appendChild(link);


  link.click();


  link.remove();


  URL.revokeObjectURL(url);

} finally {

  this.exportando = false;

}

}


private escaparCSV(
value: unknown
): string {

if (
  value === null ||
  value === undefined
) {
  return '';
}


const texto =
  String(value);


return /[",\r\n]/.test(texto)
  ? `"${texto.replace(
      /"/g,
      '""'
    )}"`
  : texto;

}


private normalizarNombreArchivo(
texto: string
): string {

return texto
  .normalize('NFD')
  .replace(
    /[\u0300-\u036f]/g,
    ''
  )
  .toLowerCase();

}

private fechaArchivo(): string {

return new Date()
  .toISOString()
  .slice(0, 10);

}


private obtenerMensajeError(
err: any,
defecto: string
): string {

return (
  err?.error?.message ||
  err?.message ||
  defecto
);

}


private actualizarBreadcrumb(): void {

const tabLabel =
  this.tabs.find(
    tab =>
      tab.key === this.activeTab
  )?.label ?? '';


const partes = [
  tabLabel,
  this.rolSeleccionado
];


if (
  this.rolSeleccionado === 'Estudiante' &&
  this.gradoSeleccionado !==
    'Todos los cursos'
) {

  partes.push(
    this.gradoSeleccionado
  );

}


this.breadcrumbService.setExtra(
  partes.join(' · ')
);

}

}