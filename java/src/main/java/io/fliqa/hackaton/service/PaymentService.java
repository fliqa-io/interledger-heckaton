package io.fliqa.hackaton.service;

import io.fliqa.hackaton.infrastructure.persistence.PaymentRepository;
import io.fliqa.hackaton.infrastructure.web.dto.CreatePaymentRequest;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class PaymentService {

    private final PaymentRepository repository;

    public PaymentService(PaymentRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Payment create(@NotNull CreatePaymentRequest request) {
        var payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setCreated(Instant.now());

        repository.persist(payment);

        return payment;
    }

    public Payment getById(@NotNull UUID id) {
        return repository.findByIdOptional(id).orElseThrow(NotFoundException::new);
    }
}
