import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-customer-payment',
  imports: [DecimalPipe],
  templateUrl: './customer-payment.html',
  styleUrl: './customer-payment.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerPaymentComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly walletAddress = signal<string>('');
  protected readonly amount = signal<string>('0.00');
  protected readonly merchantId = signal<string>('FLIQA_WALLET');
  protected readonly isProcessing = signal(false);

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.['walletAddress']) {
      this.walletAddress.set(state['walletAddress']);
      // In real implementation, this would fetch payment details from QR code or deep link
      this.loadPaymentDetails();
    } else {
      // If no wallet address, redirect to login
      this.router.navigate(['/customer/login']);
    }
  }

  private loadPaymentDetails(): void {
    // TODO: Load actual payment details from backend/QR code
    // For now, using mock data
    this.amount.set('25.00');
    this.merchantId.set('FLIQA_WALLET');
  }

  protected confirmPayment(): void {
    this.isProcessing.set(true);

    // TODO: Process actual payment via Interledger
    setTimeout(() => {
      this.isProcessing.set(false);
      // Simulate success (could also simulate failure for testing)
      const success = Math.random() > 0.1; // 90% success rate for demo
      this.router.navigate(['/customer/result'], {
        state: {
          success,
          amount: this.amount(),
          walletAddress: this.walletAddress()
        }
      });
    }, 2000);
  }

  protected cancelPayment(): void {
    this.router.navigate(['/customer/login']);
  }
}