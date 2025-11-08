package io.fliqa.hackaton.infrastructure.web.providers;

import io.fliqa.hackaton.domain.model.QrCode;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import jakarta.inject.Inject;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.ext.MessageBodyWriter;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.Optional;

@Provider
@Produces({"image/png"})
public class PaymentPngBodyWriter implements MessageBodyWriter<Payment> {

    PaymentLinkTemplateService service;

    @Inject
    public PaymentPngBodyWriter(PaymentLinkTemplateService service) {
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

        var superimposedImage =
                PaymentPngBodyWriter.class.getResourceAsStream("/superimposed.png");

        if (superimposedImage == null) {
            throw new InternalServerErrorException("Failed to load superimposed image");
        }

        var code = new QrCode(service.constructPaymentLink(payment), superimposedImage);

        outputStream.write(code.getImageData());
    }
}
