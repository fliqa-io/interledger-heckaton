import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-customer-result',
  imports: [DecimalPipe],
  templateUrl: './customer-result.html',
  styleUrl: './customer-result.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerResultComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly success = signal<boolean>(false);
  protected readonly amount = signal<string>('0.00');
  protected readonly walletServer = signal<string>('');
  protected readonly walletName = signal<string>('');
  protected readonly transactionId = signal<string>('');

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.['success'] !== undefined) {
      this.success.set(state['success']);
      this.amount.set(state['amount'] || '0.00');
      this.walletServer.set(state['walletServer'] || '');
      this.walletName.set(state['walletName'] || '');

      if (state['success']) {
        // Generate mock transaction ID
        this.transactionId.set(this.generateTransactionId());
      }
    } else {
      // If no state, redirect to login
      this.router.navigate(['/customer/login']);
    }
  }

  private generateTransactionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  protected makeAnotherPayment(): void {
    this.router.navigate(['/customer/login']);
  }

  protected goHome(): void {
    this.router.navigate(['/customer/login']);
  }
}