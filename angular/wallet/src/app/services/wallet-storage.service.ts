import { Injectable } from '@angular/core';

interface WalletAddressEntry {
  server: string;
  name: string;
  fullAddress: string;
  timestamp: number;
}

export interface WalletInfo {
  address: string;
  publicName: string;
  assetCode: string;
  assetScale: number;
  authServer: string;
  resourceServer: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletStorageService {
  private readonly STORAGE_KEY = 'wallet_addresses';
  private readonly MAX_ADDRESSES = 3;

  /**
   * Get all stored wallet addresses (up to 3 most recent)
   */
  getWalletAddresses(): WalletAddressEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as WalletAddressEntry[];
    } catch (error) {
      console.error('Error reading wallet addresses from storage:', error);
      return [];
    }
  }

  /**
   * Save a wallet address to storage
   * Keeps only the last 3 unique addresses
   */
  saveWalletAddress(server: string, name: string): void {
    try {
      const fullAddress = `${server}/${name}`;
      const addresses = this.getWalletAddresses();

      // Remove existing entry with same full address
      const filtered = addresses.filter(addr => addr.fullAddress !== fullAddress);

      // Add new entry at the beginning
      const newEntry: WalletAddressEntry = {
        server,
        name,
        fullAddress,
        timestamp: Date.now()
      };

      filtered.unshift(newEntry);

      // Keep only the last 3 addresses
      const limited = filtered.slice(0, this.MAX_ADDRESSES);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving wallet address to storage:', error);
    }
  }

  /**
   * Get the most recently used wallet address
   */
  getLastWalletAddress(): WalletAddressEntry | null {
    const addresses = this.getWalletAddresses();
    return addresses.length > 0 ? addresses[0] : null;
  }

  /**
   * Clear all stored wallet addresses
   */
  clearWalletAddresses(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wallet addresses from storage:', error);
    }
  }

  /**
   * Save wallet info to storage
   */
  saveWalletInfo(walletInfo: WalletInfo): void {
    try {
      localStorage.setItem('customerWalletInfo', JSON.stringify(walletInfo));
    } catch (error) {
      console.error('Error saving wallet info to storage:', error);
    }
  }

  /**
   * Get wallet info from storage
   */
  getWalletInfo(): WalletInfo | null {
    try {
      const stored = localStorage.getItem('customerWalletInfo');
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as WalletInfo;
    } catch (error) {
      console.error('Error reading wallet info from storage:', error);
      return null;
    }
  }

  /**
   * Clear wallet info from storage
   */
  clearWalletInfo(): void {
    try {
      localStorage.removeItem('customerWalletInfo');
    } catch (error) {
      console.error('Error clearing wallet info from storage:', error);
    }
  }

  saveWallet(walletInfo: WalletInfo): void {
    try {
      localStorage.setItem('customerWalletInfo', JSON.stringify(walletInfo));
    }
    catch (error) {
      console.error('Error saving wallet info to storage:', error);
    }
  }
}
