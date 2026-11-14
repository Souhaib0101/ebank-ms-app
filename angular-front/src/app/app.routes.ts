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
    component: SectionPlaceholder,
    data: { title: 'Comptes bancaires', description: 'Consultez les comptes et leurs soldes.' },
  },
  {
    path: 'customers',
    component: SectionPlaceholder,
    data: { title: 'Clients', description: 'Retrouvez les clients de votre banque.' },
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
