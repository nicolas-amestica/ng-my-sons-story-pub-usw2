import { MessageService } from 'primeng/api';
import { inject, Injectable } from '@angular/core';

const DEFAULT_LIFE = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);

  showToastSuccess(message: string, life = DEFAULT_LIFE): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: message, life });
  }

  showToastInfo(message: string, life = DEFAULT_LIFE): void {
    this.messageService.add({ severity: 'info', summary: 'Información', detail: message, life });
  }

  showToastWarn(message: string, life = DEFAULT_LIFE): void {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: message, life });
  }

  showToastError(message: string, life = DEFAULT_LIFE): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life });
  }
}
