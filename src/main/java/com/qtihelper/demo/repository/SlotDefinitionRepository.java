package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.SlotDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for SlotDefinition persistence operations.
 */
@Repository
public interface SlotDefinitionRepository extends JpaRepository<SlotDefinition, Long> {

    /**
     * Find slot by name.
     */
    Optional<SlotDefinition> findByName(String name);

    /**
     * Check if slot exists by name.
     */
    boolean existsByName(String name);
}
