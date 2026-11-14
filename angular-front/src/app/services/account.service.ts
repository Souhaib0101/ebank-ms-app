import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Account, NewAccount } from '../models/account.model';
import { API } from './api';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  list() {
    return this.http.get<Account[]>(API.accounts);
  }
  create(account: NewAccount) {
    return this.http.post<Account>(API.accounts, account);
  }
}
