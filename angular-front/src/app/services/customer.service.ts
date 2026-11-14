import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Customer, NewCustomer } from '../models/customer.model';
import { API } from './api';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  list() {
    return this.http.get<Customer[]>(API.customers);
  }
  create(customer: NewCustomer) {
    return this.http.post<Customer>(API.customers, customer);
  }
}
