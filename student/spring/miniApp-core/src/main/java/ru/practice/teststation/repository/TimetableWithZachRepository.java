package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.practice.teststation.model.TimetableWithZach;

import java.time.LocalTime;
import java.util.List;

public interface TimetableWithZachRepository extends JpaRepository<TimetableWithZach, Long> {

    @Query("SELECT t FROM TimetableWithZach t WHERE t.zachNumber = :zachNumber AND t.subject = :subject AND t.time = :time")
    List<TimetableWithZach> findByZachNumberAndSubjectAndTime(@Param("zachNumber") String zachNumber,
                                                              @Param("subject") String subject,
                                                              @Param("time") LocalTime time);

    @Query("SELECT t FROM TimetableWithZach t WHERE t.zachNumber = :zachNumber AND t.subject = :subject AND t.time = :time AND t.weekType IN ('всегда', :weekType)")
    List<TimetableWithZach> findByZachNumberAndSubjectAndTimeAndWeekType(@Param("zachNumber") String zachNumber,
                                                                         @Param("subject") String subject,
                                                                         @Param("time") LocalTime time,
                                                                         @Param("weekType") String weekType);

    List<TimetableWithZach> findByZachNumber(String zachNumber);

    @Query("SELECT t FROM TimetableWithZach t WHERE t.zachNumber = :zachNumber AND t.subject = :subject")
    List<TimetableWithZach> findByZachNumberAndSubject(@Param("zachNumber") String zachNumber,
                                                       @Param("subject") String subject);
}