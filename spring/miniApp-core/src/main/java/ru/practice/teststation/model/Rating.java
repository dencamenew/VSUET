package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "raiting", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_name", "zach_number", "sbj"})
})
@Getter
@Setter
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "zach_number")
    private String zachNumber;

    @Column(name = "sbj")
    private String subject;

    @Column(name = "raiting")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> ratings;
}