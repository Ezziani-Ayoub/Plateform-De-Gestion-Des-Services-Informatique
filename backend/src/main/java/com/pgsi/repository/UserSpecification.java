package com.pgsi.repository;

import com.pgsi.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> withFilters(String search, Long departmentId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate usernameLike = cb.like(cb.lower(root.get("username")), pattern);
                Predicate emailLike    = cb.like(cb.lower(root.get("email")),    pattern);
                Predicate fullNameLike = cb.like(cb.lower(root.get("fullName")), pattern);
                predicates.add(cb.or(usernameLike, emailLike, fullNameLike));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
