package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sbj_urls")
@Getter
@Setter
public class SbjUrls {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name", unique = true, nullable = false)
    private String groupName;

    @Column(name = "urls", nullable = false)
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> urls;
}