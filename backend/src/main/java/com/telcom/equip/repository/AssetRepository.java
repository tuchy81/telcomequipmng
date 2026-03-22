package com.telcom.equip.repository;

import com.telcom.equip.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    @Query("SELECT a FROM Asset a WHERE a.assetNo LIKE %:search% OR a.assetName LIKE %:search%")
    List<Asset> searchByAssetNoOrName(@Param("search") String search);
}
