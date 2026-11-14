export interface Customer {
  id: number;
  name: string;
  email: string;
}

export type NewCustomer = Omit<Customer, 'id'>;
