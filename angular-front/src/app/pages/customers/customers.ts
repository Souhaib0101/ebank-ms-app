import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, startWith, switchMap } from 'rxjs';
import { requestState, RequestStatus } from '../../models/request-state.model';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './customers.html',
})
export class Customers {
  private readonly service = inject(CustomerService);
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
