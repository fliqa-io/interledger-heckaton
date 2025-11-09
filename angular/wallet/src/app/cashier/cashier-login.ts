import { Component, signal, inject, effect, viewChild, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CashierProfileService, type CashierProfile } from '../services/cashier-profile.service';

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
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(CashierProfileService);

  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly otpSent = signal(false);
  protected readonly email = signal<string>('');

  // Reference to the OTP input field
  private readonly otpInput = viewChild<ElementRef<HTMLInputElement>>('otpInput');

  // Reference to the email input field
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');

  // LocalStorage key for storing last login email
  private readonly LAST_EMAIL_KEY = 'cashier_last_email';

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

    // Focus and select email input when email form is shown
    effect(() => {
      if (!this.otpSent() && !this.isLoading() && this.emailInput()) {
        // Use setTimeout to ensure the input is rendered
        setTimeout(() => {
          const input = this.emailInput()?.nativeElement;
          if (input) {
            input.focus();
            input.select();
          }
        }, 0);
      }
    });
  }

  ngOnInit(): void {
    // Load last login email from localStorage
    const lastEmail = localStorage.getItem(this.LAST_EMAIL_KEY);
    if (lastEmail) {
      this.emailForm.patchValue({ email: lastEmail });
    }

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

    // Verify OTP with backend
    const url = `/api/cashier/login?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;

    this.http.get<CashierProfile>(url, { observe: 'response' }).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        // Store user profile
        if (response.body) {
          this.profileService.setProfile(response.body);
          localStorage.setItem(this.LAST_EMAIL_KEY, email);
        }

        void this.router.navigate(['/cashier/transactions'], {
          state: { email: email, name: email.split('@')[0] }
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.errorMessage.set('Email address not found. Please try again.');
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('Invalid or expired login link. Please request a new one.');
        } else if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Invalid login link. Please try again.');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      }
    });
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

    // Call backend to send OTP
    const url = `/api/cashier/login?email=${encodeURIComponent(emailValue)}`;

    this.http.get(url, { observe: 'response' }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.status === 204) {
          // OTP was generated successfully
          this.otpSent.set(true);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.errorMessage.set('Email address not found. Please check and try again.');
        } else if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Invalid request. Please try again.');
        } else {
          this.errorMessage.set('Failed to send OTP. Please try again.');
        }
      }
    });
  }

  protected verifyOTP(): void {
    if (this.otpForm.invalid) {
      this.errorMessage.set('Please enter a valid 4-digit PIN code');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const emailValue = this.email();
    const otpValue = this.otpForm.value.otp || '';

    // Call backend to verify OTP
    const url = `/api/cashier/login?email=${encodeURIComponent(emailValue)}&otp=${encodeURIComponent(otpValue)}`;

    this.http.get<CashierProfile>(url, { observe: 'response' }).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        // Store user profile
        if (response.body) {
          this.profileService.setProfile(response.body);
          localStorage.setItem(this.LAST_EMAIL_KEY, emailValue);
        }

        void this.router.navigate(['/cashier/transactions'], {
          state: { email: emailValue, name: emailValue.split('@')[0] }
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.errorMessage.set('Email address not found. Please try again.');
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('Invalid PIN code. Please try again.');
        } else if (error.status >= 400 && error.status < 500) {
          this.errorMessage.set(error.error?.message || 'Invalid request. Please try again.');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      }
    });
  }

  protected backToEmail(): void {
    this.otpSent.set(false);
    this.errorMessage.set('');
    this.otpForm.reset();
  }
}