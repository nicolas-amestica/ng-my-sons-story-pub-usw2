import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { STORAGE_KEYS } from '@shared/constants/storage-keys.constant';
import type { BirthRecord } from '@my-sons-story/birthdate/interfaces/birth-record.interface';

interface PersonContextState {
  selectedPerson: BirthRecord | null;
  defaultPersonId: string | null;
}

export const PersonContextStore = signalStore(
  { providedIn: 'root' },
  withState<PersonContextState>({
    selectedPerson: null,
    defaultPersonId: null,
  }),
  withComputed(({ selectedPerson }) => ({
    selectedPersonName: computed(() => {
      const p = selectedPerson();
      return p ? `${p.firstName} ${p.lastName}` : null;
    }),
    selectedPersonPhotoUrl: computed(() => (selectedPerson() as any)?.profilePhotoUrl ?? null),
  })),
  withMethods((store) => ({
    selectPerson(person: BirthRecord): void {
      patchState(store, { selectedPerson: person });
    },
    setAsDefault(id: string): void {
      patchState(store, { defaultPersonId: id });
      localStorage.setItem(STORAGE_KEYS.DEFAULT_PERSON_ID, id);
    },
    clearDefault(): void {
      patchState(store, { defaultPersonId: null });
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_PERSON_ID);
    },
    loadDefault(records: BirthRecord[]): void {
      const savedId = localStorage.getItem(STORAGE_KEYS.DEFAULT_PERSON_ID);
      if (savedId) {
        patchState(store, { defaultPersonId: savedId });
        const found = records.find((r) => r.id === savedId);
        if (found) patchState(store, { selectedPerson: found });
        else if (records.length > 0) patchState(store, { selectedPerson: records[0] });
      } else if (records.length > 0) {
        patchState(store, { selectedPerson: records[0] });
      }
    },
  })),
);
