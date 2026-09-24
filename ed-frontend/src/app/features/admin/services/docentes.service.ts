import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HttpGlobalResponse<T> {
  data: T;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TeachingRequestDTO {
  name: string;
  surnames: string;
  email: string;
  password: string;
  documentType: string;
  document: string;
  documentIssuePlace?: string;
  birthdate: string;
  phoneNumber?: string;
  photoUrl?: string;
  professionalDegrees: string;
  qualificationsDesc?: string;
  gender: string;
  address?: string;
  bloodType: string;
  disabilities?: string;
  stratum: number;
  populationType?: string;
  healthRegime?: string;
  eps?: string;
  position: string;
  idInstitution: number;
}

export interface TeachingResponseDTO {
  idUser: number;
  name: string;
  surnames: string;
  email: string;
  documentType: string;
  document: string;
  documentIssuePlace: string | null;
  birthdate: string;
  phoneNumber: string | null;
  status: boolean;
  photoUrl: string | null;
  professionalDegrees: string;
  qualificationsDesc: string | null;
  gender: string;
  address: string | null;
  bloodType: string;
  disabilities: string | null;
  stratum: number;
  populationType: string | null;
  healthRegime: string | null;
  eps: string | null;
  position: string;
  creationDate: string;
  updateDate: string;
  idInstitution: number;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocentesService {

  /**
   * Endpoint real del backend:
   * GET /administracion/eduplanner/teacher?page=0&size=10
   *
   * El backend devuelve Page<TeachingResponseDTO> dentro de data.
   */
  private readonly api = '/administracion/eduplanner/teacher';

  constructor(private http: HttpClient) {}

  listar(
    page = 0,
    size = 10,
    q = ''
  ): Observable<HttpGlobalResponse<PageResponse<TeachingResponseDTO>>> {

    const pagina = Math.max(0, page);
    const tamano = Math.max(1, size);
    const termino = q.trim();

    // El endpoint paginado /teacher NO recibe "q".
    // Cuando hay búsqueda, el backend actual expone /teacher/search?q=...
    // y devuelve una lista. La paginación de esa búsqueda se hace aquí,
    // únicamente en el frontend.
    if (termino) {
      return this.buscar(termino).pipe(
        map(respuesta => {
          const todos = respuesta.data ?? [];
          const inicio = pagina * tamano;
          const contenido = todos.slice(inicio, inicio + tamano);
          const totalElementos = todos.length;
          const totalPaginas = Math.max(
            1,
            Math.ceil(totalElementos / tamano)
          );

          return {
            data: {
              content: contenido,
              totalElements: totalElementos,
              totalPages: totalPaginas,
              number: pagina,
              size: tamano,
              first: pagina === 0,
              last: pagina >= totalPaginas - 1,
              empty: contenido.length === 0
            },
            message: respuesta.message
          };
        })
      );
    }

    return this.http.get<
      HttpGlobalResponse<PageResponse<TeachingResponseDTO>>
    >(
      this.api,
      {
        params: {
          page: pagina.toString(),
          size: tamano.toString()
        }
      }
    );
  }

  obtenerPorId(
    id: number
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.get<HttpGlobalResponse<TeachingResponseDTO>>(
      `${this.api}/${id}`
    );
  }

  crear(
    dto: TeachingRequestDTO
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.post<HttpGlobalResponse<TeachingResponseDTO>>(
      this.api,
      dto
    );
  }

  actualizar(
    id: number,
    dto: TeachingRequestDTO
  ): Observable<HttpGlobalResponse<TeachingResponseDTO>> {
    return this.http.put<HttpGlobalResponse<TeachingResponseDTO>>(
      `${this.api}/${id}`,
      dto
    );
  }

  eliminar(
    id: number
  ): Observable<HttpGlobalResponse<void>> {
    return this.http.delete<HttpGlobalResponse<void>>(
      `${this.api}/${id}`
    );
  }

  buscar(
    q: string
  ): Observable<HttpGlobalResponse<TeachingResponseDTO[]>> {
    return this.http.get<HttpGlobalResponse<TeachingResponseDTO[]>>(
      `${this.api}/search`,
      {
        params: { q: q.trim() }
      }
    );
  }
}
