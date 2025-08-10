package ru.practice.teststation.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.GroupEntity;

public interface GroupRepository extends JpaRepository<GroupEntity, Long> {
}
