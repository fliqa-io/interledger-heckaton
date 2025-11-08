import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cashier-amount',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './cashier-amount.html',
  styleUrl: './cashier-amount.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierAmountComponent {
  private readonly router = inject(Router);

  protected readonly displayAmount = signal<string>('0.00');

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

    // Navigate to QR code page with amount
    this.router.navigate(['/cashier/qr-code'], {
      state: { amount: this.displayAmount() }
    });
  }

  protected logout(): void {
    this.router.navigate(['/cashier/login']);
  }
}