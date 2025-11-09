package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.CreatePaymentRequest;
import io.fliqa.hackaton.infrastructure.web.dto.Payment;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class PaymentResourceTest {

    @Test
    void creates_new_payment() {
        var request = new CreatePaymentRequest(BigDecimal.ONE, "EUR", "testko@test.com");

        var result = given()
                .when()
                .contentType(ContentType.JSON)
                .body(request)
                .post("/payment/")
                .then()
                .statusCode(200)
                .extract()
                .as(Payment.class);

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

    @Test
    void returns_payment_as_image() {
        var response = given()
                .when()
                .accept("image/png")
                .get("/payment/{id}", "22138913-7bab-4255-8ea2-739355174c3b")
                .then()
                .statusCode(200)
                .extract()
                .response();

        var result = response.asByteArray();

        assertThat(result, notNullValue());
//        writeImage(result);
        
        var expected = readImage(PaymentResourceTest.class.getResourceAsStream("/result.png"));

        assertThat(result, is(expected));
    }

    private void writeImage(byte[] imageData) {
        try {
            var userHome = System.getProperty("user.home");
            var filePath = Path.of(userHome, "payment-test.png");
            Files.write(filePath, imageData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to write image file", e);
        }
    }

    private byte[] readImage(InputStream inputStream) {
        try {
            return inputStream.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to read image file", e);
        }
    }
}
