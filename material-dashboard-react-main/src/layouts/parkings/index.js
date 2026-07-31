/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useMemo, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

const vehiclesBySite = {
  "Site A - Centre": ["Peugeot 208", "Renault Clio", "Toyota Yaris"],
  "Site B - Aeroport": ["Hyundai Tucson", "Dacia Duster", "Ford Transit"],
  "Site C - Gare": ["Kia Sportage", "Citroen C3", "Skoda Octavia"],
};

const initialSpots = [
  { id: "A-01", site: "Site A - Centre", status: "libre", assignedVehicle: "" },
  { id: "A-02", site: "Site A - Centre", status: "occupee", assignedVehicle: "Renault Clio" },
  { id: "A-03", site: "Site A - Centre", status: "reservee", assignedVehicle: "Toyota Yaris" },
  { id: "A-04", site: "Site A - Centre", status: "maintenance", assignedVehicle: "" },
  { id: "B-01", site: "Site B - Aeroport", status: "occupee", assignedVehicle: "Hyundai Tucson" },
  { id: "B-02", site: "Site B - Aeroport", status: "bloquee", assignedVehicle: "" },
  { id: "B-03", site: "Site B - Aeroport", status: "libre", assignedVehicle: "" },
  { id: "B-04", site: "Site B - Aeroport", status: "reservee", assignedVehicle: "Ford Transit" },
  { id: "C-01", site: "Site C - Gare", status: "libre", assignedVehicle: "" },
  { id: "C-02", site: "Site C - Gare", status: "occupee", assignedVehicle: "Kia Sportage" },
  { id: "C-03", site: "Site C - Gare", status: "maintenance", assignedVehicle: "" },
  { id: "C-04", site: "Site C - Gare", status: "reservee", assignedVehicle: "Citroen C3" },
];

const statusOptions = ["libre", "reservee", "occupee", "maintenance", "bloquee"];

const statusBadgeColor = {
  libre: "success",
  reservee: "warning",
  occupee: "error",
  maintenance: "info",
  bloquee: "dark",
};

function Parkings() {
  const [spots, setSpots] = useState(initialSpots);
  const [siteFilter, setSiteFilter] = useState("Tous les sites");
  const [statusFilter, setStatusFilter] = useState("tous");

  const sites = useMemo(() => Object.keys(vehiclesBySite), []);

  const filteredSpots = useMemo(
    () =>
      spots.filter((spot) => {
        const matchesSite = siteFilter === "Tous les sites" || spot.site === siteFilter;
        const matchesStatus = statusFilter === "tous" || spot.status === statusFilter;
        return matchesSite && matchesStatus;
      }),
    [spots, siteFilter, statusFilter]
  );

  const stats = useMemo(() => {
    const total = spots.length;
    const libres = spots.filter((spot) => spot.status === "libre").length;
    const occupees = spots.filter((spot) => spot.status === "occupee").length;
    const maintenance = spots.filter((spot) => spot.status === "maintenance").length;
    const bloquees = spots.filter((spot) => spot.status === "bloquee").length;
    return { total, libres, occupees, maintenance, bloquees };
  }, [spots]);

  const updateSpotStatus = (spotId, nextStatus) => {
    setSpots((prev) =>
      prev.map((spot) =>
        spot.id === spotId
          ? {
              ...spot,
              status: nextStatus,
              assignedVehicle:
                nextStatus === "libre" || nextStatus === "maintenance" || nextStatus === "bloquee"
                  ? ""
                  : spot.assignedVehicle,
            }
          : spot
      )
    );
  };

  const updateSpotVehicle = (spotId, vehicle) => {
    setSpots((prev) => prev.map((spot) => (spot.id === spotId ? { ...spot, assignedVehicle: vehicle } : spot)));
  };

  const clearAssignment = (spotId) => {
    setSpots((prev) => prev.map((spot) => (spot.id === spotId ? { ...spot, assignedVehicle: "" } : spot)));
  };

  const blockSpot = (spotId) => {
    updateSpotStatus(spotId, "bloquee");
  };

  const sendToMaintenance = (spotId) => {
    updateSpotStatus(spotId, "maintenance");
  };

  const tableData = useMemo(() => {
    const columns = [
      { Header: "site", accessor: "site", align: "left" },
      { Header: "place", accessor: "place", align: "left" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "vehicule assigne", accessor: "vehicule", align: "center" },
      { Header: "actions", accessor: "actions", align: "center" },
    ];

    const rows = filteredSpots.map((spot) => {
      const availableVehicles = vehiclesBySite[spot.site] || [];
      const canAssign = spot.status === "reservee" || spot.status === "occupee";

      return {
        site: (
          <MDTypography variant="caption" fontWeight="medium" color="text">
            {spot.site}
          </MDTypography>
        ),
        place: (
          <MDTypography variant="caption" fontWeight="medium" color="text">
            {spot.id}
          </MDTypography>
        ),
        statut: (
          <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
            <MDBadge
              badgeContent={spot.status}
              color={statusBadgeColor[spot.status] || "secondary"}
              variant="gradient"
              size="sm"
            />
            <TextField
              select
              size="small"
              value={spot.status}
              onChange={(event) => updateSpotStatus(spot.id, event.target.value)}
              sx={{ minWidth: 140 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </MDBox>
        ),
        vehicule: (
          <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
            <TextField
              select
              size="small"
              value={spot.assignedVehicle}
              disabled={!canAssign}
              onChange={(event) => updateSpotVehicle(spot.id, event.target.value)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">Aucun</MenuItem>
              {availableVehicles.map((vehicle) => (
                <MenuItem key={vehicle} value={vehicle}>
                  {vehicle}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title="Supprimer assignation">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={!spot.assignedVehicle}
                  onClick={() => clearAssignment(spot.id)}
                >
                  <Icon fontSize="small">backspace</Icon>
                </IconButton>
              </span>
            </Tooltip>
          </MDBox>
        ),
        actions: (
          <MDBox display="flex" justifyContent="center" alignItems="center" gap={0.5}>
            <Tooltip title="Bloquer la place">
              <IconButton size="small" color="warning" onClick={() => blockSpot(spot.id)}>
                <Icon fontSize="small">block</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Mettre en maintenance">
              <IconButton size="small" color="info" onClick={() => sendToMaintenance(spot.id)}>
                <Icon fontSize="small">build</Icon>
              </IconButton>
            </Tooltip>
          </MDBox>
        ),
      };
    });

    return { columns, rows };
  }, [filteredSpots]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="local_parking"
              title="Places libres"
              count={stats.libres}
              percentage={{ color: "success", amount: `${stats.total}`, label: "places au total" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="error"
              icon="directions_car"
              title="Places occupees"
              count={stats.occupees}
              percentage={{ color: "error", amount: `${stats.total}`, label: "places au total" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="info"
              icon="build"
              title="En maintenance"
              count={stats.maintenance}
              percentage={{ color: "info", amount: `${stats.bloquees}`, label: "bloquees" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="lock"
              title="Bloquees"
              count={stats.bloquees}
              percentage={{ color: "dark", amount: `${stats.libres}`, label: "encore libres" }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Card>
            <MDBox p={3}>
              <MDBox
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                gap={2}
              >
                <MDBox>
                  <MDTypography variant="h6">Gestion des places de parking</MDTypography>
                  <MDTypography variant="button" color="text">
                    Edition des statuts, assignation vehicule, blocage et maintenance.
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" gap={1.5} flexWrap="wrap">
                  <TextField
                    select
                    size="small"
                    label="Site"
                    value={siteFilter}
                    onChange={(event) => setSiteFilter(event.target.value)}
                    sx={{ minWidth: 190 }}
                  >
                    <MenuItem value="Tous les sites">Tous les sites</MenuItem>
                    {sites.map((site) => (
                      <MenuItem key={site} value={site}>
                        {site}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Statut"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="tous">Tous</MenuItem>
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </MDBox>
              </MDBox>
            </MDBox>
            <DataTable
              table={tableData}
              isSorted={false}
              entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20] }}
              showTotalEntries
              canSearch
              noEndBorder
            />
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Parkings;
