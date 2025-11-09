package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.service.PaymentService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;

import java.net.URI;
import java.util.UUID;

@ApplicationScoped
@Path("/pay")
public class PayByLinkResource {

    private final PaymentService service;

    @Inject
    public PayByLinkResource(PaymentService service) {
        this.service = service;
    }

    @POST
    @Path("/{id}")
    public URI makePayment(
            @PathParam("id") @NotNull UUID id,
            @QueryParam("customer") @NotNull @NotEmpty String customer) {

        return service.pay(id, customer);
    }
}
