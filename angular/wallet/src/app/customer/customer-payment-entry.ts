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
  }
}