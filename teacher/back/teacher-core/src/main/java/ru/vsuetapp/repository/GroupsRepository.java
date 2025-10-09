package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.Groups;

import java.util.Optional;
import java.util.List;

@Repository
public interface GroupsRepository extends JpaRepository<Groups, Long> {
    Optional<Groups> findByGroupName(String groupName);
    List<Groups> findAllByDeanInfo_Id(Long deanId);
}
