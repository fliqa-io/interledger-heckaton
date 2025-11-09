import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CashierProfileService } from '../services/cashier-profile.service';
import { CashierTransactionsService, CashierTransaction } from '../services/cashier-transactions.service';

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
  private readonly transactionsService = inject(CashierTransactionsService);

  protected readonly cashierEmail = signal<string>('');
  protected readonly cashierName = signal<string>('');
  protected readonly cashierDescription = signal<string>('');
  protected readonly walletAddress = signal<string>('');
  protected readonly transactions = signal<CashierTransaction[]>([]);

  ngOnInit(): void {
    // First, try to get profile from localStorage
    const profile = this.profileService.getProfile();

    if (profile) {
      this.cashierEmail.set(profile.email);
      this.cashierName.set(profile.name);
      this.cashierDescription.set(profile.description);
      this.walletAddress.set(profile.walletData?.address);

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
    // Load transactions from storage
    const transactions = this.transactionsService.getTransactions();
    this.transactions.set(transactions);
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
