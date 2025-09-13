package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.practice.teststation.dto.requests.QRCheckRequest;
import ru.practice.teststation.dto.response.QRCheckResponse;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.model.QRCode;
import ru.practice.teststation.model.enums.QrStatus;
import ru.practice.teststation.repository.FullTimetableRepository;
import ru.practice.teststation.repository.QRCodeRepository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentQrService {

    private final QRCodeRepository qrCodeRepository;
    private final FullTimetableRepository fullTimetableRepository;

    @Transactional
    public QRCheckResponse checkQRCode(QRCheckRequest qrCheckRequest, String zachNumber) {
        Optional<QRCode> qrCodeOpt = qrCodeRepository.findValidQRCode(
            qrCheckRequest.getQrUUID(), 
            qrCheckRequest.getToken()
        );

        if (qrCodeOpt.isEmpty()) {
            return new QRCheckResponse(false, "Неверный или неактивный QR-код");
        }

        QRCode qrCode = qrCodeOpt.get();

        log.info("Checking QR code for student {}: date={}, time={}, subject={}, teacher={}",
                zachNumber, qrCode.getDate(), qrCode.getTime(), qrCode.getSubject(), qrCode.getTeacher());

        // Проверяем, есть ли у студента пара в это время
        List<FullTimetable> studentLessons = fullTimetableRepository.findByZachNumberAndDateAndTime(
            zachNumber, 
            qrCode.getDate(), 
            qrCode.getTime()
        );

        if (studentLessons.isEmpty()) {
            log.warn("No lessons found for student {} on {} at {}", 
                    zachNumber, qrCode.getDate(), qrCode.getTime());
            return new QRCheckResponse(false, "У вас нет пары в это время");
        }

        // Проверяем совпадение предмета и преподавателя
        FullTimetable lesson = studentLessons.get(0);
        if (!lesson.getSubject().equals(qrCode.getSubject()) || 
            !lesson.getTeacher().equals(qrCode.getTeacher())) {
            log.warn("Lesson mismatch for student {}: expected {}/{}, got {}/{}",
                    zachNumber, qrCode.getSubject(), qrCode.getTeacher(),
                    lesson.getSubject(), lesson.getTeacher());
            return new QRCheckResponse(false, "Несоответствие данных пары");
        }

        // Обновляем явку студента
        updateStudentAttendance(lesson, zachNumber);
        
        // Помечаем QR код как отсканированный
        markQRCodeAsScanned(qrCheckRequest.getQrUUID(), zachNumber);

        log.info("QR code validated successfully for student {}", zachNumber);
        
        return new QRCheckResponse(
            true, 
            "QR-код подтвержден", 
            qrCode.getSubject(),
            qrCode.getDate().toString(),
            qrCode.getTime().toString(),
            qrCode.getTeacher(),
            lesson.getGroupName()
        );
    }

    private void updateStudentAttendance(FullTimetable lesson, String zachNumber) {
        // Проверяем, что это именно тот студент (на случай если несколько записей)
        if (lesson.getZachNumber().equals(zachNumber)) {
            lesson.setTurnout(true);
            fullTimetableRepository.save(lesson);
            log.info("Attendance marked for student {} in lesson ID {}", zachNumber, lesson.getId());
        } else {
            log.warn("Zach number mismatch: expected {}, got {}", zachNumber, lesson.getZachNumber());
        }
    }

    private void markQRCodeAsScanned(String qrUUID, String studentZachNumber) {
        Optional<QRCode> qrCodeOpt = qrCodeRepository.findByQrUUID(qrUUID);
        if (qrCodeOpt.isPresent()) {
            QRCode qrCode = qrCodeOpt.get();
            qrCode.setStatus(QrStatus.SCANNED);
            qrCode.setStudent(studentZachNumber);
            qrCodeRepository.save(qrCode);
            log.info("QR code {} marked as scanned by student {}", qrUUID, studentZachNumber);
        }
    }
}