import type { Routes } from '@angular/router';
import { HistoryListPage } from '@my-sons-story/history/pages/history-list/history-list.page';
import { HistoryFormPage } from '@my-sons-story/history/pages/history-form/history-form.page';
import { HistoryDetailPage } from '@my-sons-story/history/pages/history-detail/history-detail.page';

export const historyRoutes: Routes = [
  { path: '', component: HistoryListPage },
  { path: 'nuevo', component: HistoryFormPage },
  { path: ':id/editar', component: HistoryFormPage },
  { path: ':id/ver', component: HistoryDetailPage },
];
