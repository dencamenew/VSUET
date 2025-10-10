package ru.vsuetapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_timetable")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupTimetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "timetable", fetch = FetchType.LAZY)
    private Groups group;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String timetableJson;
}
