package com.pgsi.dto;

public class DashboardStatsDto {

    private long totalUsers;
    private long totalEquipments;
    private long assignedEquipments;
    private long availableEquipments;
    private long maintenanceEquipments;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalUsers, long totalEquipments, long assignedEquipments, long availableEquipments, long maintenanceEquipments) {
        this.totalUsers = totalUsers;
        this.totalEquipments = totalEquipments;
        this.assignedEquipments = assignedEquipments;
        this.availableEquipments = availableEquipments;
        this.maintenanceEquipments = maintenanceEquipments;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalEquipments() { return totalEquipments; }
    public void setTotalEquipments(long totalEquipments) { this.totalEquipments = totalEquipments; }

    public long getAssignedEquipments() { return assignedEquipments; }
    public void setAssignedEquipments(long assignedEquipments) { this.assignedEquipments = assignedEquipments; }

    public long getAvailableEquipments() { return availableEquipments; }
    public void setAvailableEquipments(long availableEquipments) { this.availableEquipments = availableEquipments; }

    public long getMaintenanceEquipments() { return maintenanceEquipments; }
    public void setMaintenanceEquipments(long maintenanceEquipments) { this.maintenanceEquipments = maintenanceEquipments; }
}
