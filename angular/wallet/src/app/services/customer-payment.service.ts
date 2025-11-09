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

export interface PaymentHistoryEntry {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  status: 'completed' | 'failed' | 'pending';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentService {
  private readonly STORAGE_KEY = 'customerCurrentPayment';
  private readonly HISTORY_KEY = 'customerPaymentHistory';
  private readonly MAX_HISTORY = 20;

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

  /**
   * Get payment history
   */
  getPaymentHistory(): PaymentHistoryEntry[] {
    try {
      const historyJson = localStorage.getItem(this.HISTORY_KEY);
      if (!historyJson) {
        return [];
      }
      return JSON.parse(historyJson) as PaymentHistoryEntry[];
    } catch (error) {
      console.error('Error reading payment history from storage:', error);
      return [];
    }
  }

  /**
   * Add a completed payment to history
   */
  addCompletedPayment(payment: CustomerPayment): void {
    const entry: PaymentHistoryEntry = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      merchant: payment.walletData.publicName,
      status: 'completed',
      date: new Date().toISOString()
    };

    this.addToHistory(entry);
  }

  /**
   * Add a failed payment to history
   */
  addFailedPayment(payment: CustomerPayment): void {
    const entry: PaymentHistoryEntry = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      merchant: payment.walletData.publicName,
      status: 'failed',
      date: new Date().toISOString()
    };

    this.addToHistory(entry);
  }

  /**
   * Add payment entry to history (internal method)
   */
  private addToHistory(entry: PaymentHistoryEntry): void {
    try {
      const history = this.getPaymentHistory();

      // Add new entry at the beginning
      history.unshift(entry);

      // Keep only the last MAX_HISTORY entries
      const limited = history.slice(0, this.MAX_HISTORY);

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving payment to history:', error);
    }
  }

  /**
   * Clear payment history
   */
  clearPaymentHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing payment history:', error);
    }
  }
}