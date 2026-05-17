import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { HistoryService } from '@my-sons-story/history/services/history.service';
import type { HistoryState } from '@my-sons-story/history/stores/history.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';

export function loadHistories(
  store: Store<HistoryState>,
  svc = inject(HistoryService),
  notify = inject(NotificationService),
  personCtx = inject(PersonContextStore),
) {
  return rxMethod<void>(
    pipe(
      tap(() => patchState(store, { isLoading: true, error: null })),
      switchMap(() => {
        const birthdateId = personCtx.selectedPerson()?.id;
        return svc.list(birthdateId).pipe(
          tap((entries) => patchState(store, { entries })),
          catchError(() => {
            notify.showToastError('No se pudieron cargar las historias.');
            patchState(store, { entries: [] });
            return EMPTY;
          }),
          finalize(() => patchState(store, { isLoading: false })),
        );
      }),
    ),
  );
}
