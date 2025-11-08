package io.fliqa.hackaton.infrastructure.web;

import io.fliqa.hackaton.infrastructure.web.dto.UserProfile;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.hasProperty;

@QuarkusTest
class CashierResourceTest {

    @Test
    void login() {
        var result = given()
                .when()
                .get("/cashier/login?email=test@test.com&otp=1234")
                .then()
                .statusCode(200)
                .extract().as(UserProfile.class);

        assertThat(
                result,
                allOf(
                        hasProperty("name", is("test")),
                        hasProperty("description", is("unit test profile")),
                        hasProperty("paymentPointer", is("pointing"))
                ));
    }
}
