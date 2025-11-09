import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CashierProfileService } from '../services/cashier-profile.service';

interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  created: string;
}

@Component({
  selector: 'app-cashier-amount',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './cashier-amount.html',
  styleUrl: './cashier-amount.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierAmountComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(CashierProfileService);

  protected readonly displayAmount = signal<string>('0.00');
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    // Read amount from query parameter if provided
    const amountParam = this.route.snapshot.queryParamMap.get('amount');
    if (amountParam) {
      let amount = parseFloat(amountParam);
      if (amount && !isNaN(amount) && amount > 0) {
        this.displayAmount.set(amount.toFixed(2).toString());
      }
      else {
        this.displayAmount.set('0');
      }
      this.amountForm.patchValue({ amount: amountParam });
    }
  }

  protected isValidAmount(): boolean {
    const amount = parseFloat(this.displayAmount());
    return !isNaN(amount) && amount > 0;
  }

  protected readonly amountForm = new FormGroup({
    amount: new FormControl('', [Validators.required, Validators.min(0.01)])
  });

  protected appendDigit(digit: string): void {
    const current = this.displayAmount();

    if (digit === '.' && current.includes('.')) {
      return;
    }

    if (current === '0.00' && digit !== '.') {
      this.displayAmount.set(digit);
    } else if (current === '0.00' && digit === '.') {
      this.displayAmount.set('0.');
    } else if (current === '0' && digit === '.') {
      this.displayAmount.set('0.');
    } else if (current === '0' && digit !== '.') {
      this.displayAmount.set(digit);
    } else {
      const [whole, decimal] = current.split('.');
      if (decimal !== undefined && decimal.length >= 2) {
        return;
      }
      this.displayAmount.set(current + digit);
    }

    this.amountForm.patchValue({ amount: this.displayAmount() });
  }

  protected clearAmount(): void {
    this.displayAmount.set('0.00');
    this.amountForm.patchValue({ amount: '' });
  }

  protected deleteDigit(): void {
    const current = this.displayAmount();
    if (current.length <= 1 || current === '0.00') {
      this.displayAmount.set('0.00');
      this.amountForm.patchValue({ amount: '' });
    } else {
      const newAmount = current.slice(0, -1);
      this.displayAmount.set(newAmount);
      this.amountForm.patchValue({ amount: newAmount });
    }
  }

  protected generateQRCode(): void {
    const amount = parseFloat(this.displayAmount());

    if (this.amountForm.invalid || isNaN(amount) || amount <= 0) {
      return;
    }

    // Get cashier profile
    const profile = this.profileService.getProfile();
    if (!profile) {
      this.errorMessage.set('Please login to create a payment');
      void this.router.navigate(['/cashier/login']);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Create payment via API
    const payload = {
      amount: this.displayAmount(),
      currency: 'EUR',
      email: profile.email
    };

    this.http.post<PaymentResponse>('/api/payment', payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        // Store payment in localStorage
        localStorage.setItem('currentPayment', JSON.stringify(response));

        // Navigate to QR code page with payment response
        void this.router.navigate(['/cashier/qr-code'], {
          state: {
            amount: this.displayAmount(),
            payment: response
          }
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to create payment. Please try again.');
      }
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/cashier/transactions']);
  }
}