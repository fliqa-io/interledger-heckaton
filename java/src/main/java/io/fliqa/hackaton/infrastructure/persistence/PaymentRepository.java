package io.fliqa.hackaton.infrastructure.persistence;

import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class PaymentRepository implements PanacheRepositoryBase<Payment, UUID> {
}
