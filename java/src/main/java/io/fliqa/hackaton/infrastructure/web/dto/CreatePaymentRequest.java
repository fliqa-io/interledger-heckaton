package io.fliqa.hackaton.infrastructure.web.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreatePaymentRequest implements Serializable {
    BigDecimal amount;
    String currency;
}
