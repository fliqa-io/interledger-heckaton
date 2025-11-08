import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/customer/login',
    pathMatch: 'full'
  },
  // Cashier routes
  {
    path: 'cashier',
    redirectTo: '/cashier/login',
    pathMatch: 'full'
  },
  {
    path: 'cashier/login',
    loadComponent: () => import('./cashier/cashier-login').then(m => m.CashierLoginComponent)
  },
  {
    path: 'cashier/amount',
    loadComponent: () => import('./cashier/cashier-amount').then(m => m.CashierAmountComponent)
  },
  {
    path: 'cashier/qr-code',
    loadComponent: () => import('./cashier/cashier-qr-code').then(m => m.CashierQRCodeComponent)
  },
  // Customer routes
  {
    path: 'customer',
    redirectTo: '/customer/login',
    pathMatch: 'full'
  },
  {
    path: 'customer/login',
    loadComponent: () => import('./customer/customer-login').then(m => m.CustomerLoginComponent)
  },
  {
    path: 'customer/transactions',
    loadComponent: () => import('./customer/customer-transactions').then(m => m.CustomerTransactionsComponent)
  },
  {
    path: 'customer/payment',
    loadComponent: () => import('./customer/customer-payment').then(m => m.CustomerPaymentComponent)
  },
  {
    path: 'customer/result',
    loadComponent: () => import('./customer/customer-result').then(m => m.CustomerResultComponent)
  }
];
