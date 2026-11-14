import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, startWith, switchMap } from 'rxjs';
import { requestState, RequestStatus } from '../../models/request-state.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-accounts',
  imports: [AsyncPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './accounts.html',
})
export class Accounts {
  private readonly service = inject(AccountService);
  private readonly refresh = new Subject<void>();
  protected readonly status = RequestStatus;
  protected readonly state$ = this.refresh.pipe(
    startWith(undefined),
    switchMap(() => requestState(this.service.list())),
  );
  protected reload(): void {
    this.refresh.next();
  }
}
