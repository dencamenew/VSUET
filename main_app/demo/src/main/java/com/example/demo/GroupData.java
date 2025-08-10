package com.example.h2demo.model;

import java.util.List;
import org.w3c.dom.Entity;

@Data
@Entity
public class GroupData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "group_name", nullable = false)
    private String groupName;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "group_data_id")
    private List<ZachRecord> zachRecords;
}