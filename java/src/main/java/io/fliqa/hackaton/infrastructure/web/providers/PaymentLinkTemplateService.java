package io.fliqa.hackaton.infrastructure.web.providers;

import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class PaymentLinkTemplateService {

    private final String paymentLinkTemplate;

    public PaymentLinkTemplateService(
            @ConfigProperty(name = "io.fliqa.payment_link_template")
            String paymentLinkTemplate
    ) {
        this.paymentLinkTemplate = paymentLinkTemplate;
    }

    String constructPaymentLink(Payment payment) {
        return paymentLinkTemplate.replace("{id}", payment.getId().toString());
    }
}
