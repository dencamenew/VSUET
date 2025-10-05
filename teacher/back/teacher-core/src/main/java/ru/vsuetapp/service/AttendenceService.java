package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.vsuetapp.dto.AttendanceDto;
import ru.vsuetapp.repository.FullTimetableRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendenceService {
    
    private final FullTimetableRepository fullTimetableRepository;
    
    public List<AttendanceDto> getAttendenceVed(String teacher, String subject, String groupName) {
        return fullTimetableRepository.getAttendenceVed(teacher, subject, groupName);
    }

    @Transactional
    public boolean updateAttendance(Long id, Boolean turnout) {
        int updatedRows = fullTimetableRepository.updateAttendance(id, turnout);
        return updatedRows > 0;
    }
}