package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vsuetapp.model.GroupTimetable;

import java.util.Optional;

public interface GroupTimetableRepository extends JpaRepository<GroupTimetable, Long> {
    GroupTimetable findByGroupId(Long groupId);

    @Query("SELECT gt FROM GroupTimetable gt JOIN gt.group g WHERE g.groupName = :groupName")
    Optional<GroupTimetable> findByGroupName(@Param("groupName") String groupName);
}

