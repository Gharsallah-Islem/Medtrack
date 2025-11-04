package com.medtrack.backend.controller;

public class AppointmentDTO {
    private Integer patientId;
    private Integer doctorId;
    private Integer slotId;

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public Integer getSlotId() { return slotId; }
    public void setSlotId(Integer slotId) { this.slotId = slotId; }

    @Override
    public String toString() {
        return "AppointmentDTO{" +
                "patientId=" + patientId +
                ", doctorId=" + doctorId +
                ", slotId=" + slotId +
                '}';
    }
}