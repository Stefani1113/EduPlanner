package com.EduPlanner.ed_ms_gestion_academica.repository;

import com.eduplanner.ed_lib_common.entity.TimeSlot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
    boolean existsByIdShiftAndSlotOrder(Integer idShift, Short slotOrder);
    List<TimeSlot> findByIdShift(Integer idShift);
}