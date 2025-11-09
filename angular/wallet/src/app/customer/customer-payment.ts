import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WalletStorageService } from '../services/wallet-storage.service';

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  cashier: string;
  created: string;
}

@Component({
  selector: 'app-customer-payment',
  imports: [DecimalPipe],
  templateUrl: './customer-payment.html',
  styleUrl: './customer-payment.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerPaymentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly walletStorage = inject(WalletStorageService);

  protected readonly paymentId = signal<string>('');
  protected readonly walletServer = signal<string>('');
  protected readonly walletName = signal<string>('');
  protected readonly amount = signal<string>('0.00');
  protected readonly currency = signal<string>('EUR');
  protected readonly merchantId = signal<string>('FLIQA_WALLET');
  protected readonly isProcessing = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly needsWalletInfo = signal(false);

  ngOnInit(): void {
    // Get payment ID from route parameter
    const paymentIdParam = this.route.snapshot.paramMap.get('paymentId');

    if (!paymentIdParam) {
      // No payment ID, redirect to transactions
      void this.router.navigate(['/customer/transactions']);
      return;
    }

    this.paymentId.set(paymentIdParam);

    // Try to get wallet info from navigation state first
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.['walletServer'] && state?.['walletName']) {
      this.walletServer.set(state['walletServer']);
      this.walletName.set(state['walletName']);
      this.loadPaymentDetails(paymentIdParam);
    } else {
      // Try to get wallet info from storage (last used wallet)
      const lastWallet = this.walletStorage.getLastWalletAddress();
      if (lastWallet) {
        this.walletServer.set(lastWallet.server);
        this.walletName.set(lastWallet.name);
        this.loadPaymentDetails(paymentIdParam);
      } else {
        // No wallet info available, user needs to enter it
        this.needsWalletInfo.set(true);
        // Load payment details anyway to show the amount
        this.loadPaymentDetails(paymentIdParam);
      }
    }
  }

  private loadPaymentDetails(paymentId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Load payment details from backend
    this.http.get<PaymentDetails>(`/api/payment/${paymentId}`, {
      headers: { Accept: 'application/json' }
    }).subscribe({
      next: (payment) => {
        this.isLoading.set(false);

        // Store payment details in localStorage
        localStorage.setItem('customerCurrentPayment', JSON.stringify(payment));

        // Set component state from payment details
        this.amount.set(payment.amount.toString());
        this.currency.set(payment.currency);
        this.merchantId.set(payment.cashier);

        console.log(`Loaded payment: ${payment.id}, Amount: ${payment.amount} ${payment.currency}, Cashier: ${payment.cashier}`);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to load payment details. Please try again.');
        console.error('Failed to load payment details:', error);
      }
    });
  }

  protected proceedWithLogin(): void {
    // Redirect to login and come back to this payment
    void this.router.navigate(['/customer/login'], {
      queryParams: { returnUrl: `/customer/payment/${this.paymentId()}` }
    });
  }

  protected confirmPayment(): void {
    this.isProcessing.set(true);

    // TODO: Process actual payment via Interledger
    setTimeout(() => {
      this.isProcessing.set(false);
      // Simulate success (could also simulate failure for testing)
      const success = Math.random() > 0.1; // 90% success rate for demo
      void this.router.navigate(['/customer/result'], {
        state: {
          success,
          amount: this.amount(),
          walletServer: this.walletServer(),
          walletName: this.walletName()
        }
      });
    }, 2000);
  }

  protected cancelPayment(): void {
    void this.router.navigate(['/customer/payment']);
  }
}