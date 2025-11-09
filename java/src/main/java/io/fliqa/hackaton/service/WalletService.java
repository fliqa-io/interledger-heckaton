package io.fliqa.hackaton.service;

import io.fliqa.client.interledger.InterledgerApiClientImpl;
import io.fliqa.client.interledger.model.WalletAddress;
import io.fliqa.hackaton.infrastructure.web.dto.WalletData;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;

@Slf4j
@ApplicationScoped
public class WalletService {

    private final PrivateKey privateKey;
    private final String keyId;

    @Inject
    public WalletService(
            @ConfigProperty(name = "io.fliqa.interledger.private_key_file")
            String privateKeyFile,
            @ConfigProperty(name = "io.fliqa.interledger.key_id")
            String keyId
    ) {
        try {
            this.privateKey = privateKeyFromFile(privateKeyFile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse private key", e);
        }

        this.keyId = keyId;
    }

    public WalletData getWallet(@NotNull @NotEmpty String address) {
        var walletAddress = new WalletAddress(address);
        var client = new InterledgerApiClientImpl(walletAddress, privateKey, keyId);

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

    private PrivateKey privateKeyFromFile(String privateKeyFile) throws Exception {
        if (!Files.exists(java.nio.file.Path.of(privateKeyFile))) {
            log.error("Private key file does not exist: {}", privateKeyFile);
            throw new RuntimeException("Private key file does not exist: " + privateKeyFile);
        }

        var privateKeyContents = Files
                .lines(java.nio.file.Path.of(privateKeyFile))
                .collect(Collectors.joining());

        String privateKeyBase64 = privateKeyContents
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyBase64);
        KeyFactory keyFactory = KeyFactory.getInstance("Ed25519");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        return keyFactory.generatePrivate(keySpec);
    }
}
