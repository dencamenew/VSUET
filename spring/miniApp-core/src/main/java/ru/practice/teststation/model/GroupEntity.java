package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;




@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "groups")
@Getter
@Setter
public class GroupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zach_number", nullable = false)
    private String zachNumber;

    @Column(name = "group_name", nullable = false)
    private String groupName;
}