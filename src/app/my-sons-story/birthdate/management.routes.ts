import type { Routes } from '@angular/router';
import { BirthdateListPage } from '@my-sons-story/birthdate/pages/birthdate-list/birthdate-list.page';
import { BirthdateFormPage } from '@my-sons-story/birthdate/pages/birthdate-form/birthdate-form.page';

export const birthdateRoutes: Routes = [
  { path: '', component: BirthdateListPage },
  { path: 'nuevo', component: BirthdateFormPage },
  { path: ':id/editar', component: BirthdateFormPage },
];
