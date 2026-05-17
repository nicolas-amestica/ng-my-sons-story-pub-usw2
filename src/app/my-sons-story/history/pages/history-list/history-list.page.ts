import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HistoryStore } from '@my-sons-story/history/stores/history.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import type { HistoryEntry } from '@my-sons-story/history/interfaces/history-entry.interface';

@Component({
  selector: 'app-history-list-page',
  imports: [RouterLink, ButtonModule, ConfirmDialogModule],
  templateUrl: './history-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryListPage {
  protected readonly store = inject(HistoryStore);
  protected readonly personCtx = inject(PersonContextStore);
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);

  protected readonly sortedEntries = computed(() =>
    [...this.store.entries()].sort((a, b) => {
      const byDate = b.journalDate.localeCompare(a.journalDate);
      return byDate !== 0 ? byDate : (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    }),
  );

  constructor() {
    effect(() => {
      if (this.personCtx.selectedPerson()) {
        this.store.loadList();
      }
    });
  }

  formatTime(isoString?: string): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  confirmDelete(row: HistoryEntry): void {
    this.confirmation.confirm({
      message: '¿Eliminar esta entrada del diario?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.store.remove({ id: row.id }),
    });
  }

  excerpt(html: string, max = 120): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html ?? '';
    const text = (tmp.textContent ?? tmp.innerText ?? '').replace(/\s+/g, ' ').trim();
    return text.length <= max ? text : `${text.slice(0, max)}…`;
  }

  viewEntry(row: HistoryEntry): void {
    void this.router.navigate(['/historias', row.id, 'ver']);
  }
}
