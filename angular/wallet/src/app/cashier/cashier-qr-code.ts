import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cashier-qr-code',
  imports: [DecimalPipe],
  templateUrl: './cashier-qr-code.html',
  styleUrl: './cashier-qr-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierQRCodeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly amount = signal<string>('0.00');
  protected readonly paymentId = signal<string>('');
  protected readonly qrCodeImageUrl = signal<SafeUrl | null>(null);
  protected readonly paymentUrl = signal<string>('');
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    // Get payment ID from route parameter
    const paymentId = this.route.snapshot.paramMap.get('paymentId');

    if (!paymentId) {
      this.errorMessage.set('Payment ID not found');
      void this.router.navigate(['/cashier/amount']);
      return;
    }

    this.paymentId.set(paymentId);

    // Get payment details from localStorage if available
    const paymentJson = localStorage.getItem('currentPayment');
    if (paymentJson) {
      try {
        const payment = JSON.parse(paymentJson);
        this.amount.set(payment.amount.toString());
      } catch (e) {
        console.error('Failed to parse payment from localStorage', e);
      }
    }

    // Fetch QR code image and payment URL from API
    this.loadQRCode(paymentId);
    this.loadPaymentUrl(paymentId);
  }

  private loadQRCode(paymentId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Request QR code image with Accept: image/png header
    this.http.get(`/api/payment/${paymentId}`, {
      headers: {
        'Accept': 'image/png'
      },
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        this.isLoading.set(false);
        // Create object URL for the image blob
        const objectUrl = URL.createObjectURL(blob);
        // Sanitize the URL for safe use in template
        this.qrCodeImageUrl.set(this.sanitizer.bypassSecurityTrustUrl(objectUrl));
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to load QR code. Please try again.');
      }
    });
  }

  private loadPaymentUrl(paymentId: string): void {
    // Request payment URL with Accept: text/plain header
    this.http.get(`/api/payment/${paymentId}`, {
      headers: {
        'Accept': 'text/plain'
      },
      responseType: 'text'
    }).subscribe({
      next: (url) => {
        this.paymentUrl.set(url);
      },
      error: (error) => {
        console.error('Failed to load payment URL', error);
      }
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/cashier/amount'], {
      queryParams: { amount: this.amount() }
    });
  }

  protected newTransaction(): void {
    void this.router.navigate(['/cashier/amount']);
  }

  protected logout(): void {
    void this.router.navigate(['/cashier/login']);
  }
}