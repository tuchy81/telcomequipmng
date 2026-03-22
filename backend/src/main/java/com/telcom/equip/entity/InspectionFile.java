package com.telcom.equip.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_INSPECTION_FILE")
public class InspectionFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(name = "file_path", length = 300)
    private String filePath;

    @Column(name = "file_name", length = 100)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "exif_lat")
    private Double exifLat;

    @Column(name = "exif_lng")
    private Double exifLng;

    @Column(name = "exif_taken_at")
    private LocalDateTime exifTakenAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Double getExifLat() { return exifLat; }
    public void setExifLat(Double exifLat) { this.exifLat = exifLat; }

    public Double getExifLng() { return exifLng; }
    public void setExifLng(Double exifLng) { this.exifLng = exifLng; }

    public LocalDateTime getExifTakenAt() { return exifTakenAt; }
    public void setExifTakenAt(LocalDateTime exifTakenAt) { this.exifTakenAt = exifTakenAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
