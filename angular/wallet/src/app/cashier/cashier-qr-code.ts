import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface PaymentStatus {
  id: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | null;
  created: string;
}

@Component({
  selector: 'app-cashier-qr-code',
  imports: [DecimalPipe],
  templateUrl: './cashier-qr-code.html',
  styleUrl: './cashier-qr-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierQRCodeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private statusPollingInterval: number | null = null;

  protected readonly amount = signal<string>('0.00');
  protected readonly currency = signal<string>('EUR');
  protected readonly paymentId = signal<string>('');
  protected readonly qrCodeImageUrl = signal<SafeUrl | null>(null);
  protected readonly paymentUrl = signal<string>('');
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly paymentStatus = signal<'Pending' | 'Processing' | 'Success' | 'Failed' | null>(null);

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
        this.currency.set(payment.currency.toString());
      } catch (e) {
        console.error('Failed to parse payment from localStorage', e);
      }
    }

    // Fetch QR code image and payment URL from API
    this.loadQRCode(paymentId);
    this.loadPaymentUrl(paymentId);

    // Start polling for payment status every 3 seconds
    this.startStatusPolling(paymentId);
  }

  ngOnDestroy(): void {
    // Clean up polling interval when component is destroyed
    this.stopStatusPolling();
  }

  private startStatusPolling(paymentId: string): void {
    // Poll immediately
    this.checkPaymentStatus(paymentId);

    // Then poll every 3 seconds
    this.statusPollingInterval = window.setInterval(() => {
      this.checkPaymentStatus(paymentId);
    }, 3000);
  }

  private stopStatusPolling(): void {
    if (this.statusPollingInterval !== null) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  private checkPaymentStatus(paymentId: string): void {
    this.http.get<PaymentStatus>(`/api/payment/${paymentId}`, {
      headers: { 'Accept': 'application/json' }
    }).subscribe({
      next: (payment) => {
        const status = payment.status;

        // Update payment status
        this.paymentStatus.set(status);

        // Stop polling if payment is completed or failed
        if (status === 'Success' || status === 'Failed') {
          this.stopStatusPolling();
        }
      },
      error: (error) => {
        console.error('Failed to check payment status:', error);
        // Don't stop polling on error, continue checking
      }
    });
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