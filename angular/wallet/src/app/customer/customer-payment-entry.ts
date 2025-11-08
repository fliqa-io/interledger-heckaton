import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WalletStorageService } from '../services/wallet-storage.service';

@Component({
  selector: 'app-customer-payment',
  imports: [DecimalPipe],
  templateUrl: './customer-payment.html',
  styleUrl: './customer-payment.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerPaymentEntryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly walletStorage = inject(WalletStorageService);

  protected readonly paymentId = signal<string>('');
  protected readonly walletServer = signal<string>('');
  protected readonly walletName = signal<string>('');
  protected readonly amount = signal<string>('0.00');
  protected readonly merchantId = signal<string>('FLIQA_WALLET');
  protected readonly isProcessing = signal(false);
  protected readonly needsWalletInfo = signal(false);

  ngOnInit(): void {
    // Get payment ID from route parameter
    const paymentIdParam = this.route.snapshot.paramMap.get('paymentId');

    if (!paymentIdParam) {
      // No payment ID, redirect to transactions
      this.router.navigate(['/customer/transactions']);
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
    // TODO: Load actual payment details from backend using payment ID
    // The backend would return: amount, merchant, etc.
    // For now, using mock data based on payment ID

    // Mock: extract amount from payment ID if it follows a pattern
    // In production, this would be a real API call
    const mockAmount = '25.00'; // Default
    this.amount.set(mockAmount);
    this.merchantId.set('FLIQA_WALLET');

    console.log(`Loading payment details for payment ID: ${paymentId}`);
  }

  protected proceedWithLogin(): void {
    // Redirect to login and come back to this payment
    this.router.navigate(['/customer/login'], {
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
      this.router.navigate(['/customer/result'], {
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
    this.router.navigate(['/customer/login']);
  }
}