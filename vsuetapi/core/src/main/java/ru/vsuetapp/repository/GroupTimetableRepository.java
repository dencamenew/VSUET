package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vsuetapp.model.GroupTimetable;

import java.util.Optional;

public interface GroupTimetableRepository extends JpaRepository<GroupTimetable, Long> {
}

