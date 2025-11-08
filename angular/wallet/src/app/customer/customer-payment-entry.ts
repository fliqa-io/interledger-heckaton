import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {WalletStorageService} from '../services/wallet-storage.service';

@Component({
    selector: 'app-customer-payment-entry',
    imports: [FormsModule],
    templateUrl: './customer-payment-entry.html',
    styleUrl: './customer-payment-entry.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerPaymentEntryComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly walletStorage = inject(WalletStorageService);

    protected readonly walletServer = signal<string>('');
    protected readonly walletName = signal<string>('');

    protected readonly paymentId = signal<string>('');

    ngOnInit(): void {
        // Get payment ID from query parameter
        const paymentIdParam = this.route.snapshot.queryParamMap.get('paymentId');

        if (paymentIdParam) {
            this.paymentId.set(paymentIdParam);
        }

        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || history.state;

        if (state?.['walletServer'] && state?.['walletName']) {
            this.walletServer.set(state['walletServer']);
            this.walletName.set(state['walletName']);
        } else {
            // Try to get wallet info from storage (last used wallet)
            const lastWallet = this.walletStorage.getLastWalletAddress();
            if (lastWallet) {
                this.walletServer.set(lastWallet.server);
                this.walletName.set(lastWallet.name);
            }
        }
    }

    protected navigateToPayment(): void {
        const id = this.paymentId();
        if (id && id.trim()) {
            this.router.navigate(['/customer/payment', id.trim()]);
        }
    }

    protected cancelPayment(): void {
        // Get wallet info from signals or storage
        let walletServer = this.walletServer();
        let walletName = this.walletName();

        // If not available in signals, try to get from storage
        if (!walletServer || !walletName) {
            const lastWallet = this.walletStorage.getLastWalletAddress();
            if (lastWallet) {
                walletServer = lastWallet.server;
                walletName = lastWallet.name;
            }
        }

        this.router.navigate(['/customer/transactions'], {
            state: {
                walletServer,
                walletName,
            }
        });
    }
}