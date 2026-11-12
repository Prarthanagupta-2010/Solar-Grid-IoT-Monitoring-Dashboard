package com.solargrid.platform.repository;

import com.solargrid.platform.entity.Device;
import com.solargrid.platform.entity.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    boolean existsBySerialNumberIgnoreCase(String serialNumber);
    long countByStatus(DeviceStatus status);
    List<Device> findAllByOrderByNameAsc();
}

