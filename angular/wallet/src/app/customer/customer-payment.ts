import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WalletStorageService } from '../services/wallet-storage.service';
import { CustomerPaymentService, type CustomerPayment } from '../services/customer-payment.service';

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
  private readonly paymentService = inject(CustomerPaymentService);

  protected readonly paymentId = signal<string>('');
  protected readonly walletServer = signal<string>('');
  protected readonly walletName = signal<string>('');

  protected readonly walletReceiverServer = signal<string>('');
  protected readonly walletReceiverName = signal<string>('');

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

    const walletInfo = this.walletStorage.getWalletInfo();

    this.walletServer.set(<string>walletInfo?.address);
    this.walletName.set(<string>walletInfo?.publicName);

    if (state?.['walletServer'] && state?.['walletName']) {


      this.loadPaymentDetails(paymentIdParam);
    } else {
      // Try to get wallet info from storage (last used wallet)
      const lastWallet = this.walletStorage.getLastWalletAddress();
      if (lastWallet) {
        // this.walletServer.set(lastWallet.server);
        // this.walletName.set(lastWallet.name);
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
    this.http.get<CustomerPayment>(`/api/payment/${paymentId}`, {
      headers: { Accept: 'application/json' }
    }).subscribe({
      next: (payment) => {
        this.isLoading.set(false);

        // Store payment details using service
        this.paymentService.setPayment(payment);

        // Set component state from payment details
        this.amount.set(payment.amount.toString());
        this.currency.set(payment.currency);
        this.merchantId.set(payment.walletData.publicName);
        this.walletReceiverName.set(payment.walletData.publicName);
        this.walletReceiverServer.set(payment.walletData.address);

        console.log(`Loaded payment: ${payment.id}, Amount: ${payment.amount} ${payment.currency}, Merchant: ${payment.walletData.publicName}`);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.errorMessage.set('Payment not found. The payment may have expired or been cancelled.');
        } else if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Invalid payment. Please try again.');
        } else {
          this.errorMessage.set('Failed to load payment details. Please try again.');
        }
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
    this.errorMessage.set('');

    // Construct wallet address
    const walletAddress = <string>this.walletStorage.getWalletInfo()?.address;
    const paymentId = this.paymentId();

    // Process payment via API
    this.http.post(`/api/pay/${paymentId}?customer=${encodeURIComponent(walletAddress)}`, {}, {
      responseType: 'text'
    }).subscribe({
      next: (redirectUrl: string) => {
        this.isProcessing.set(false);
        // Redirect user to the URL returned by the API
        window.location.href = redirectUrl;
      },
      error: (error) => {
        this.isProcessing.set(false);
        // Payment failed - show error message
        if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Payment failed. Please try again.');
        } else {
          this.errorMessage.set('Payment failed. Please try again.');
        }
        console.error('Payment failed:', error);
      }
    });
  }

  protected cancelPayment(): void {
    void this.router.navigate(['/customer/payment']);
  }
}