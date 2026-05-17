import { inject } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { catchError, EMPTY, finalize, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import type { Store } from '@shared/interfaces/store.interface';
import { NotificationService } from '@shared/services/notification.service';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import type { BirthdateState } from '@my-sons-story/birthdate/stores/birthdate.store';

/**
 * @description Borrado lógico y actualización de lista local.
 */
export function deleteBirth(store: Store<BirthdateState>, svc = inject(BirthdateService), notify = inject(NotificationService)) {
  return rxMethod<{ id: string }>(
    pipe(
      tap(() => patchState(store, { isSaving: true })),
      switchMap(({ id }) =>
        svc.delete(id).pipe(
          tap(() => {
            notify.showToastSuccess('Registro eliminado (lógico).');
            const records = store.records().filter((r) => r.id !== id);
            patchState(store, { records, selected: null, ageBreakdown: null });
          }),
          catchError(() => {
            notify.showToastError('No se pudo eliminar el registro.');
            return EMPTY;
          }),
          finalize(() => patchState(store, { isSaving: false })),
        ),
      ),
    ),
  );
}
