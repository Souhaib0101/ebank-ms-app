import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NewCustomer } from '../../models/customer.model';
import { errorMessage } from '../../models/request-state.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  imports: [FormField, RouterLink],
  templateUrl: './customer-form.html',
})
export class CustomerForm {
  private readonly customers = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly failure = signal('');
  protected readonly model = signal<NewCustomer>({ name: '', email: '' });
  protected readonly customerForm = form(this.model, (fields) => {
    required(fields.name, { message: 'Le nom est obligatoire.' });
    required(fields.email, { message: "L'adresse e-mail est obligatoire." });
    email(fields.email, { message: 'Saisissez une adresse e-mail valide.' });
  });

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.model.update((value) => ({ name: value.name.trim(), email: value.email.trim() }));
    if (this.customerForm().invalid() || this.saving()) return;
    this.saving.set(true);
    this.failure.set('');
    this.customers
      .create(this.model())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigate(['/customers']),
        error: (error: unknown) => this.failure.set(errorMessage(error)),
      });
  }
}
