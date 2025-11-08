package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.CreatePaymentRequest;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class VendorResourceTest {

    @Test
    void creates_new_payment() {
        var request = new CreatePaymentRequest(BigDecimal.ONE, "EUR");

        var result = given()
                .when()
                .contentType(ContentType.JSON)
                .body(request)
                .post("/payment/")
                .then()
                .statusCode(200)
                .extract().as(Payment.class);

        assertThat(
                result,
                allOf(
                        notNullValue(),
                        hasProperty("id", notNullValue()),
                        hasProperty("amount", is(BigDecimal.ONE)),
                        hasProperty("currency", is("EUR")))
                );

        var createdLink = given()
                .when()
                .accept(ContentType.TEXT)
                .get("/payment/{id}", result.getId())
                .then()
                .statusCode(200)
                .extract()
                .asString();

        assertThat(createdLink, containsString(result.getId().toString()));

        var created = given()
                .when()
                .accept(ContentType.JSON)
                .get("/payment/{id}", result.getId())
                .then()
                .statusCode(200)
                .extract()
                .as(Payment.class);

        assertThat(
                created,
                allOf(
                        notNullValue(),
                        hasProperty("id", notNullValue()),
                        hasProperty("amount", is(new BigDecimal("1.00"))),
                        hasProperty("currency", is("EUR")))
        );
    }
}
