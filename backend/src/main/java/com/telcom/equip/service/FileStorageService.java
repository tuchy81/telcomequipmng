package com.telcom.equip.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.telcom.equip.entity.InspectionFile;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public InspectionFile storeFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String storedFileName = UUID.randomUUID().toString() + extension;

        Path targetPath = this.uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        InspectionFile inspFile = new InspectionFile();
        inspFile.setFilePath(storedFileName);
        inspFile.setFileName(originalFileName);
        inspFile.setFileSize(file.getSize());

        // Extract EXIF data
        try (InputStream is = file.getInputStream()) {
            Metadata metadata = ImageMetadataReader.readMetadata(is);

            GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDir != null && gpsDir.getGeoLocation() != null) {
                inspFile.setExifLat(gpsDir.getGeoLocation().getLatitude());
                inspFile.setExifLng(gpsDir.getGeoLocation().getLongitude());
            }

            ExifSubIFDDirectory exifDir = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifDir != null) {
                Date dateTaken = exifDir.getDateOriginal();
                if (dateTaken != null) {
                    inspFile.setExifTakenAt(
                        LocalDateTime.ofInstant(dateTaken.toInstant(), ZoneId.systemDefault())
                    );
                }
            }
        } catch (Exception e) {
            // EXIF extraction failed — not an image or no EXIF data, continue with nulls
        }

        return inspFile;
    }

    public void deleteFile(String filePath) {
        try {
            Path target = this.uploadPath.resolve(filePath);
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // Log but don't throw — file deletion is best-effort
        }
    }
}
