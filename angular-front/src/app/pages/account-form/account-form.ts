import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField, min, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NewAccount } from '../../models/account.model';
import { errorMessage, requestState, RequestStatus } from '../../models/request-state.model';
import { AccountService } from '../../services/account.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-account-form',
  imports: [AsyncPipe, FormField, RouterLink],
  templateUrl: './account-form.html',
})
export class AccountForm {
  private readonly accounts = inject(AccountService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly status = RequestStatus;
  protected readonly customers$ = requestState(inject(CustomerService).list());
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly failure = signal('');
  protected readonly model = signal<Omit<NewAccount, 'customerId'> & { customerId: string }>({
    balance: 1000,
    type: '',
    customerId: '',
  });
  protected readonly accountForm = form(this.model, (fields) => {
    required(fields.balance, { message: 'Le solde est obligatoire.' });
    min(fields.balance, 1000, { message: 'Le solde initial doit être au moins égal à 1 000.' });
    required(fields.type, { message: 'Choisissez un type de compte.' });
    required(fields.customerId, { message: 'Choisissez un client.' });
  });

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.accountForm().invalid() || this.saving()) return;
    this.saving.set(true);
    this.failure.set('');
    this.accounts
      .create({ ...this.model(), customerId: Number(this.model().customerId) })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigate(['/accounts']),
        error: (error: unknown) => this.failure.set(errorMessage(error)),
      });
  }
}
