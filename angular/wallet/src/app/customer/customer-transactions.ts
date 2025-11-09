import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { WalletStorageService, type WalletInfo } from '../services/wallet-storage.service';

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
    // TODO: Load actual transactions from backend
    // For now, using mock data
    const mockTransactions: Transaction[] = [
      {
        id: 'TXN001',
        amount: '25.00',
        merchant: 'FLIQA_WALLET',
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: 'TXN002',
        amount: '50.00',
        merchant: 'Coffee Shop',
        status: 'completed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        id: 'TXN003',
        amount: '15.50',
        merchant: 'Restaurant',
        status: 'failed',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: 'TXN004',
        amount: '100.00',
        merchant: 'Online Store',
        status: 'completed',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ];

    this.transactions.set(mockTransactions);
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
    this.router.navigate(['/customer/login']);
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
