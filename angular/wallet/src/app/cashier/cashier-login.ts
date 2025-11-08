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

  protected readonly loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // TODO: Implement actual authentication
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/cashier/amount']);
    }, 1000);
  }
}