package com.telcom.equip.repository;

import com.telcom.equip.entity.InspectionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionFileRepository extends JpaRepository<InspectionFile, Long> {

    List<InspectionFile> findByInspectionInspectionId(Long inspectionId);

    @Query("SELECT f FROM InspectionFile f WHERE f.exifLat IS NOT NULL AND f.exifLng IS NOT NULL")
    List<InspectionFile> findAllWithGps();

    @Query("SELECT f FROM InspectionFile f WHERE f.exifLat IS NOT NULL AND f.exifLng IS NOT NULL AND f.inspection.survey.surveyId = :surveyId")
    List<InspectionFile> findAllWithGpsBySurveyId(@Param("surveyId") Long surveyId);

    @Query("SELECT f FROM InspectionFile f WHERE f.exifLat IS NOT NULL AND f.exifLng IS NOT NULL AND f.inspection.result = :result")
    List<InspectionFile> findAllWithGpsByResult(@Param("result") String result);

    @Query("SELECT f FROM InspectionFile f WHERE f.exifLat IS NOT NULL AND f.exifLng IS NOT NULL AND f.inspection.survey.surveyId = :surveyId AND f.inspection.result = :result")
    List<InspectionFile> findAllWithGpsBySurveyIdAndResult(@Param("surveyId") Long surveyId, @Param("result") String result);
}
