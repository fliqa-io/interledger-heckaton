import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CashierProfileService } from '../services/cashier-profile.service';

interface Transaction {
  id: string;
  amount: string;
  customer: string;
  status: 'completed' | 'failed' | 'pending';
  date: Date;
}

@Component({
  selector: 'app-cashier-transactions',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './cashier-transactions.html',
  styleUrl: './cashier-transactions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierTransactionsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly profileService = inject(CashierProfileService);

  protected readonly cashierEmail = signal<string>('');
  protected readonly cashierName = signal<string>('');
  protected readonly cashierDescription = signal<string>('');
  protected readonly walletAddress = signal<string>('');
  protected readonly transactions = signal<Transaction[]>([]);

  ngOnInit(): void {
    // First, try to get profile from localStorage
    const profile = this.profileService.getProfile();

    if (profile) {
      this.cashierEmail.set(profile.email);
      this.cashierName.set(profile.name);
      this.cashierDescription.set(profile.description);
      this.walletAddress.set(profile.paymentPointer);

      this.loadTransactions();
    } else {
      // Fallback to navigation state (for backwards compatibility)
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state || history.state;

      if (state?.['email']) {
        this.cashierEmail.set(state['email']);
        this.cashierName.set(state['name'] || state['email']);
        this.loadTransactions();
      } else {
        // If no cashier info, redirect to login
        void this.router.navigate(['/cashier/login']);
      }
    }
  }

  private loadTransactions(): void {
    // TODO: Load actual transactions from backend
    // For now, using mock data
    const mockTransactions: Transaction[] = [
      {
        id: 'TXN001',
        amount: '45.00',
        customer: 'Customer #1234',
        status: 'completed',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        id: 'TXN002',
        amount: '120.50',
        customer: 'Customer #5678',
        status: 'completed',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        id: 'TXN003',
        amount: '25.75',
        customer: 'Customer #9012',
        status: 'completed',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        id: 'TXN004',
        amount: '85.00',
        customer: 'Customer #3456',
        status: 'failed',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: 'TXN005',
        amount: '150.00',
        customer: 'Customer #7890',
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    this.transactions.set(mockTransactions);
  }

  protected createPayment(): void {
    // Navigate to amount entry page to create a new payment
    this.router.navigate(['/cashier/amount'], {
      state: {
        email: this.cashierEmail(),
        name: this.cashierName()
      }
    });
  }

  protected logout(): void {
    this.profileService.clearProfile();
    void this.router.navigate(['/cashier/login']);
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
