import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
export class HistoryListPage implements OnInit {
  protected readonly store = inject(HistoryStore);
  protected readonly personCtx = inject(PersonContextStore);
  private readonly confirmation = inject(ConfirmationService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadList();
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

  excerpt(text: string, max = 120): string {
    // strip HTML tags for excerpt
    const stripped = text?.replace(/<[^>]*>/g, '') ?? '';
    return stripped.length <= max ? stripped : `${stripped.slice(0, max)}…`;
  }

  viewEntry(row: HistoryEntry): void {
    void this.router.navigate(['/historias', row.id, 'ver']);
  }
}
