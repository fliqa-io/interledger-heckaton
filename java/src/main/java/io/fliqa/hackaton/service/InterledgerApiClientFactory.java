package io.fliqa.hackaton.service;

import io.fliqa.client.interledger.InterledgerApiClient;
import io.fliqa.client.interledger.InterledgerApiClientImpl;
import io.fliqa.client.interledger.model.WalletAddress;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
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
public class InterledgerApiClientFactory {

    private final PrivateKey privateKey;
    private final String keyId;
    private final WalletAddress intermediateWallet;

    public InterledgerApiClientFactory(
            @ConfigProperty(name = "io.fliqa.interledger.private_key_file")
            String privateKeyFile,
            @ConfigProperty(name = "io.fliqa.interledger.key_id")
            String keyId,
            @ConfigProperty(name = "io.fliqa.interledger.intermediate_wallet")
            String intermediateWallet
    ) {
        try {
            this.privateKey = privateKeyFromFile(privateKeyFile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse private key", e);
        }

        this.keyId = keyId;
        this.intermediateWallet = new WalletAddress(intermediateWallet);
    }

    @Produces
    public InterledgerApiClient createClient() {
        return new InterledgerApiClientImpl(intermediateWallet, privateKey, keyId);
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
