package io.fliqa.hackaton.infrastructure.web;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;

@ApplicationScoped
@Path("/wallet")
public class WalletResource {

    @GET
    public String getWallet(@QueryParam("address") @NotNull @NotEmpty String address) {
        return "Wallet";
    }
}
