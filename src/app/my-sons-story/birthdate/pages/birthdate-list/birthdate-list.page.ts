import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { BirthdateStore } from '@my-sons-story/birthdate/stores/birthdate.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import type { BirthRecord } from '@my-sons-story/birthdate/interfaces/birth-record.interface';
import { computeLiveAge, formatLiveAge } from '@my-sons-story/shared/utils/live-age.util';

@Component({
  selector: 'app-birthdate-list-page',
  imports: [RouterLink, ButtonModule, CardModule, ConfirmDialogModule, ImageModule, TooltipModule],
  templateUrl: './birthdate-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthdateListPage implements OnInit {
  protected readonly store = inject(BirthdateStore);
  protected readonly personCtx = inject(PersonContextStore);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly liveAges = signal<Map<string, string>>(new Map());

  ngOnInit(): void {
    this.store.loadList();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateLiveAges());
  }

  private updateLiveAges(): void {
    const now = new Date();
    const map = new Map<string, string>();
    for (const r of this.store.records()) {
      if (r.birthDateTimeIso) {
        map.set(r.id, formatLiveAge(computeLiveAge(r.birthDateTimeIso, now)));
      }
    }
    this.liveAges.set(map);
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

  liveAge(id: string): string {
    return this.liveAges().get(id) ?? '';
  }
}
