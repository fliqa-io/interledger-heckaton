import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-payment-entry',
  imports: [FormsModule],
  templateUrl: './customer-payment-entry.html',
  styleUrl: './customer-payment-entry.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerPaymentEntryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly paymentId = signal<string>('');

  ngOnInit(): void {
    // Get payment ID from query parameter
    const paymentIdParam = this.route.snapshot.queryParamMap.get('paymentId');

    if (paymentIdParam) {
      this.paymentId.set(paymentIdParam);
    }
  }

  protected navigateToPayment(): void {
    const id = this.paymentId();
    if (id && id.trim()) {
      this.router.navigate(['/customer/payment', id.trim()]);
    }
  }
}