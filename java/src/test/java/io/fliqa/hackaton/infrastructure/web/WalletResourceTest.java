package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.WalletData;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;

@QuarkusTest
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
