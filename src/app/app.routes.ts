import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nacimientos' },
  {
    path: 'nacimientos',
    loadChildren: () =>
      import('./my-sons-story/birthdate/management.routes').then((m) => m.birthdateRoutes),
  },
  {
    path: 'historias',
    loadChildren: () =>
      import('./my-sons-story/history/management.routes').then((m) => m.historyRoutes),
  },
  { path: '**', redirectTo: 'nacimientos' },
];
