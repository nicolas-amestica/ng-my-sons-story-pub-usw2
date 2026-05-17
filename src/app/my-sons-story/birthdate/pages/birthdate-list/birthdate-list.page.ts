import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { BirthdateStore } from '@my-sons-story/birthdate/stores/birthdate.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import type { BirthRecord } from '@my-sons-story/birthdate/interfaces/birth-record.interface';

@Component({
  selector: 'app-birthdate-list-page',
  imports: [RouterLink, ButtonModule, ConfirmDialogModule, ImageModule, TooltipModule],
  templateUrl: './birthdate-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthdateListPage implements OnInit {
  protected readonly store = inject(BirthdateStore);
  protected readonly personCtx = inject(PersonContextStore);
  private readonly confirmation = inject(ConfirmationService);

  ngOnInit(): void {
    this.store.loadList();
  }

  selectPerson(record: BirthRecord): void {
    this.personCtx.selectPerson(record);
  }

  isSelected(record: BirthRecord): boolean {
    return this.personCtx.selectedPerson()?.id === record.id;
  }

  confirmDelete(record: BirthRecord): void {
    this.confirmation.confirm({
      message: `¿Eliminar el registro de ${record.firstName} ${record.lastName}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.store.remove({ id: record.id }),
    });
  }

  initials(record: BirthRecord): string {
    return `${record.firstName.charAt(0)}${record.lastName.charAt(0)}`.toUpperCase();
  }
}
