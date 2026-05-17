import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { HistoryService } from '@my-sons-story/history/services/history.service';
import type { HistoryState } from '@my-sons-story/history/stores/history.store';

export function deleteHistory(store: Store<HistoryState>, svc = inject(HistoryService), notify = inject(NotificationService)) {
  return rxMethod<{ id: string }>(
    pipe(
      tap(() => patchState(store, { isSaving: true })),
      switchMap(({ id }) =>
        svc.delete(id).pipe(
          tap(() => {
            notify.showToastSuccess('Historia eliminada (lógico).');
            const entries = store.entries().filter((e) => e.id !== id);
            patchState(store, { entries, selected: null });
          }),
          catchError(() => {
            notify.showToastError('No se pudo eliminar.');
            return EMPTY;
          }),
          finalize(() => patchState(store, { isSaving: false })),
        ),
      ),
    ),
  );
}
