package com.telcom.equip.repository;

import com.telcom.equip.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    long countByStatus(String status);
}
