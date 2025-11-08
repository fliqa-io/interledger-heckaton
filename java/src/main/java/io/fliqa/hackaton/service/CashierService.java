package io.fliqa.hackaton.service;

import io.fliqa.hackaton.infrastructure.persistence.CashierRepository;
import io.fliqa.hackaton.infrastructure.web.dto.UserProfile;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class CashierService {

    private final CashierRepository repository;

    @Inject
    public CashierService(
            CashierRepository repository
    ) {
        this.repository = repository;
    }

    public UserProfile getByEmail(@NotNull @NotEmpty @Email String email) {
        return repository.findByIdOptional(email).orElseThrow(NotFoundException::new);
    }
}
