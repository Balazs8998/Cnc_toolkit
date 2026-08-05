import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'simulator',
    loadComponent: () => import('./simulator/components/simulator/simulator').then((m) => m.Simulator),
  },
  {
    path: 'chipbreak',
    loadComponent: () => import('./chipbreak/chipbreak').then((m) => m.Chipbreak),
  },
  {
    path: 'geometry',
    loadComponent: () => import('./geometry/geometry').then((m) => m.Geometry),
  },
  {
    path: 'cutting-data',
    loadComponent: () =>
      import('./cutting-data/cutting-data').then((m) => m.CuttingData),
  },
  {
    path: '**',
    loadComponent: () => import('./notfound/notfound').then((c) => c.NotFoundComponent),
  },
];
