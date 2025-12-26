package com.qtihelper.demo.repository;

import com.qtihelper.demo.entity.VocabTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for VocabTag entity.
 * Provides CRUD operations for semantic vocabulary tags.
 */
@Repository
public interface VocabTagRepository extends JpaRepository<VocabTag, Long> {

    Optional<VocabTag> findByName(String name);

    List<VocabTag> findByCategory(String category);

    boolean existsByName(String name);
}
