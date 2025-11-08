package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.CreatePaymentRequest;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import io.fliqa.hackaton.service.PaymentService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@ApplicationScoped
@Path("/payment")
@Slf4j
public class PaymentResource {

    private final PaymentService paymentService;

    @Inject
    public PaymentResource(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @POST
    @Path("/")
    public Payment createPayment(@NotNull CreatePaymentRequest request) {
        return paymentService.create(request);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    public Payment getPaymentAsText(@NotNull @PathParam("id") UUID id) {
        return paymentService.getById(id);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Payment getPaymentAsJson(@NotNull @PathParam("id") UUID id) {
        return paymentService.getById(id);
    }

    @GET
    @Path("/{id}")
    @Produces("image/png")
    public Payment getPaymentAsImage(@NotNull @PathParam("id") UUID id) {
        return paymentService.getById(id);
    }
}
