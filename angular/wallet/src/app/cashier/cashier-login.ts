import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cashier-login',
  imports: [ReactiveFormsModule],
  templateUrl: './cashier-login.html',
  styleUrl: './cashier-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierLoginComponent {
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly otpSent = signal(false);
  protected readonly email = signal<string>('');

  protected readonly emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  protected readonly otpForm = new FormGroup({
    otp: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(4),
      Validators.pattern(/^[0-9]{4}$/)
    ])
  });

  protected sendOTP(): void {
    if (this.emailForm.invalid) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const emailValue = this.emailForm.value.email || '';
    this.email.set(emailValue);

    // TODO: Send OTP to email via backend
    setTimeout(() => {
      this.isLoading.set(false);
      this.otpSent.set(true);
      // In production, this would actually send an email
      console.log(`OTP would be sent to: ${emailValue}`);
    }, 1000);
  }

  protected verifyOTP(): void {
    if (this.otpForm.invalid) {
      this.errorMessage.set('Please enter a valid 4-digit PIN code');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // TODO: Verify OTP with backend
    setTimeout(() => {
      this.isLoading.set(false);
      // In production, this would verify the OTP
      this.router.navigate(['/cashier/amount']);
    }, 1000);
  }

  protected backToEmail(): void {
    this.otpSent.set(false);
    this.errorMessage.set('');
    this.otpForm.reset();
  }
}