package io.fliqa.hackaton.infrastructure.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @Column(name = "outgoing_payment", length = 2048)
    String outgoingPayment;

    @JsonIgnore
    @Column(name = "sender_wallet", length = 2048)
    String senderWallet;

    @JsonIgnore
    @Column(name = "quote", length = 2048)
    String quote;

    @JsonIgnore
    @Column(name = "finalized_payment", length = 2048)
    String finalizedPayment;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public PaymentStatus getStatus() {
        if (finalizedPayment != null) {
            return PaymentStatus.Success;
        }

        if (outgoingPayment != null) {
            return PaymentStatus.Processing;
        }

        return PaymentStatus.Pending;
    }
}
