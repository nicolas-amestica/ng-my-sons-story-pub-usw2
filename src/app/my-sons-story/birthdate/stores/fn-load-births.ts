import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import type { BirthdateState } from '@my-sons-story/birthdate/stores/birthdate.store';

/**
 * @description Carga el listado de nacimientos activos desde la API.
 */
export function loadBirths(
  store: Store<BirthdateState>,
  svc = inject(BirthdateService),
  notify = inject(NotificationService),
  personCtx = inject(PersonContextStore),
) {
  return rxMethod<void>(
    pipe(
      tap(() => patchState(store, { isLoading: true, error: null })),
      switchMap(() =>
        svc.list().pipe(
          tap((records) => {
            patchState(store, { records });
            personCtx.loadDefault(records); // auto-seleccionar predeterminado
          }),
          catchError(() => {
            notify.showToastError('No se pudieron cargar los nacimientos.');
            patchState(store, { records: [] });
            return EMPTY;
          }),
          finalize(() => patchState(store, { isLoading: false })),
        ),
      ),
    ),
  );
}
