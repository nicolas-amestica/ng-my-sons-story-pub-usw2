import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import type { BirthRecord, CreateBirthPayload } from '@my-sons-story/birthdate/interfaces/birth-record.interface';
import type { BirthdateState } from '@my-sons-story/birthdate/stores/birthdate.store';

/**
 * @description Crea o actualiza un nacimiento y refresca el listado.
 */
export function saveBirth(
  store: Store<BirthdateState>,
  svc = inject(BirthdateService),
  notify = inject(NotificationService),
) {
  return rxMethod<{ id?: string; payload: CreateBirthPayload | Partial<CreateBirthPayload> }>(
    pipe(
      tap(() => patchState(store, { isSaving: true, error: null })),
      switchMap(({ id, payload }) =>
        (id ? svc.update(id, payload) : svc.create(payload as CreateBirthPayload)).pipe(
          tap((saved: BirthRecord) => {
            notify.showToastSuccess(id ? 'Registro actualizado.' : 'Registro creado.');
            patchState(store, { selected: saved });
          }),
          switchMap(() =>
            svc.list().pipe(
              tap((records) => patchState(store, { records })),
              catchError(() => EMPTY),
            ),
          ),
          catchError(() => {
            notify.showToastError('No se pudo guardar el registro.');
            return EMPTY;
          }),
          finalize(() => patchState(store, { isSaving: false })),
        ),
      ),
    ),
  );
}
