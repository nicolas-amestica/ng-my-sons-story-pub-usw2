import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { HistoryStore } from '@my-sons-story/history/stores/history.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import type { HistoryAttachment } from '@my-sons-story/history/interfaces/history-entry.interface';

@Component({
  selector: 'app-history-detail-page',
  imports: [RouterLink, ButtonModule, GalleriaModule],
  templateUrl: './history-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryDetailPage implements OnInit {
  protected readonly store = inject(HistoryStore);
  protected readonly personCtx = inject(PersonContextStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly entryId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly imageAttachments = computed(() =>
    (this.store.selected()?.attachments ?? []).filter(
      (a: HistoryAttachment) => a.viewUrl && a.contentType.startsWith('image/'),
    ),
  );

  ngOnInit(): void {
    const id = this.entryId();
    if (id) this.store.loadDetail({ id });
  }

  goEdit(): void {
    void this.router.navigate(['/historias', this.entryId(), 'editar']);
  }
}
