import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cashier-qr-code',
  imports: [DecimalPipe],
  templateUrl: './cashier-qr-code.html',
  styleUrl: './cashier-qr-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierQRCodeComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly amount = signal<string>('0.00');
  protected readonly qrCodeData = signal<string>('');

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.['amount']) {
      this.amount.set(state['amount']);
      this.generateQRData(state['amount']);
    } else {
      // If no amount, redirect back to amount page
      this.router.navigate(['/cashier/amount']);
    }
  }

  private generateQRData(amount: string): void {
    // Generate payment request data for QR code
    // This would typically include: amount, merchant ID, payment address, etc.
    const paymentData = {
      amount: amount,
      currency: 'USD',
      merchantId: 'FLIQA_WALLET',
      timestamp: new Date().toISOString()
    };

    this.qrCodeData.set(JSON.stringify(paymentData));
  }

  protected goBack(): void {
    this.router.navigate(['/cashier/amount']);
  }

  protected newTransaction(): void {
    this.router.navigate(['/cashier/amount']);
  }

  protected logout(): void {
    this.router.navigate(['/cashier/login']);
  }
}