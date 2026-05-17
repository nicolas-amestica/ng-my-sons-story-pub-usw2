import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { HistoryService } from '@my-sons-story/history/services/history.service';
import type { HistoryState } from '@my-sons-story/history/stores/history.store';

export function loadHistoryDetail(store: Store<HistoryState>, svc = inject(HistoryService), notify = inject(NotificationService)) {
  return rxMethod<{ id: string }>(
    pipe(
      tap(() => patchState(store, { isLoading: true, error: null })),
      switchMap(({ id }) =>
        svc.getById(id).pipe(
          tap((selected) => patchState(store, { selected })),
          catchError(() => {
            notify.showToastError('No se pudo cargar la historia.');
            patchState(store, { selected: null });
            return EMPTY;
          }),
          finalize(() => patchState(store, { isLoading: false })),
        ),
      ),
    ),
  );
}
