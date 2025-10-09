package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.StudentInfo;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentInfoRepository extends JpaRepository<StudentInfo, Long> {
    Optional<StudentInfo> findByStudentName(String studentName);
    Optional<StudentInfo> findByZachNumber(String zachNumber);
    List<StudentInfo> findAllByGroup_Id(Long groupId);
}
