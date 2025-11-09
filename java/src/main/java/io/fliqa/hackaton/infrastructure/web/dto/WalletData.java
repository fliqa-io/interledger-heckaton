package io.fliqa.hackaton.infrastructure.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.URI;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletData {
    URI address;
    String publicName;
    String assetCode;
    int assetScale;
    URI authServer;
    URI resourceServer;
}
