import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Routes } from '@angular/router';

@Component({
  selector: 'app-section-placeholder',
  imports: [AsyncPipe],
  template: `@if (route.data | async; as section) {
    <header class="page-heading">
      <div>
        <h1>{{ section['title'] }}</h1>
        <p>{{ section['description'] }}</p>
      </div>
    </header>
    <div class="card">
      <div class="card-body p-4 text-secondary">
        Cette section sera complétée dans les prochaines étapes du client Angular.
      </div>
    </div>
  }`,
})
class SectionPlaceholder {
  protected readonly route = inject(ActivatedRoute);
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'accounts' },
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
    component: SectionPlaceholder,
    data: {
      title: 'Assistant bancaire',
      description: 'Posez vos questions sur les clients et leurs comptes.',
    },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
