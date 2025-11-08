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

import java.io.IOException;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

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

        boolean isImage = mediaType.getType().equals("image");
        boolean isPng = mediaType.getSubtype().equals("png");

        return Payment.class.isAssignableFrom(aClass) && isImage && isPng;
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
                PaymentPngBodyWriter.class.getResourceAsStream("/logotype.png");

        if (superimposedImage == null) {
            throw new InternalServerErrorException("Failed to load superimposed image");
        }

        var code = new QrCode(service.constructPaymentLink(payment), superimposedImage);

        outputStream.write(code.getImageData());
    }
}
