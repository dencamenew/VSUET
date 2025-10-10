package ru.vsuetapp.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "teacher_timetable")
public class TeacherTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String timetableJson;

    @Transient
    private TimetableDto timetableJsonDto;

    public TimetableDto getTimetableJsonDto() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(this.timetableJson, TimetableDto.class);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при чтении JSON расписания преподавателя", e);
        }
    }
}