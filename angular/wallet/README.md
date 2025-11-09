# Wallet

An Angular-based wallet application that enables payments through Interledger Protocol (ILP),
featuring separate interfaces for cashiers (merchants) and customers.

The cashier app solves simplifies the usage of open-payments via ILP by reducing friction between the Cashier and the Customer.

## Build and run

```shell
cd angular
npm build
npm run
```

Pages are served on localhost:4200, backend must be running on localhost:8080 / see java part of project

## Cashier Flow

The cashier interface allows merchants to create and monitor payment requests:

1. **Login** (`/cashier/login`)
   - Enter email address to receive OTP
   - Verify with 4-digit PIN code

2. **Create Payment** (`/cashier/amount`)
   - Enter payment amount in EUR
   - Generate payment request via API (`POST /api/payment`)

3. **QR Code Display** (`/cashier/qr-code/:paymentId`)
   - Display QR code for customer scanning
   - Show payment URL as alternative 
   - **Real-time status monitoring** (polls every 3 seconds):
     - `Pending`: Show QR code, waiting for customer
     - `Processing`: Display spinner, customer is authorizing payment
     - `Success`: Show checkmark, payment completed
     - `Failed`: Show error, payment unsuccessful

4. **Transaction History** (`/cashier/transactions`)
   - View all payment requests
   - Track payment statuses

## Customer Flow

The customer interface allows users to make payments using their Interledger wallet:

1. **Login** (`/customer/login`)
   - Enter wallet address (full URL or wallet name)
   - Validates against backend (`GET /api/wallet?address={address}`)
   
2. **Scan Payment** (`/customer/payment/:paymentId`)
   - Access via QR code scan or direct payment id entry
   - Requires logged-in wallet
   - View payment details:
     - Amount and currency
     - Merchant wallet information
     - Payment ID

3. **Confirm Payment**
   - Click "Confirm Payment"
   - Redirected to Interledger authorization URL (`POST /api/pay/{paymentId}?customer={wallet}`)
   - Authorize payment on Interledger platform
   - Redirected back with `interact_ref` parameter

4. **Payment Finalization** (`/customer/payment/:paymentId/confirm`)
   - Automatically finalizes payment (`POST /api/pay/{paymentId}/finalize?interact_ref={ref}`)
   - Shows success or failure status
   - Payment saved to history

5. **Transaction History** (`/customer/transactions`)
   - View last 5 transactions
   - Shows merchant, amount, status, and timestamp
   - Cleared on logout

## Technical Features

> NOTE: This is a demonstration project not suitable for production use

- **State Management**: Signals for reactive state
- **Storage Services**:
  - `CashierProfileService`: Manages cashier authentication
  - `WalletStorageService`: Manages customer wallet info
  - `CustomerPaymentService`: Manages payment history (max 5 entries)
- **API Integration**: RESTful APIs with content negotiation (JSON, PNG, text)
- **Real-time Updates**: Polling for payment status changes
- **Security**: URL validation, wallet verification, error handling
- **Proxy Configuration**: Angular dev server proxies `/api` requests to `localhost:8080`