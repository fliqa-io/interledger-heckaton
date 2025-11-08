import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-customer-login',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerLoginComponent {
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal(false);

  protected readonly loginForm = new FormGroup({
    walletAddress: new FormControl('', [
      Validators.required,
      Validators.minLength(10)
    ])
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please enter a valid wallet address');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // TODO: Validate wallet address with backend
    setTimeout(() => {
      this.isLoading.set(false);
      const walletAddress = this.loginForm.value.walletAddress;
      this.router.navigate(['/customer/payment'], {
        state: { walletAddress }
      });
    }, 1000);
  }

  protected pasteFromClipboard(): void {
    navigator.clipboard.readText().then(text => {
      this.loginForm.patchValue({ walletAddress: text });
    }).catch(() => {
      this.errorMessage.set('Failed to read from clipboard');
    });
  }
}