package io.fliqa.hackaton.infrastructure.web;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;

import java.util.UUID;

@ApplicationScoped
@Path("/pay")
public class PayByLinkResource {

    @GET
    @Path("/{id}")
    @Produces("text/plain")
    public String getPayByLinkAsText(@PathParam("id") UUID id) {
        return "Pay by link for " + id;
    }
}
