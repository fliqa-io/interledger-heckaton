package io.fliqa.hackaton.infrastructure.web.dto;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "payment")
public class Payment implements Serializable {

    @NotNull
    @Id
    @Column(name = "id")
    UUID id;

    @NotNull
    @Column(name = "amount")
    BigDecimal amount;

    @NotNull
    @Column(name = "currency")
    String currency;

    @NotNull
    @NotEmpty
    @Email
    String cashier;

    Instant created;
}
