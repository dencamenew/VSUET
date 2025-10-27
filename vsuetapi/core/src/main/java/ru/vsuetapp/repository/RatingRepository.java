package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vsuetapp.model.Rating;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByTeacherName(String teacherName);

    @Query("SELECT r FROM Rating r WHERE r.groupName = :groupName AND r.subjectName = :subjectName")
    List<Rating> findByGroupAndSubject(@Param("groupName") String groupName, @Param("subjectName") String subjectName);
}
