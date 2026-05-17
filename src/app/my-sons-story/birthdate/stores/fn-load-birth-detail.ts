import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, of, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import type { BirthdateState } from '@my-sons-story/birthdate/stores/birthdate.store';

/**
 * @description Carga detalle + breakdown de edad por id.
 */
export function loadBirthDetail(
  store: Store<BirthdateState>,
  svc = inject(BirthdateService),
  notify = inject(NotificationService),
) {
  return rxMethod<{ id: string }>(
    pipe(
      tap(() => patchState(store, { isLoading: true, error: null, ageBreakdown: null })),
      switchMap(({ id }) =>
        svc.getById(id).pipe(
          switchMap((selected) =>
            svc.getAge(selected.id).pipe(
              tap((ageBreakdown) => patchState(store, { selected, ageBreakdown })),
              catchError(() => {
                patchState(store, { selected, ageBreakdown: null });
                return of(null);
              }),
            ),
          ),
          catchError(() => {
            notify.showToastError('No se pudo cargar el registro.');
            patchState(store, { selected: null, ageBreakdown: null });
            return EMPTY;
          }),
          finalize(() => patchState(store, { isLoading: false })),
        ),
      ),
    ),
  );
}
