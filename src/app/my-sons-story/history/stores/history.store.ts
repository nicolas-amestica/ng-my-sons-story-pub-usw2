import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { HistoryEntry } from '@my-sons-story/history/interfaces/history-entry.interface';
import { loadHistories } from '@my-sons-story/history/stores/fn-load-histories';
import { loadHistoryDetail } from '@my-sons-story/history/stores/fn-load-history-detail';
import { deleteHistory } from '@my-sons-story/history/stores/fn-delete-history';

export interface HistoryState {
  entries: HistoryEntry[];
  selected: HistoryEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initial: HistoryState = {
  entries: [],
  selected: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const HistoryStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withComputed(({ entries, selected }) => ({
    hasEntries: computed(() => entries().length > 0),
    current: computed(() => selected()),
  })),
  withMethods((store) => ({
    resetDetail: () => patchState(store, { selected: null }),
    loadList: loadHistories(store),
    loadDetail: loadHistoryDetail(store),
    remove: deleteHistory(store),
  })),
);
