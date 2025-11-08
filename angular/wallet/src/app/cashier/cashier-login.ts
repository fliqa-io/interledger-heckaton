import { Component, signal, inject, effect, viewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cashier-login',
  imports: [ReactiveFormsModule],
  templateUrl: './cashier-login.html',
  styleUrl: './cashier-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashierLoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly otpSent = signal(false);
  protected readonly email = signal<string>('');

  // Reference to the OTP input field
  private readonly otpInput = viewChild<ElementRef<HTMLInputElement>>('otpInput');

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

  constructor() {
    // Focus on OTP input when OTP is sent
    effect(() => {
      if (this.otpSent() && this.otpInput()) {
        // Use setTimeout to ensure the input is rendered
        setTimeout(() => {
          this.otpInput()?.nativeElement.focus();
        }, 0);
      }
    });
  }

  ngOnInit(): void {
    // Check if email and OTP are provided via query parameters (from email link)
    this.route.queryParams.subscribe(params => {
      const emailParam = params['email'];
      const otpParam = params['otp'];

      if (emailParam && otpParam) {
        // Auto-login from email link
        this.loginFromEmailLink(emailParam, otpParam);
      }
    });
  }

  private loginFromEmailLink(email: string, otp: string): void {
    // Validate email format
    if (!this.isValidEmail(email)) {
      this.errorMessage.set('Invalid email address in link');
      return;
    }

    // Validate OTP format (4 digits)
    if (!/^[0-9]{4}$/.test(otp)) {
      this.errorMessage.set('Invalid OTP code in link');
      return;
    }

    this.isLoading.set(true);
    this.email.set(email);

    // TODO: Verify OTP with backend
    setTimeout(() => {
      this.isLoading.set(false);
      // In production, this would verify the OTP with the backend
      // If valid, navigate to the cashier transactions page
      this.router.navigate(['/cashier/transactions'], {
        state: { email: email, name: email.split('@')[0] }
      });
    }, 1000);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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

      // Generate mock OTP for demo purposes
      const mockOTP = Math.floor(1000 + Math.random() * 9000).toString();

      // In production, this would actually send an email with:
      // 1. The 4-digit OTP code
      // 2. A clickable link that logs them in directly
      const loginLink = `${window.location.origin}/cashier/login?email=${encodeURIComponent(emailValue)}&otp=${mockOTP}`;

      console.log(`OTP Email would be sent to: ${emailValue}`);
      console.log(`OTP Code: ${mockOTP}`);
      console.log(`One-Click Login Link: ${loginLink}`);
      console.log('\nEmail would contain:');
      console.log('- Your PIN code: ' + mockOTP);
      console.log('- Or click this link to login automatically: ' + loginLink);
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
      const emailValue = this.email();
      this.router.navigate(['/cashier/transactions'], {
        state: { email: emailValue, name: emailValue.split('@')[0] }
      });
    }, 1000);
  }

  protected backToEmail(): void {
    this.otpSent.set(false);
    this.errorMessage.set('');
    this.otpForm.reset();
  }
}