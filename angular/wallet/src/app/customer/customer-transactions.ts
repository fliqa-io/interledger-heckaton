import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { WalletStorageService, type WalletInfo } from '../services/wallet-storage.service';
import { CustomerPaymentService, type PaymentHistoryEntry } from '../services/customer-payment.service';

interface Transaction {
  id: string;
  amount: string;
  merchant: string;
  status: 'completed' | 'failed' | 'pending';
  date: Date;
}

@Component({
  selector: 'app-customer-transactions',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './customer-transactions.html',
  styleUrl: './customer-transactions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerTransactionsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly walletStorage = inject(WalletStorageService);
  private readonly paymentService = inject(CustomerPaymentService);

  protected readonly walletAddress = signal<string>('');

  protected readonly walletName = signal<string>('');
  protected readonly walletCurrency = signal<string>('');

  protected readonly transactions = signal<Transaction[]>([]);

  ngOnInit(): void {
    // Try to get wallet info from storage first
    const walletInfo = this.walletStorage.getWalletInfo();

    if (walletInfo) {
      // Use wallet info from storage
      this.walletAddress.set(walletInfo.address);
      this.walletName.set(walletInfo.publicName);
      this.walletCurrency.set(walletInfo.assetCode);

      this.loadTransactions();
    } else {
      // Fallback: check navigation state
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state || history.state;

      if (state?.['walletServer'] && state?.['walletName']) {
        this.walletAddress.set(state['walletServer']);
        this.walletName.set(state['walletName']);

        this.loadTransactions();
      } else {
        // If no wallet info in storage or state, redirect to login
        void this.router.navigate(['/customer/login']);
      }
    }
  }

  private loadTransactions(): void {
    // Load payment history from storage
    const paymentHistory = this.paymentService.getPaymentHistory();

    // Convert payment history entries to transaction format
    const transactions: Transaction[] = paymentHistory.map((entry) => ({
      id: entry.id,
      amount: `${entry.amount.toFixed(2)}`,
      merchant: entry.merchant,
      status: entry.status,
      date: new Date(entry.date)
    }));

    this.transactions.set(transactions);
  }

  protected scanToPay(): void {
    // Generate a mock payment ID (in production, this would come from scanning a QR code)
    //const mockPaymentId = 'PAY-' + Date.now();

    this.router.navigate(['/customer/payment'], {
      state: {
        walletServer: this.walletAddress(),
        walletName: this.walletName()
      }
    });
  }

  protected logout(): void {
    // Clear wallet info and payment history on logout
    this.walletStorage.clearWalletInfo();
    this.paymentService.clearPaymentHistory();

    void this.router.navigate(['/customer/login']);
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
}
