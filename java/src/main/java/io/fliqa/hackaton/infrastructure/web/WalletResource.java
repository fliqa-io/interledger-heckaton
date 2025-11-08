package io.fliqa.hackaton.infrastructure.web;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@ApplicationScoped
@Path("/wallet")
public class WalletResource {

    @GET
    public String getWallet(@NotNull @NotEmpty String walletId) {
        return "Wallet";
    }
}
