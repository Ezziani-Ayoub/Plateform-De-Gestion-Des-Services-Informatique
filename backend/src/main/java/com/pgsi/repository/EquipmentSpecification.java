package com.pgsi.repository;

import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class EquipmentSpecification {

    /**
     * Builds a dynamic Specification that applies only the non-null/non-blank filters.
     * Null parameters are simply skipped — they never reach the generated SQL,
     * which avoids the PostgreSQL "function lower(bytea) does not exist" error.
     */
    public static Specification<Equipment> withFilters(String search, String category, EquipmentStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate nameLike     = cb.like(cb.lower(root.get("name")),         pattern);
                Predicate serialLike   = cb.like(cb.lower(root.get("serialNumber")), pattern);
                Predicate locationLike = cb.like(cb.lower(root.get("location")),     pattern);
                predicates.add(cb.or(nameLike, serialLike, locationLike));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
