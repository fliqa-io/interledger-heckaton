import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CustomerPaymentService } from '../services/customer-payment.service';

@Component({
  selector: 'app-customer-result',
  imports: [DecimalPipe],
  templateUrl: './customer-result.html',
  styleUrl: './customer-result.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerResultComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly paymentService = inject(CustomerPaymentService);

  protected readonly success = signal<boolean>(false);
  protected readonly amount = signal<string>('0.00');
  protected readonly currency = signal<string>('EUR');

  protected readonly walletServer = signal<string>('');
  protected readonly walletName = signal<string>('');
  protected readonly transactionId = signal<string>('');
  protected readonly isProcessing = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    // Get payment ID from route parameter
    const paymentId = this.route.snapshot.paramMap.get('paymentId');

    // Check for interact_ref query parameter (from payment redirect)
    const interactRef = this.route.snapshot.queryParamMap.get('interact_ref');

    if (paymentId && interactRef) {
      // Finalize payment with interact_ref
      this.finalizePayment(paymentId, interactRef);
    } else {
      // Fallback to old state-based logic (for errors)
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
        // If no state or params, redirect to transactions
        void this.router.navigate(['/customer/transactions']);
      }
    }
  }

  private finalizePayment(paymentId: string, interactRef: string): void {
    this.isProcessing.set(true);
    this.errorMessage.set('');

    // Get payment details from storage to display amount
    const payment = this.paymentService.getPayment();
    if (payment) {
      this.amount.set(payment.amount.toString());
      this.currency.set(payment.currency.toString());
    }

    // Call API to finalize payment
    this.http.post(`/api/pay/${paymentId}/finalize?interact_ref=${encodeURIComponent(interactRef)}`, {}).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.success.set(true);
        this.transactionId.set(paymentId);

        // Add completed payment to history
        if (payment) {
          this.paymentService.addCompletedPayment(payment);
        }

        // Clear payment from storage
        this.paymentService.clearPayment();
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.success.set(false);

        if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Payment finalization failed. Please contact support.');
        } else {
          this.errorMessage.set('Payment finalization failed. Please contact support.');
        }

        // Add failed payment to history
        if (payment) {
          this.paymentService.addFailedPayment(payment);
        }

        console.error('Payment finalization failed:', error);
      }
    });
  }

  private generateTransactionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  protected goHome(): void {
    this.router.navigate(['/customer/transactions']);
  }
}