import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { WalletStorageService } from '../services/wallet-storage.service';

@Component({
  selector: 'app-customer-login',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerLoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly walletStorage = inject(WalletStorageService);

  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal(false);
  protected readonly recentAddresses = signal<Array<{server: string, name: string, fullAddress: string}>>([]);

  protected readonly loginForm = new FormGroup({
    walletAddress: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ])
  });

  ngOnInit(): void {
    // Load recent wallet addresses
    const addresses = this.walletStorage.getWalletAddresses();
    this.recentAddresses.set(addresses);

    // Prefill with last used address if available
    const lastAddress = this.walletStorage.getLastWalletAddress();
    if (lastAddress) {
      this.loginForm.patchValue({ walletAddress: lastAddress.fullAddress });
    }
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please enter a valid wallet address');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const walletAddress = this.loginForm.value.walletAddress?.trim() || '';

    let walletServer = 'https://ilp.interledger-test.dev';
    let walletName = walletAddress;

    // Check if the address is a URL
    if (this.isUrl(walletAddress)) {
      try {
        const url = new URL(walletAddress);
        walletServer = `${url.protocol}//${url.host}`;
        const pathname = url.pathname.replace(/^\//, ''); // Remove leading slash

        // Validate that pathname has only one segment (no additional slashes)
        if (!pathname || pathname.includes('/')) {
          this.isLoading.set(false);
          this.errorMessage.set('Invalid wallet address: must be in format server/name (only two parts)');
          return;
        }

        walletName = pathname;
      } catch (error) {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid wallet URL format');
        return;
      }
    } else {
      // If it's just a name, validate it doesn't contain slashes
      if (walletAddress.includes('/')) {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid wallet address: name cannot contain slashes');
        return;
      }
    }

    // Save wallet address to storage
    this.walletStorage.saveWalletAddress(walletServer, walletName);

    // TODO: Validate wallet address with backend
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/customer/transactions'], {
        state: { walletServer, walletName }
      });
    }, 1000);
  }

  protected selectRecentAddress(address: {server: string, name: string, fullAddress: string}): void {
    this.loginForm.patchValue({ walletAddress: address.fullAddress });
    this.onSubmit();
  }

  private isUrl(text: string): boolean {
    // Check if the text starts with http:// or https://
    return text.startsWith('http://') || text.startsWith('https://');
  }
}