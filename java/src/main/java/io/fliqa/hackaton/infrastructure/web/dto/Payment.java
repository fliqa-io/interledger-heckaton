package io.fliqa.hackaton.infrastructure.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @JsonIgnore
    @NotNull
    @NotEmpty
    @Email
    String cashier;

    Instant created;

    @Transient
    WalletData walletData;

    @JsonIgnore
    @Column(name = "outgoing_payment")
    String outgoingPayment;

    @JsonIgnore
    @Column(name = "sender_wallet")
    String senderWallet;

    @JsonIgnore
    @Column(name = "quote")
    String quote;

    @JsonIgnore
    @Column(name = "finalized_payment")
    String finalizedPayment;
}
