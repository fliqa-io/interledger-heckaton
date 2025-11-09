# Interledger Hackathon 2025 - Payment Application

A payment application demonstrating seamless merchant-to-customer transactions using the Interledger Protocol (ILP). This project provides separate interfaces for cashiers (merchants) and customers, enabling QR code-based payment flows with real-time status tracking.

## Links

- **Presentation**: // TODO
- **Repository**: https://github.com/fliqa-io/interledger-heckaton
- **Java SDK**: https://github.com/fliqa-io/interledger

## How it works

This application implements a complete payment flow using the Interledger Protocol. The cashier (merchant) interface allows merchants to create payment requests in EUR, which generates a unique QR code. When scanned by a customer, the QR code directs them to a payment page where they can view the payment details and authorize the transaction through their Interledger wallet.

The system features real-time payment status monitoring that polls every 3 seconds, tracking payments through four states: pending (waiting for customer), processing (customer authorizing), success (payment completed), and failed (payment unsuccessful). Both cashiers and customers can view their transaction history, with customers seeing their last 5 completed transactions and cashiers having access to all payment requests.

Authentication is handled differently for each user type: cashiers use email-based OTP verification with a 4-digit PIN sent via Mailpit, while customers authenticate using their Interledger wallet address. The backend integrates with the Interledger test network using the fliqa-initiator wallet as an intermediary, handling payment creation, authorization, and finalization through the Open Payments API.

## How to run

### Prerequisites

- Java JDK 21
- Node.js and npm
- PostgreSQL database
- Mailpit (for email testing)

### Backend Setup (Quarkus)

```bash
cd java

# Run in development mode
./gradlew quarkusDev

# The backend will start on http://localhost:8080
```

### Frontend Setup (Angular)

```bash
cd angular/wallet

# Install dependencies
npm install

# Run development server
npm start

# The frontend will start on http://localhost:4200
```

### Configuration

The application uses the following default configuration:

- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:4200`
- **Interledger Wallet**: `https://ilp.interledger-test.dev/fliqa-initiator`
- **Payment Flow**: QR codes link to `http://localhost:4200/customer/payment/{id}`

Backend configuration can be modified in `java/src/main/resources/application.properties`.

### Using the Application

**As a Cashier:**
1. Navigate to `http://localhost:4200/cashier/login`
2. Enter your email and receive a 4-digit OTP
3. Create a payment by entering the amount (based on his wallet asset)
4. Show the generated QR code to the customer
5. Monitor payment status in real-time

**As a Customer:**
1. Navigate to `http://localhost:4200/customer/login`
2. Enter your Interledger wallet address
3. Scan the merchant's QR code or enter the payment ID
4. Review payment details and confirm
5. Complete authorization on the Interledger platform
6. View transaction in your history

## Team members

- Andrej Završnik [https://github.com/drejc]
- Jurica Čavlek [https://github.com/gargameljura]

---

**Note**: This is a demonstration project created for the Interledger Hackathon 2025 and is not intended for production use.
