package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "zach")
@Getter
@Setter
public class Zach {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zach_number", unique = true, nullable = false)
    private String zachNumber;

    @Column(name = "group_name", nullable = false)
    private String groupName;
}