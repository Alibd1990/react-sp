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
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Images
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

const parkingSites = {
  "Site A - Centre": [
    { id: "A-01", status: "free" },
    { id: "A-02", status: "occupied" },
    { id: "A-03", status: "reserved" },
    { id: "A-04", status: "occupied" },
    { id: "A-05", status: "free" },
    { id: "A-06", status: "occupied" },
    { id: "A-07", status: "free" },
    { id: "A-08", status: "reserved" },
  ],
  "Site B - Aeroport": [
    { id: "B-01", status: "occupied" },
    { id: "B-02", status: "occupied" },
    { id: "B-03", status: "free" },
    { id: "B-04", status: "free" },
    { id: "B-05", status: "reserved" },
    { id: "B-06", status: "occupied" },
    { id: "B-07", status: "occupied" },
    { id: "B-08", status: "free" },
  ],
  "Site C - Gare": [
    { id: "C-01", status: "free" },
    { id: "C-02", status: "reserved" },
    { id: "C-03", status: "occupied" },
    { id: "C-04", status: "occupied" },
    { id: "C-05", status: "free" },
    { id: "C-06", status: "free" },
    { id: "C-07", status: "reserved" },
    { id: "C-08", status: "occupied" },
  ],
};

const vehicles = [
  {
    brand: "Peugeot",
    model: "208",
    plate: "TU-1984",
    status: "disponible",
    category: "citadine",
    parking: "A-05",
    nextReturn: "Disponible maintenant",
    photo: team1,
  },
  {
    brand: "Renault",
    model: "Clio",
    plate: "TU-4421",
    status: "en location",
    category: "citadine",
    parking: "B-07",
    nextReturn: "Aujourd'hui 18:30",
    photo: team2,
  },
  {
    brand: "Dacia",
    model: "Duster",
    plate: "TU-7720",
    status: "maintenance",
    category: "SUV",
    parking: "C-03",
    nextReturn: "31/07 10:00",
    photo: team3,
  },
  {
    brand: "Ford",
    model: "Transit",
    plate: "TU-9912",
    status: "en location",
    category: "utilitaire",
    parking: "A-02",
    nextReturn: "30/07 09:45",
    photo: team4,
  },
  {
    brand: "Hyundai",
    model: "Tucson",
    plate: "TU-3007",
    status: "disponible",
    category: "SUV",
    parking: "B-03",
    nextReturn: "Disponible maintenant",
    photo: team1,
  },
  {
    brand: "Toyota",
    model: "Yaris",
    plate: "TU-5562",
    status: "en location",
    category: "citadine",
    parking: "C-08",
    nextReturn: "01/08 14:00",
    photo: team2,
  },
];

const brandModels = {
  Peugeot: ["208", "3008", "Partner"],
  Renault: ["Clio", "Megane", "Kangoo"],
  Dacia: ["Duster", "Logan"],
  Ford: ["Transit", "Focus"],
  Hyundai: ["Tucson", "i20"],
  Toyota: ["Yaris", "Corolla", "Hilux"],
};

const reservations = [
  {
    client: "Sami Ben Ali",
    vehicle: "Renault Clio",
    start: "29/07 10:00",
    end: "31/07 17:00",
    status: "en cours",
  },
  {
    client: "Nour Haddad",
    vehicle: "Hyundai Tucson",
    start: "30/07 09:00",
    end: "02/08 12:00",
    status: "a venir",
  },
  {
    client: "Mourad Trabelsi",
    vehicle: "Ford Transit",
    start: "26/07 08:30",
    end: "29/07 16:00",
    status: "terminee",
  },
  {
    client: "Ines Gharbi",
    vehicle: "Peugeot 208",
    start: "28/07 15:00",
    end: "29/07 13:00",
    status: "annulee",
  },
];

const alerts = [
  { severity: "warning", message: "3 vehicules a entretenir sous 48h." },
  { severity: "info", message: "5 contrats arrivent a echeance cette semaine." },
  { severity: "error", message: "Site B - Aeroport a un taux d'occupation > 90%." },
];

const statusBadgeColor = {
  disponible: "success",
  "en location": "info",
  maintenance: "warning",
  "en cours": "info",
  "a venir": "warning",
  terminee: "success",
  annulee: "error",
};

const categoryBadgeColor = {
  citadine: "info",
  SUV: "primary",
  utilitaire: "warning",
  premium: "dark",
};

const spotColor = {
  free: "#4caf50",
  occupied: "#f44335",
  reserved: "#ff9800",
};

function Dashboard() {
  const [siteFilter, setSiteFilter] = useState("Tous les sites");
  const [categoryFilter, setCategoryFilter] = useState("toutes");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("tous");
  const [brandFilter, setBrandFilter] = useState("toutes");
  const [modelFilter, setModelFilter] = useState("tous");

  const allSpots = useMemo(() => Object.values(parkingSites).flat(), []);
  const occupiedSpots = allSpots.filter((spot) => spot.status !== "free").length;
  const occupancyRate = Math.round((occupiedSpots / allSpots.length) * 100);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "disponible").length;
  const rentedVehicles = vehicles.filter((vehicle) => vehicle.status === "en location").length;
  const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === "maintenance").length;
  const activeReservations = reservations.filter((item) => item.status === "en cours").length;

  const visibleSites = useMemo(() => {
    if (siteFilter === "Tous les sites") {
      return Object.entries(parkingSites);
    }
    return [[siteFilter, parkingSites[siteFilter]]];
  }, [siteFilter]);

  const availableModels = useMemo(() => {
    if (brandFilter === "toutes") {
      return [];
    }
    return brandModels[brandFilter] || [];
  }, [brandFilter]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.category))),
    []
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.status))),
    []
  );

  const brandOptions = useMemo(() => Object.keys(brandModels), []);

  const handleBrandFilterChange = (event) => {
    setBrandFilter(event.target.value);
    setModelFilter("tous");
  };

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesCategory = categoryFilter === "toutes" || vehicle.category === categoryFilter;
        const matchesStatus =
          vehicleStatusFilter === "tous" || vehicle.status === vehicleStatusFilter;
        const matchesBrand = brandFilter === "toutes" || vehicle.brand === brandFilter;
        const matchesModel = modelFilter === "tous" || vehicle.model === modelFilter;
        return matchesCategory && matchesStatus && matchesBrand && matchesModel;
      }),
    [categoryFilter, vehicleStatusFilter, brandFilter, modelFilter]
  );

  const vehicleTableData = useMemo(() => {
    const columns = [
      { Header: "vehicule", accessor: "vehicule", width: "35%", align: "left" },
      { Header: "marque", accessor: "marque", align: "left" },
      { Header: "modele", accessor: "modele", align: "left" },
      { Header: "categorie", accessor: "categorie", align: "center" },
      { Header: "immatriculation", accessor: "immatriculation", align: "left" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "parking", accessor: "parking", align: "center" },
      { Header: "prochain retour", accessor: "retour", align: "center" },
    ];

    const rows = filteredVehicles.map((vehicle) => ({
      vehicule: (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
          <MDAvatar src={vehicle.photo} name={`${vehicle.brand} ${vehicle.model}`} size="sm" />
          <MDBox ml={2}>
            <MDTypography variant="button" fontWeight="medium">
              {vehicle.brand} {vehicle.model}
            </MDTypography>
            <MDTypography variant="caption" color="text" fontWeight="regular">
              {vehicle.plate}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
      marque: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {vehicle.brand}
        </MDTypography>
      ),
      modele: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {vehicle.model}
        </MDTypography>
      ),
      categorie: (
        <MDBadge
          badgeContent={vehicle.category}
          color={categoryBadgeColor[vehicle.category] || "secondary"}
          variant="gradient"
          size="sm"
        />
      ),
      immatriculation: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {vehicle.plate}
        </MDTypography>
      ),
      statut: (
        <MDBadge
          badgeContent={vehicle.status}
          color={statusBadgeColor[vehicle.status] || "dark"}
          variant="gradient"
          size="sm"
        />
      ),
      parking: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {vehicle.parking}
        </MDTypography>
      ),
      retour: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {vehicle.nextReturn}
        </MDTypography>
      ),
    }));

    return { columns, rows };
  }, [filteredVehicles]);

  const reservationTableData = useMemo(() => {
    const columns = [
      { Header: "client", accessor: "client", align: "left" },
      { Header: "vehicule", accessor: "vehicule", align: "left" },
      { Header: "periode", accessor: "periode", align: "center" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "actions", accessor: "actions", align: "center" },
    ];

    const rows = reservations.map((item) => ({
      client: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.client}
        </MDTypography>
      ),
      vehicule: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.vehicle}
        </MDTypography>
      ),
      periode: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.start} - {item.end}
        </MDTypography>
      ),
      statut: (
        <MDBadge
          badgeContent={item.status}
          color={statusBadgeColor[item.status] || "dark"}
          variant="gradient"
          size="sm"
        />
      ),
      actions: (
        <MDBox display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Tooltip title="Valider">
            <IconButton size="small" color="success">
              <Icon fontSize="small">check_circle</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Annuler">
            <IconButton size="small" color="error">
              <Icon fontSize="small">cancel</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton size="small" color="primary">
              <Icon fontSize="small">edit</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      ),
    }));

    return { columns, rows };
  }, []);

  const revenueLineChart = {
    labels: Array.from({ length: 30 }, (_, index) => `J${index + 1}`),
    datasets: {
      label: "Revenus (TND)",
      data: [
        820, 940, 880, 990, 1020, 1150, 1080, 1220, 1190, 1280, 1320, 1400, 1370, 1450, 1490,
        1530, 1470, 1560, 1620, 1700, 1680, 1740, 1790, 1850, 1910, 1880, 1960, 2010, 2070, 2140,
      ],
    },
  };

  const categoryDonutChart = {
    labels: ["Citadine", "SUV", "Utilitaire", "Premium"],
    datasets: {
      label: "Flotte",
      data: [22, 14, 8, 5],
      backgroundColors: ["success", "info", "warning", "dark"],
    },
  };

  const occupancyBarChart = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        label: "Occupation %",
        color: "info",
        data: [72, 78, 75, 81, 86, 90, 84],
      },
    ],
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="directions_car"
              title="Vehicules"
              count={totalVehicles}
              percentage={{
                color: "success",
                amount: `${availableVehicles} dispo`,
                label: ` | ${rentedVehicles} en location | ${maintenanceVehicles} maintenance`,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="info"
              icon="local_parking"
              title="Occupation parking"
              count={`${occupancyRate}%`}
              percentage={{
                color: occupancyRate > 85 ? "error" : "success",
                amount: `${occupiedSpots}/${allSpots.length}`,
                label: "places occupees + reservees",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="payments"
              title="Revenus"
              count="2 140 TND"
              percentage={{
                color: "success",
                amount: "+8.4%",
                label: "aujourd'hui | 47 600 TND ce mois",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="primary"
              icon="event_available"
              title="Reservations actives"
              count={activeReservations}
              percentage={{
                color: "info",
                amount: `${reservations.length}`,
                label: "reservations recentes/a venir",
              }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDBox>
                      <MDTypography variant="h6">Carte interactive des parkings</MDTypography>
                      <MDTypography variant="button" color="text">
                        Vert = libre, rouge = occupee, orange = reservee
                      </MDTypography>
                    </MDBox>
                    <TextField
                      select
                      size="small"
                      label="Site"
                      value={siteFilter}
                      onChange={(event) => setSiteFilter(event.target.value)}
                      sx={{ minWidth: 190 }}
                    >
                      <MenuItem value="Tous les sites">Tous les sites</MenuItem>
                      {Object.keys(parkingSites).map((siteName) => (
                        <MenuItem key={siteName} value={siteName}>
                          {siteName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </MDBox>

                  <Grid container spacing={2}>
                    {visibleSites.map(([siteName, spots]) => {
                      const siteOccupation =
                        Math.round((spots.filter((spot) => spot.status !== "free").length / spots.length) * 100);

                      return (
                        <Grid item xs={12} md={siteFilter === "Tous les sites" ? 6 : 12} key={siteName}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="button" fontWeight="medium">
                                {siteName}
                              </MDTypography>
                              <MDBox mt={1} mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={siteOccupation}
                                  color={siteOccupation > 85 ? "error" : "info"}
                                />
                              </MDBox>
                              <MDTypography variant="caption" color="text">
                                Taux d'occupation: {siteOccupation}%
                              </MDTypography>
                              <MDBox
                                mt={1.5}
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                  gap: 1,
                                }}
                              >
                                {spots.map((spot) => (
                                  <MDBox
                                    key={spot.id}
                                    px={1}
                                    py={0.75}
                                    borderRadius="md"
                                    bgColor="white"
                                    border="1px solid #e0e0e0"
                                    sx={{
                                      textAlign: "center",
                                      fontSize: "0.75rem",
                                      color: "#344767",
                                      background: spotColor[spot.status],
                                      colorScheme: "light",
                                      color: "#fff",
                                    }}
                                  >
                                    {spot.id}
                                  </MDBox>
                                ))}
                              </MDBox>
                            </MDBox>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Alertes & notifications</MDTypography>
                  <MDTypography variant="button" color="text">
                    Maintenance, echeances et saturation parking.
                  </MDTypography>
                  <Divider sx={{ my: 2 }} />
                  <MDBox display="grid" gap={1.5}>
                    {alerts.map((alert) => (
                      <Alert key={alert.message} severity={alert.severity}>
                        {alert.message}
                      </Alert>
                    ))}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                      <MDTypography variant="h6">Liste des vehicules</MDTypography>
                      <MDTypography variant="button" color="text">
                        Filtres lies marque/modele, categorie coloree, localisation parking et prochain retour.
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" gap={1.5} flexWrap="wrap">
                      <TextField
                        select
                        size="small"
                        label="Marque"
                        value={brandFilter}
                        onChange={handleBrandFilterChange}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="toutes">Toutes</MenuItem>
                        {brandOptions.map((brand) => (
                          <MenuItem key={brand} value={brand}>
                            {brand}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Modele"
                        value={modelFilter}
                        onChange={(event) => setModelFilter(event.target.value)}
                        sx={{ minWidth: 150 }}
                        disabled={brandFilter === "toutes"}
                      >
                        <MenuItem value="tous">Tous</MenuItem>
                        {availableModels.map((model) => (
                          <MenuItem key={model} value={model}>
                            {model}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Categorie"
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="toutes">Toutes</MenuItem>
                        {categoryOptions.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        label="Statut"
                        value={vehicleStatusFilter}
                        onChange={(event) => setVehicleStatusFilter(event.target.value)}
                        sx={{ minWidth: 150 }}
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
                  table={vehicleTableData}
                  isSorted={false}
                  entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15, 20] }}
                  showTotalEntries
                  canSearch
                  noEndBorder
                />
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Reservations recentes / a venir</MDTypography>
                  <MDTypography variant="button" color="text">
                    Actions rapides disponibles: valider, annuler, modifier.
                  </MDTypography>
                </MDBox>
                <DataTable
                  table={reservationTableData}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </Card>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ReportsLineChart
                    color="info"
                    title="Revenus sur 30 jours"
                    description="Suivi journalier des encaissements"
                    date="mis a jour aujourd'hui"
                    chart={revenueLineChart}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DefaultDoughnutChart
                icon={{ color: "info", component: "category" }}
                title="Repartition par categorie"
                description="Distribution actuelle de la flotte"
                height="18rem"
                chart={categoryDonutChart}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <VerticalBarChart
                icon={{ color: "dark", component: "bar_chart" }}
                title="Occupation parking par jour"
                description="Tendance hebdomadaire (%)"
                height="18rem"
                chart={occupancyBarChart}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
