import { Injectable } from '@angular/core';
import {WalletInfo} from "./wallet-storage.service";

export interface CashierProfile {
  email: string;
  name: string;
  description: string;
  walletData: WalletInfo;
}

@Injectable({
  providedIn: 'root'
})
export class CashierProfileService {
  private readonly STORAGE_KEY = 'cashierProfile';

  setProfile(profile: CashierProfile): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  getProfile(): CashierProfile | null {
    const profileJson = localStorage.getItem(this.STORAGE_KEY);
    if (profileJson) {
      try {
        return JSON.parse(profileJson) as CashierProfile;
      } catch {
        return null;
      }
    }
    return null;
  }

  clearProfile(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return this.getProfile() !== null;
  }
}