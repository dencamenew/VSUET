package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.Groups;

import java.util.Optional;
import java.util.List;

@Repository
public interface GroupsRepository extends JpaRepository<Groups, Long> {
    Optional<Groups> findByGroupName(String groupName);
    List<Groups> findAllByFaculty_Id(Long facultyId);

    @Query("SELECT g.timetable FROM Groups g WHERE g.groupName = :groupName")
    Optional<GroupTimetable> findTimetableByGroupName(@Param("groupName") String groupName);

    @Query("SELECT g.timetable FROM Groups g WHERE g.id = :groupId")
    Optional<GroupTimetable> findTimetableByGroupId(@Param("groupId") Long groupId);

}

