package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.service.PaymentService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;

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
    public String makePayment(@PathParam("id") UUID id)
    {
        service.pay(id);

        return "Pay by link for " + id;
    }
}
