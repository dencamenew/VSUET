package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.Rating;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    @Query(value = "SELECT * FROM raiting WHERE zach_number = ?1", nativeQuery = true)
    List<Rating> findByZachNumber(String zachNumber);
}