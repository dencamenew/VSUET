package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.QRCode;



public interface QRCodeRepository extends JpaRepository<QRCode, Long> {

}