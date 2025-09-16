package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.Rating;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByZachNumber(String zachNumber);
}