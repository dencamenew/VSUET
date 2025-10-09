package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vsuetapp.model.GroupTimetable;

import java.util.Optional;

public interface GroupTimetableRepository extends JpaRepository<GroupTimetable, Long> {
    GroupTimetable findByGroupId(Long groupId);

    Optional<GroupTimetable> findByGroupName(String groupName);
}

