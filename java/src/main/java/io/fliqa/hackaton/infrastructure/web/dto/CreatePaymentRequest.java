package io.fliqa.hackaton.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePaymentRequest implements Serializable {
    BigDecimal amount;
    String currency;
    @NotNull
    @NotEmpty
    @Email
    String email;
}
