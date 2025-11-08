package io.fliqa.hackaton.infrastructure.web.providers;

import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import jakarta.inject.Inject;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.ext.MessageBodyWriter;
import jakarta.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

@Provider
@Produces({MediaType.TEXT_PLAIN})
public class PaymentTextBodyWriter implements MessageBodyWriter<Payment> {

    private final PaymentLinkTemplateService service;

    @Inject
    public PaymentTextBodyWriter(PaymentLinkTemplateService service) {
        this.service = service;
    }

    @Override
    public boolean isWriteable(
            Class<?> aClass,
            Type type,
            Annotation[] annotations,
            MediaType mediaType) {

        return Payment.class.isAssignableFrom(aClass) &&
               mediaType.isCompatible(MediaType.TEXT_PLAIN_TYPE);
    }

    @Override
    public void writeTo(
            Payment payment,
            Class<?> aClass,
            Type type,
            Annotation[] annotations,
            MediaType mediaType,
            MultivaluedMap<String, Object> multivaluedMap,
            OutputStream outputStream) throws IOException, WebApplicationException {

        try (var writer = new BufferedWriter(new OutputStreamWriter(outputStream))) {
            writer.write(service.constructPaymentLink(payment));
        }
    }
}
