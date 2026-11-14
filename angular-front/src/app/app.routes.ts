import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'accounts' },
  {
    path: 'accounts/new',
    loadComponent: () => import('./pages/account-form/account-form').then((m) => m.AccountForm),
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts').then((m) => m.Accounts),
  },
  {
    path: 'customers/new',
    loadComponent: () => import('./pages/customer-form/customer-form').then((m) => m.CustomerForm),
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers/customers').then((m) => m.Customers),
  },
  {
    path: 'bot',
    loadComponent: () => import('./pages/bot/bot').then((m) => m.Bot),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
