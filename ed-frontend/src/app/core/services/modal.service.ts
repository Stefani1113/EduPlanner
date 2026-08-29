import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'confirm'
  | 'question';

export interface ModalData {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private readonly initialState: ModalData = {
    visible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false
  };

  private modalSubject =
    new BehaviorSubject<ModalData>(this.initialState);

  modal$ = this.modalSubject.asObservable();

  private resolver: ((value: boolean) => void) | null = null;

  success(
    message: string,
    title = '¡Éxito!'
  ): Promise<boolean> {
    return this.open({
      type: 'success',
      title,
      message,
      confirmText: 'Aceptar',
      cancelText: '',
      showCancel: false
    });
  }

  error(
    message: string,
    title = 'Error'
  ): Promise<boolean> {
    return this.open({
      type: 'error',
      title,
      message,
      confirmText: 'Aceptar',
      cancelText: '',
      showCancel: false
    });
  }

  warning(
    message: string,
    title = 'Advertencia'
  ): Promise<boolean> {
    return this.open({
      type: 'warning',
      title,
      message,
      confirmText: 'Aceptar',
      cancelText: '',
      showCancel: false
    });
  }

  info(
    message: string,
    title = 'Información'
  ): Promise<boolean> {
    return this.open({
      type: 'info',
      title,
      message,
      confirmText: 'Entendido',
      cancelText: '',
      showCancel: false
    });
  }

  confirm(
    message: string,
    title = 'Confirmar acción',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    return this.open({
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  question(
    message: string,
    title = 'Pregunta',
    confirmText = 'Sí',
    cancelText = 'No'
  ): Promise<boolean> {
    return this.open({
      type: 'question',
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  private open(
    data: Omit<ModalData, 'visible'>
  ): Promise<boolean> {
    this.modalSubject.next({
      ...data,
      visible: true
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  responder(resultado: boolean): void {
    if (this.resolver) {
      this.resolver(resultado);
      this.resolver = null;
    }

    this.cerrar();
  }

  cerrar(): void {
    this.modalSubject.next(this.initialState);
  }
}