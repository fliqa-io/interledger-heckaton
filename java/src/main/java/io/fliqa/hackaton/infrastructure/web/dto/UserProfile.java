package io.fliqa.hackaton.infrastructure.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "user_profile")
public class UserProfile {
    @Id
    String email;

    String name;

    String description;

    @Column(name = "payment_pointer")
    String paymentPointer;

    @Nullable
    @Column(name="otp")
    @JsonIgnore
    String otp;
}
