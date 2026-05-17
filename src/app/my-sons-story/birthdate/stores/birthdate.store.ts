import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { AgeBreakdownResponse, BirthRecord } from '@my-sons-story/birthdate/interfaces/birth-record.interface';
import { loadBirths } from '@my-sons-story/birthdate/stores/fn-load-births';
import { loadBirthDetail } from '@my-sons-story/birthdate/stores/fn-load-birth-detail';
import { saveBirth } from '@my-sons-story/birthdate/stores/fn-save-birth';
import { deleteBirth } from '@my-sons-story/birthdate/stores/fn-delete-birth';

export interface BirthdateState {
  records: BirthRecord[];
  selected: BirthRecord | null;
  ageBreakdown: AgeBreakdownResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initial: BirthdateState = {
  records: [],
  selected: null,
  ageBreakdown: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

/**
 * @description Estado de pantallas de nacimiento (lista + formulario), patrón portal + signalStore.
 */
export const BirthdateStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withComputed(({ records, selected, ageBreakdown }) => ({
    hasRecords: computed(() => records().length > 0),
    ageSummary: computed(() => {
      const a = ageBreakdown()?.breakdown;
      if (!a) return null;
      return `${a.years}a ${a.months}m ${a.days}d ${a.hours}h`;
    }),
    current: computed(() => selected()),
  })),
  withMethods((store) => ({
    resetDetail: () => patchState(store, { selected: null, ageBreakdown: null }),
    loadList: loadBirths(store),
    loadDetail: loadBirthDetail(store),
    save: saveBirth(store),
    remove: deleteBirth(store),
  })),
);
