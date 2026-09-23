import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

/**
 * Respuesta paginada de Spring.
 *
 * page:
 * - Frontend trabaja con páginas 1, 2, 3...
 * - Backend Spring trabaja con páginas 0, 1, 2...
 *
 * La conversión se realiza en el componente.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface UserResponseDTO {
  idUser: number;
  email: string;
  name: string;
  surnames: string;
  documentType: string;
  document: string;
  documentIssuePlace: string;
  birthdate: string | null;
  phoneNumber: string;
  status: boolean;
  photoUrl: string | null;
  professionalDegrees: string | null;
  qualificationsDesc: string | null;
  gender: string | null;
  address: string | null;
  bloodType: string | null;
  disabilities: string | null;
  stratum: number | null;
  populationType: string | null;
  healthRegime: string | null;
  eps: string | null;
  position: string | null;
  creationDate?: string | null;
  updateDate?: string | null;
  lastAccess?: string | null;
  roleName: string;
  idRole: number;
  idInstitution?: number | null;
  idCourse?: number | null;
}

export interface RegisterStaffDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber?: string;
  document: string;
  documentType: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate?: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idRole: number;
}

export interface GuardianDTO {
  guardianName: string;
  guardianPhone: string;
}

export interface RegisterStudentDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber?: string;
  document: string;
  documentType: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  guardian: GuardianDTO;
  idCourse: number;
}

export interface TeachingRequestDTO {
  name: string;
  surnames: string;
  email: string;
  password?: string;
  documentType: string;
  document: string;
  documentIssuePlace?: string;
  birthdate?: string | null;
  phoneNumber: string;
  photoUrl?: string;
  professionalDegrees?: string;
  qualificationsDesc?: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idInstitution?: number;
}

export interface TeachingResponseDTO {
  idUser: number;
  name: string;
  surnames: string;
  email: string;
  documentType: string;
  document: string;
  phoneNumber: string;
  position: string;
  status: boolean;
  rol: string;
}

export interface RegisterTeacherDTO {
  name: string;
  surnames: string;
  email: string;
  phoneNumber?: string;
  document: string;
  documentType: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate?: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  professionalDegrees: string;
  qualificationsDesc?: string;
}

export interface UpdateRoleDTO {
  idRole: number;
  position?: string;
}

export interface CourseBasicoDTO {
  idCourse: number;
  name: string;
  status: boolean;
}

export interface UpdateStudentDTO {
  name: string;
  surnames: string;
  phoneNumber?: string;
  documentIssuePlace?: string;
  gender?: string;
  birthdate?: string | null;
  address?: string;
  bloodType?: string;
  disabilities?: string;
  stratum?: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  idCourse?: number;
}

export interface UpdateStaffDTO
  extends Omit<UpdateStudentDTO, 'name' | 'surnames'> {
  name: string;
  surnames: string;
  position: string;
}

export const ID_ROL_ADMINISTRADOR = 1;
export const ID_ROL_DOCENTE = 2;
export const ID_ROL_ESTUDIANTE = 3;
export const ID_ROL_DIRECTIVO = 4;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private readonly api = '/administracion/eduplanner';

  constructor(private http: HttpClient) {}

  /**
   * Lista usuarios de forma paginada.
   *
   * page corresponde directamente al valor que
   * espera Spring Boot: 0, 1, 2...
   */
  listar(
    idRole?: number,
    page?: number,
    size?: number
  ): Observable<
    HttpGlobalResponse<PageResponse<UserResponseDTO>>
  > {

    let params = new HttpParams();

    if (idRole !== undefined) {
      params = params.set(
        'idRole',
        idRole.toString()
      );
    }

    if (page !== undefined) {
      params = params.set(
        'page',
        page.toString()
      );
    }

    if (size !== undefined) {
      params = params.set(
        'size',
        size.toString()
      );
    }

    return this.http.get<
      HttpGlobalResponse<PageResponse<UserResponseDTO>>
    >(
      `${this.api}/users`,
      { params }
    );
  }

  /**
   * Lista estudiantes pertenecientes a un curso.
   */
  listarPorCurso(
    idCourse: number,
    page?: number,
    size?: number
  ): Observable<
    HttpGlobalResponse<PageResponse<UserResponseDTO>>
  > {

    let params = new HttpParams();

    if (page !== undefined) {
      params = params.set(
        'page',
        page.toString()
      );
    }

    if (size !== undefined) {
      params = params.set(
        'size',
        size.toString()
      );
    }

    return this.http.get<
      HttpGlobalResponse<PageResponse<UserResponseDTO>>
    >(
      `${this.api}/users/course/${idCourse}`,
      { params }
    );
  }

  /**
   * Busca usuarios por nombre de forma paginada.
   */
  buscarPorNombre(
    name: string,
    page?: number,
    size?: number
  ): Observable<
    HttpGlobalResponse<PageResponse<UserResponseDTO>>
  > {

    let params = new HttpParams().set(
      'name',
      name
    );

    if (page !== undefined) {
      params = params.set(
        'page',
        page.toString()
      );
    }

    if (size !== undefined) {
      params = params.set(
        'size',
        size.toString()
      );
    }

    return this.http.get<
      HttpGlobalResponse<PageResponse<UserResponseDTO>>
    >(
      `${this.api}/users/search`,
      { params }
    );
  }

  actualizarEstado(
    idUser: number,
    status: boolean
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.patch<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/${idUser}/status`,
      { status }
    );
  }

  registrarPersonal(
    dto: RegisterStaffDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.post<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/register/staff`,
      dto
    );
  }

  registrarDocente(
    dto: RegisterTeacherDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.post<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/register/teacher`,
      dto
    );
  }

  registrarEstudiante(
    dto: RegisterStudentDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.post<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/register/student`,
      dto
    );
  }

  obtenerPorId(
    idUser: number
  ): Observable<
    HttpGlobalResponse<UserResponseDTO>
  > {

    return this.http.get<
      HttpGlobalResponse<UserResponseDTO>
    >(
      `${this.api}/users/${idUser}`
    );
  }

  actualizarDocente(
    idUser: number,
    dto: TeachingRequestDTO
  ): Observable<
    HttpGlobalResponse<TeachingResponseDTO>
  > {

    return this.http.put<
      HttpGlobalResponse<TeachingResponseDTO>
    >(
      `${this.api}/teacher/${idUser}`,
      dto
    );
  }

  actualizarEstudiante(
    idUser: number,
    dto: UpdateStudentDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.put<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/${idUser}/student`,
      dto
    );
  }

  asignarCurso(
    idUser: number,
    idCourse: number | null
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.put<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/${idUser}/course`,
      { idCourse }
    );
  }

  actualizarStaff(
    idUser: number,
    dto: UpdateStaffDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.put<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/${idUser}/staff`,
      dto
    );
  }

  actualizarRol(
    idUser: number,
    dto: UpdateRoleDTO
  ): Observable<HttpGlobalResponse<void>> {

    return this.http.put<
      HttpGlobalResponse<void>
    >(
      `${this.api}/users/${idUser}/role`,
      dto
    );
  }

  /**
   * Obtiene los cursos para el filtro.
   *
   * Se solicitan hasta 1000 cursos porque este listado
   * se utiliza como catálogo del filtro y no como listado
   * principal paginado.
   */
  listarCursos(): Observable<
    HttpGlobalResponse<CourseBasicoDTO[]>
  > {

    return this.http.get<
      HttpGlobalResponse<PageResponse<CourseBasicoDTO>>
    >(
      '/gestion-academica/eduplanner/courses',
      {
        params: {
          page: '0',
          size: '1000'
        }
      }
    ).pipe(
      map(response => ({
        data: response.data?.content ?? [],
        message: response.message
      }))
    );
  }
}