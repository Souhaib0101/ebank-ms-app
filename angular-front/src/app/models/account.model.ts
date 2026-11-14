import { Customer } from './customer.model';

export interface Account {
  id: string;
  balance: number;
  createdAt: string;
  type: string;
  customerId: number;
  customer?: Customer | null;
}

export type NewAccount = Pick<Account, 'balance' | 'type' | 'customerId'>;
