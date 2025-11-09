package io.fliqa.hackaton.infrastructure.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_profile")
public class UserProfile {
    @Id
    String email;

    String name;

    String description;

    @JsonIgnore
    @Column(name = "payment_pointer")
    String paymentPointer;

    @Nullable
    @Column(name="otp")
    @JsonIgnore
    String otp;

    @Transient
    WalletData walletData;
}
