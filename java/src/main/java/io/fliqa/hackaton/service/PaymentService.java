package io.fliqa.hackaton.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fliqa.client.interledger.InterledgerApiClient;
import io.fliqa.client.interledger.model.OutgoingPayment;
import io.fliqa.client.interledger.model.PaymentPointer;
import io.fliqa.client.interledger.model.Quote;
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
    private final ObjectMapper objectMapper;

    @Inject
    public PaymentService(
            PaymentRepository repository,
            CashierRepository cashierRepository,
            InterledgerApiClient client,
            WalletService walletService,
            ObjectMapper objectMapper,
            @ConfigProperty(name = "io.fliqa.interledger.redirect_url") String returnUrl) {

        this.repository = repository;
        this.cashierRepository = cashierRepository;
        this.client = client;
        this.walletService = walletService;
        this.returnUrl = returnUrl;
        this.objectMapper = objectMapper;
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
        log.info("Getting payment for {}", id);

        var result = repository.findByIdOptional(id).orElseThrow(NotFoundException::new);

        log.info("Payment found for {}, cashier {}", id, result.getCashier());

        var cashier = cashierRepository
                .findByIdOptional(result.getCashier())
                .orElseThrow(NotFoundException::new);

        var walletData = walletService.getWallet(cashier.getPaymentPointer());

        result.setWalletData(walletData);

        return result;
    }

    @Transactional
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

            payment.setOutgoingPayment(objectMapper.writeValueAsString(continueInteract));
            payment.setSenderWallet(objectMapper.writeValueAsString(senderWallet));
            payment.setQuote(objectMapper.writeValueAsString(quote));

            return continueInteract.interact.redirect;
        } catch (Exception e) {
            log.error("Failed to create payment", e);
            throw new InternalServerErrorException("Failed to create payment", e);
        }
    }

    @Transactional
    public Payment finalizePayment(
            @NotNull UUID id, @NotNull @NotEmpty String interactRef) {
        try {
            var payment = getById(id);
            var outgoingPayment = objectMapper.readValue(
                    payment.getOutgoingPayment(), OutgoingPayment.class);
            var senderWallet = objectMapper.readValue(
                    payment.getSenderWallet(), PaymentPointer.class);
            var quote = objectMapper.readValue(
                    payment.getQuote(), Quote.class);

            var finalized = client.finalizeGrant(outgoingPayment, interactRef);
            var finalizedPayment = client.finalizePayment(finalized, senderWallet, quote);

            payment.setFinalizedPayment(objectMapper.writeValueAsString(finalizedPayment));

            return payment;
        } catch (Exception e) {
            log.error("Failed to finalize payment", e);
            throw new InternalServerErrorException("Failed to finalize payment", e);
        }
    }

    private URI createReturnUrl(Payment payment) {
        return URI.create(returnUrl.replace("{id}", payment.getId().toString()));
    }
}
