package io.fliqa.hackaton.service;

import io.fliqa.hackaton.infrastructure.persistence.CashierRepository;
import io.fliqa.hackaton.infrastructure.web.dto.UserProfile;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.security.UnauthorizedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.ws.rs.NotFoundException;

import java.util.Random;
import java.util.stream.Collectors;

@ApplicationScoped
public class CashierService {

    private final CashierRepository repository;
    private final Mailer mailer;

    @Inject
    public CashierService(
            CashierRepository repository,
            Mailer mailer
    ) {
        this.repository = repository;
        this.mailer = mailer;
    }

    @Transactional
    public void loginCashier(@NotNull @NotEmpty @Email String email) {
        var user = getByEmail(email);
        user.setOtp(generateOtp());

        sendEmail(user);
    }

    @Transactional
    public UserProfile validateOtp(
            @NotNull @NotEmpty @Email String email,
            @Pattern(regexp = "[\\d]{4}") String otp) {
        var user = getByEmail(email);
        if (!otp.equals(user.getOtp())) {
            throw new UnauthorizedException("Invalid OTP");
        }

        return user;
    }

    private UserProfile getByEmail(String email) {
        return repository.findByIdOptional(email).orElseThrow(NotFoundException::new);
    }

    private void sendEmail(UserProfile user) {
        var contents = generateEmail(user);
        mailer.send(Mail.withHtml(user.getEmail(), "Cashier Login", contents));
    }

    private String generateEmail(UserProfile user) {
        return user.getOtp();
    }

    private String generateOtp() {
        var random = new Random();
        return random
                .ints(4, 0, 9)
                .mapToObj(Integer::toString)
                .collect(Collectors.joining(""));
    }
}
