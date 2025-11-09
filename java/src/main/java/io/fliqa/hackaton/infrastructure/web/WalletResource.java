package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.WalletData;
import io.fliqa.hackaton.service.WalletService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@ApplicationScoped
@Path("/wallet")
public class WalletResource {

    private final WalletService service;

    @Inject
    public WalletResource(WalletService service) {
        this.service = service;
    }

    @GET
    public WalletData getWallet(@QueryParam("address") @NotNull @NotEmpty String address) {
        log.info("Getting wallet for {}", address);

        return service.getWallet(address);
    }
}
