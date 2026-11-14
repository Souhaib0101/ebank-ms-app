import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<section class="text-center py-5">
    <p class="text-secondary">Erreur 404</p>
    <h1>Page introuvable</h1>
    <a class="btn btn-primary mt-3" routerLink="/accounts">Retour aux comptes</a>
  </section>`,
})
export class NotFound {}
