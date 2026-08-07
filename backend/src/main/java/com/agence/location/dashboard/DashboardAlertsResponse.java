package com.agence.location.dashboard;

import java.util.List;

public record DashboardAlertsResponse(
    List<DashboardVehicleAlertItem> vehiculesEnMaintenance,
    List<DashboardVehicleAlertItem> vehiculesVidangeAlerte,
    List<DashboardReservationAlertItem> reservationsProchesEcheance,
    List<DashboardReservationAlertItem> reservationsTermineesFacturees
) {
}
