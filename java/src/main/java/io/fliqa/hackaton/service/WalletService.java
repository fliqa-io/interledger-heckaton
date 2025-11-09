package io.fliqa.hackaton.service;

import io.fliqa.client.interledger.InterledgerApiClient;
import io.fliqa.client.interledger.model.WalletAddress;
import io.fliqa.hackaton.infrastructure.web.dto.WalletData;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.extern.slf4j.Slf4j;

import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;

@Slf4j
@ApplicationScoped
public class WalletService {

    private final InterledgerApiClient client;

    @Inject
    public WalletService(
            InterledgerApiClient client
    ) {
        this.client = client;
    }

    public WalletData getWallet(@NotNull @NotEmpty String address) {
        var walletAddress = new WalletAddress(address);

        try {
            log.info("Retrieving wallet data for address {}", address);

            var result = client.getWallet(walletAddress);
            return new WalletData(
                    result.address,
                    result.publicName,
                    result.assetCode,
                    result.assetScale,
                    result.authServer,
                    result.resourceServer);
        } catch (Exception e) {
            log.error("Failed to retrieve wallet data for address {}", address, e);

            throw new InternalServerErrorException(
                    "Failed to retrieve wallet data for address " + address,
                    e);
        }
    }
}
