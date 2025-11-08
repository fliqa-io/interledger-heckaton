package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.UserProfile;
import io.fliqa.hackaton.service.CashierService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;

@ApplicationScoped
@Path("/cashier")
public class CashierResource {

    private final CashierService service;

    @Inject
    public CashierResource(CashierService service) {
        this.service = service;
    }

    @GET
    @Path("/login")
    public UserProfile login(
            @QueryParam("email") @NotNull @NotEmpty @Email String email,
            @QueryParam("otp") @Pattern(regexp = "[\\d]{4}") @NotNull String otp) {

        return service.getByEmail(email);
    }
}
