import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./components/admin-login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin-register',
    loadComponent: () =>
      import('./components/admin-register/admin-register').then((m) => m.AdminRegister),
  },
  {
    path: 'worker-home',
    loadComponent: () => import('./components/worker-home/worker-home').then((m) => m.WorkerHome),
  },
  {
    path: 'admin-home',
    loadComponent: () => import('./components/admin-home/admin-home').then((m) => m.AdminHome),
  },
  {
    path: 'add-shift',
    loadComponent: () => import('./components/add-shift/add-shift').then((m) => m.AddShift),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./components/edit-profile/edit-profile').then((m) => m.EditProfile),
  },
  {
    path: 'all-shifts',
    loadComponent: () => import('./components/all-shifts/all-shifts').then((m) => m.AllShifts),
  },
  {
    path: 'all-workers',
    loadComponent: () => import('./components/all-workers/all-workers').then((m) => m.AllWorkers),
  },
  {
    path: 'edit-worker-profile',
    loadComponent: () =>
      import('./components/edit-worker-profile/edit-worker-profile').then(
        (m) => m.EditWorkerProfile
      ),
  },
  {
    path: 'filtershifts-worker',
    loadComponent: () =>
      import('./components/filtershifts-worker/filtershifts-worker').then(
        (m) => m.FiltershiftsWorker
      ),
  },
  { path: '**', redirectTo: '/login' },
];
