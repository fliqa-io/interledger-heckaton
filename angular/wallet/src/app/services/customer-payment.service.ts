import { Injectable } from '@angular/core';

export interface WalletData {
  address: string;
  publicName: string;
  assetCode: string;
  assetScale: number;
  authServer: string;
  resourceServer: string;
}

export interface CustomerPayment {
  id: string;
  amount: number;
  currency: string;
  created: string;
  walletData: WalletData;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentService {
  private readonly STORAGE_KEY = 'customerCurrentPayment';

  setPayment(payment: CustomerPayment): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payment));
  }

  getPayment(): CustomerPayment | null {
    const paymentJson = localStorage.getItem(this.STORAGE_KEY);
    if (paymentJson) {
      try {
        return JSON.parse(paymentJson) as CustomerPayment;
      } catch {
        return null;
      }
    }
    return null;
  }

  clearPayment(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  hasPayment(): boolean {
    return this.getPayment() !== null;
  }
}