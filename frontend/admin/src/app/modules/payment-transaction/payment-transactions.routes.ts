import { Routes } from '@angular/router';
import { ROUTES } from '@constants';
import { PaymentTransactions } from './components/payment-transaction/payment-transaction.js';

export const PAYMENT_TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    component: PaymentTransactions,
  },
  {
    path: ROUTES.PAYMENT_TRANSACTIONS.DETAIL,
    loadComponent: () =>
      import('./components/payment-transaction-detail/payment-transaction-detail').then(
        (m) => m.PaymentTransactionDetail
      ),
  },
];