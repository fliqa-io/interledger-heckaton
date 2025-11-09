import { Injectable } from '@angular/core';

export interface CashierTransaction {
  id: string;
  amount: string;
  currency: string;
  customer: string;
  status: 'completed' | 'failed' | 'pending';
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CashierTransactionsService {
  private readonly STORAGE_KEY = 'cashierTransactions';

  /**
   * Get all stored cashier transactions
   */
  getTransactions(): CashierTransaction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const transactions = JSON.parse(stored) as CashierTransaction[];
      // Convert date strings back to Date objects
      return transactions.map(t => ({
        ...t,
        date: new Date(t.date)
      }));
    } catch (error) {
      console.error('Error reading cashier transactions from storage:', error);
      return [];
    }
  }

  /**
   * Add a new transaction to storage
   */
  addTransaction(transaction: CashierTransaction): void {
    try {
      const transactions = this.getTransactions();

      // Add new transaction at the beginning
      transactions.unshift(transaction);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving cashier transaction to storage:', error);
    }
  }

  /**
   * Clear all stored transactions
   */
  clearTransactions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cashier transactions from storage:', error);
    }
  }
}
