package com.telcom.equip.repository;

import com.telcom.equip.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    List<Inspection> findBySurveySurveyIdOrderByInspectDtDesc(Long surveyId);

    boolean existsBySurveySurveyId(Long surveyId);

    @Query("SELECT i FROM Inspection i WHERE i.asset.assetId = :assetId ORDER BY i.inspectDt DESC")
    List<Inspection> findByAssetIdOrderByInspectDtDesc(@Param("assetId") Long assetId);

    default Optional<Inspection> findLatestByAssetId(Long assetId) {
        List<Inspection> list = findByAssetIdOrderByInspectDtDesc(assetId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT COUNT(i) FROM Inspection i WHERE i.inspectDt >= :startOfDay AND i.inspectDt < :endOfDay")
    long countByInspectDtBetween(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(i) FROM Inspection i WHERE i.result = :result")
    long countByResult(@Param("result") String result);
}
