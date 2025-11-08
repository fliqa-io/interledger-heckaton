package io.fliqa.hackaton.infrastructure.persistence;

import io.fliqa.hackaton.infrastructure.web.dto.UserProfile;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CashierRepository implements PanacheRepositoryBase<UserProfile, String> {
}
