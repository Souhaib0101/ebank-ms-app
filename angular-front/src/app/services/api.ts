// The development proxy forwards /api to the Spring Cloud gateway.
export const API = {
  accounts: '/api/EBANK-SERVICE/accounts',
  customers: '/api/CUSTOMER-SERVICE/customers',
  bot: '/api/EBANK-BOT',
} as const;
