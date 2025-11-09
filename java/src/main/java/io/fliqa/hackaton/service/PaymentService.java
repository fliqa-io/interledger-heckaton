package io.fliqa.hackaton.service;

import io.fliqa.client.interledger.InterledgerApiClient;
import io.fliqa.client.interledger.model.WalletAddress;
import io.fliqa.hackaton.infrastructure.persistence.CashierRepository;
import io.fliqa.hackaton.infrastructure.persistence.PaymentRepository;
import io.fliqa.hackaton.infrastructure.web.dto.CreatePaymentRequest;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@ApplicationScoped
public class PaymentService {

    private final PaymentRepository repository;
    private final CashierRepository cashierRepository;
    private final InterledgerApiClient client;
    private final String returnUrl;
    private final WalletService walletService;

    @Inject
    public PaymentService(
            PaymentRepository repository,
            CashierRepository cashierRepository,
            InterledgerApiClient client,
            WalletService walletService,
            @ConfigProperty(name = "io.fliqa.interledger.redirect_url") String returnUrl) {

        this.repository = repository;
        this.cashierRepository = cashierRepository;
        this.client = client;
        this.walletService = walletService;
        this.returnUrl = returnUrl;
    }

    @Transactional
    public Payment create(@NotNull CreatePaymentRequest request) {
        var payment = new Payment();
        payment.setCashier(request.getEmail());
        payment.setId(UUID.randomUUID());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setCreated(Instant.now());

        repository.persist(payment);

        return payment;
    }

    public Payment getById(@NotNull UUID id) {
        var result = repository.findByIdOptional(id).orElseThrow(NotFoundException::new);
        var cashier = cashierRepository
                .findByIdOptional(result.getCashier())
                .orElseThrow(NotFoundException::new);

        var walletData = walletService.getWallet(cashier.getPaymentPointer());

        result.setWalletData(walletData);

        return result;
    }

    public URI pay(
            UUID paymentId,
            @NotNull @NotEmpty String customer) {

        var payment = getById(paymentId);
        var cashier = cashierRepository
                .findByIdOptional(payment.getCashier())
                .orElseThrow(BadRequestException::new);

        try {
            var receiverWallet = client.getWallet(new WalletAddress(cashier.getPaymentPointer()));
            var accessGrant = client.createPendingGrant(receiverWallet);
            var incomingPayment = client.createIncomingPayment(receiverWallet, accessGrant, payment.getAmount());

            var senderWallet = client.getWallet(new WalletAddress(customer));
            var quoteRequest = client.createQuoteRequest(senderWallet);
            var quote = client.createQuote(quoteRequest.access.token, senderWallet, incomingPayment);

            var continueInteract = client.continueGrant(
                    senderWallet, quote, createReturnUrl(payment), "nonce");
            return continueInteract.interact.redirect;
        } catch (Exception e) {
            log.error("Failed to create payment", e);
            throw new InternalServerErrorException("Failed to create payment", e);
        }
    }

    private URI createReturnUrl(Payment payment) {
        return URI.create(returnUrl.replace("{id}", payment.getId().toString()));
    }
}
