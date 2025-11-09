package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.WalletData;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.allOf;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class WalletResourceTest {

    @Test
    void gets_wallet_data() {
        var result = given()
                .when()
                .get("/wallet?address=https://ilp.interledger-test.dev/fliqa-receiver")
                .then()
                .statusCode(200)
                .extract()
                .as(WalletData.class);

        assertThat(result, notNullValue());
    }
}
