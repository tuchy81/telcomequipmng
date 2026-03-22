package com.telcom.equip.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_ASSET")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long assetId;

    @Column(name = "asset_no", length = 30, unique = true, nullable = false)
    private String assetNo;

    @Column(name = "asset_name", length = 100, nullable = false)
    private String assetName;

    @Column(name = "category", length = 20)
    private String category;

    @Column(name = "location_building", length = 50)
    private String locationBuilding;

    @Column(name = "location_floor", length = 10)
    private String locationFloor;

    @Column(name = "location_room", length = 50)
    private String locationRoom;

    @Column(name = "rack_position", length = 30)
    private String rackPosition;

    @Column(name = "ip_address", length = 40)
    private String ipAddress;

    @Column(name = "serial_no", length = 60)
    private String serialNo;

    @Column(name = "status", length = 10)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getAssetNo() { return assetNo; }
    public void setAssetNo(String assetNo) { this.assetNo = assetNo; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocationBuilding() { return locationBuilding; }
    public void setLocationBuilding(String locationBuilding) { this.locationBuilding = locationBuilding; }

    public String getLocationFloor() { return locationFloor; }
    public void setLocationFloor(String locationFloor) { this.locationFloor = locationFloor; }

    public String getLocationRoom() { return locationRoom; }
    public void setLocationRoom(String locationRoom) { this.locationRoom = locationRoom; }

    public String getRackPosition() { return rackPosition; }
    public void setRackPosition(String rackPosition) { this.rackPosition = rackPosition; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
