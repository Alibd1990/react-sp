import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import api from '../api/client';
import { getApiErrorMessage } from '../api/errors';

const parkingSites = {
  'Site A - Centre': [
    { id: 'A-01', status: 'free' },
    { id: 'A-02', status: 'occupied' },
    { id: 'A-03', status: 'reserved' },
    { id: 'A-04', status: 'free' },
    { id: 'A-05', status: 'occupied' },
    { id: 'A-06', status: 'free' }
  ],
  'Site B - Aeroport': [
    { id: 'B-01', status: 'occupied' },
    { id: 'B-02', status: 'occupied' },
    { id: 'B-03', status: 'free' },
    { id: 'B-04', status: 'reserved' },
    { id: 'B-05', status: 'free' },
    { id: 'B-06', status: 'occupied' }
  ],
  'Site C - Gare': [
    { id: 'C-01', status: 'free' },
    { id: 'C-02', status: 'reserved' },
    { id: 'C-03', status: 'occupied' },
    { id: 'C-04', status: 'free' },
    { id: 'C-05', status: 'free' },
    { id: 'C-06', status: 'occupied' }
  ]
};

const statusColor = {
  free: '#4caf50',
  occupied: '#f44335',
  reserved: '#fb8c00'
};

const vehicleCategoryData = [
  { name: 'Citadine', value: 18, color: '#1a73e8' },
  { name: 'SUV', value: 12, color: '#344767' },
  { name: 'Utilitaire', value: 7, color: '#fb8c00' },
  { name: 'Premium', value: 5, color: '#2e7d32' }
];

const revenueData = [
  { day: 'J1', value: 850 },
  { day: 'J2', value: 920 },
  { day: 'J3', value: 980 },
  { day: 'J4', value: 1050 },
  { day: 'J5', value: 1090 },
  { day: 'J6', value: 1230 },
  { day: 'J7', value: 1180 },
  { day: 'J8', value: 1310 }
];

const occupancyWeekData = [
  { day: 'Lun', value: 72 },
  { day: 'Mar', value: 78 },
  { day: 'Mer', value: 74 },
  { day: 'Jeu', value: 81 },
  { day: 'Ven', value: 86 },
  { day: 'Sam', value: 91 },
  { day: 'Dim', value: 84 }
];

function MiniBars({ data, color }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 240, pt: 2 }}>
      {data.map((item) => (
        <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              height: `${Math.max((item.value / max) * 100, 8)}%`,
              minHeight: 18,
              borderRadius: 2,
              bgcolor: color,
              opacity: 0.95
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function MiniLine({ data, color }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Box sx={{ height: 240, width: '100%', pt: 1 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((item, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 100;
          const y = 100 - (item.value / max) * 100;
          return <circle key={item.label} cx={x} cy={y} r="1.8" fill={color} />;
        })}
      </svg>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: -1 }}>
        {data.map((item) => (
          <Typography key={item.label} variant="caption" color="text.secondary">{item.label}</Typography>
        ))}
      </Stack>
    </Box>
  );
}

function MiniDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Stack spacing={2} alignItems="center" sx={{ pt: 1 }}>
      <Box sx={{ position: 'relative', width: 180, height: 180 }}>
        <svg viewBox="0 0 120 120" width="180" height="180">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e9edf5" strokeWidth="14" />
          <g transform="rotate(-90 60 60)">
            {data.map((entry) => {
              const dash = (entry.value / total) * circumference;
              const segment = (
                <circle
                  key={entry.name}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
              offset += dash;
              return segment;
            })}
          </g>
          <circle cx="60" cy="60" r="28" fill="#fff" />
          <text x="60" y="58" textAnchor="middle" fontSize="11" fill="#6b7280">Flotte</text>
          <text x="60" y="72" textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">42</text>
        </svg>
      </Box>
      <Stack spacing={1} sx={{ width: '100%' }}>
        {data.map((entry) => (
          <Stack key={entry.name} direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="body2">{entry.name}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">{entry.value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function KpiCard({ icon, title, value, detail, color }) {
  return (
    <Card sx={{ p: 2.2, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{detail}</Typography>
        </Box>
        <Box sx={{ bgcolor: color, color: '#fff', borderRadius: 2.5, p: 1.2, display: 'grid', placeItems: 'center' }}>
          {icon}
        </Box>
      </Stack>
    </Card>
  );
}

export default function DashboardPage() {
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardAlerts, setDashboardAlerts] = useState({
    vehiculesEnMaintenance: [],
    vehiculesVidangeAlerte: [],
    reservationsProchesEcheance: [],
    reservationsTermineesFacturees: []
  });
  const allSpots = useMemo(() => Object.values(parkingSites).flat(), []);
  const freeSpots = allSpots.filter((spot) => spot.status === 'free').length;
  const occupiedSpots = allSpots.filter((spot) => spot.status === 'occupied').length;
  const reservedSpots = allSpots.filter((spot) => spot.status === 'reserved').length;
  const occupancyRate = Math.round(((occupiedSpots + reservedSpots) / allSpots.length) * 100);
  const activeReservations = dashboardAlerts.reservationsProchesEcheance.length;

  useEffect(() => {
    const refreshDashboard = async () => {
      setDashboardError('');
      try {
        const res = await api.get('/dashboard/alertes');
        setDashboardAlerts(res.data || {
          vehiculesEnMaintenance: [],
          vehiculesVidangeAlerte: [],
          reservationsProchesEcheance: [],
          reservationsTermineesFacturees: []
        });
      } catch (err) {
        setDashboardError(getApiErrorMessage(err, 'Impossible de charger les alertes dashboard'));
        setDashboardAlerts({
          vehiculesEnMaintenance: [],
          vehiculesVidangeAlerte: [],
          reservationsProchesEcheance: [],
          reservationsTermineesFacturees: []
        });
      }
    };

    refreshDashboard();
  }, []);

  return (
    <Stack spacing={3}>
      {dashboardError && <Alert severity="error">{dashboardError}</Alert>}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1A237E 0%, #0D47A1 45%, #111827 100%)',
          color: '#fff'
        }}
      >
        <Stack spacing={1}>
          <Chip label="Dashboard administration" sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }} />
          <Typography variant="h4">Pilotage flotte, parkings et reservations</Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, opacity: 0.9 }}>
            Vue centralisee des KPIs, de l occupation parking, des alertes et des reservations actives.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6} lg={3}><KpiCard icon={<DirectionsCarFilledRoundedIcon />} title="Vehicules" value="42" detail="28 disponibles · 9 en location · 5 maintenance" color="#1a73e8" /></Grid>
        <Grid item xs={12} md={6} lg={3}><KpiCard icon={<LocalParkingRoundedIcon />} title="Occupation parking" value={`${occupancyRate}%`} detail={`${freeSpots} libres · ${occupiedSpots} occupees · ${reservedSpots} reservees`} color="#344767" /></Grid>
        <Grid item xs={12} md={6} lg={3}><KpiCard icon={<PaymentsRoundedIcon />} title="Revenus" value="2 140 TND" detail="Aujourd'hui · 47 600 TND ce mois" color="#2e7d32" /></Grid>
        <Grid item xs={12} md={6} lg={3}><KpiCard icon={<EventAvailableRoundedIcon />} title="Reservations actives" value={activeReservations} detail="En cours + a venir" color="#fb8c00" /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Carte interactive des parkings</Typography>
                <Typography variant="body2" color="text.secondary">Places libres, occupees et reservees par zone.</Typography>
              </Box>
              <Grid container spacing={2}>
                {Object.entries(parkingSites).map(([site, spots]) => {
                  const siteOccupiedRate = Math.round(((spots.filter((spot) => spot.status !== 'free').length) / spots.length) * 100);
                  return (
                    <Grid item xs={12} md={site === 'Site A - Centre' ? 6 : 6} key={site}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="subtitle1">{site}</Typography>
                            <Typography variant="body2" color="text.secondary">Occupation {siteOccupiedRate}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={siteOccupiedRate} sx={{ height: 8, borderRadius: 99 }} />
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                            {spots.map((spot) => (
                              <Box
                                key={spot.id}
                                sx={{
                                  borderRadius: 2,
                                  p: 1,
                                  color: '#fff',
                                  textAlign: 'center',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  bgcolor: statusColor[spot.status]
                                }}
                              >
                                {spot.id}
                              </Box>
                            ))}
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Alertes / notifications</Typography>
                <Typography variant="body2" color="text.secondary">Surveillance des risques et priorites operationnelles.</Typography>
              </Box>
              <Stack spacing={1.3}>
                <Alert severity="info">Maintenance: {dashboardAlerts.vehiculesEnMaintenance.length} vehicule(s)</Alert>
                <Alert severity="warning">Vidange >= 4 500 km: {dashboardAlerts.vehiculesVidangeAlerte.length} vehicule(s)</Alert>
                <Alert severity="info">Echeances proches: {dashboardAlerts.reservationsProchesEcheance.length} reservation(s)</Alert>
                <Alert severity="success">Factures auto generees: {dashboardAlerts.reservationsTermineesFacturees.length} reservation(s)</Alert>
              </Stack>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Actions rapides</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Chip icon={<BuildRoundedIcon />} label="Maintenance" color="info" />
                  <Chip icon={<VerifiedRoundedIcon />} label="Valider reservation" color="success" />
                  <Chip icon={<WarningAmberRoundedIcon />} label="Verrouiller parking" color="warning" />
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="h6">Revenus sur 30 jours</Typography>
                <Typography variant="body2" color="text.secondary">Evolution journaliere des encaissements.</Typography>
              </Box>
              <Box sx={{ height: 280 }}>
                <MiniLine
                  data={revenueData.map((item) => ({ label: item.day, value: item.value }))}
                  color="#1a73e8"
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={2.5}>
          <Card sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Categories</Typography>
                <Typography variant="body2" color="text.secondary">Repartition de la flotte.</Typography>
              </Box>
              <MiniDonut data={vehicleCategoryData} />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={2.5}>
          <Card sx={{ p: 2.5, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="h6">Occupation semaine</Typography>
                <Typography variant="body2" color="text.secondary">Taux de charge par jour.</Typography>
              </Box>
              <MiniBars
                data={occupancyWeekData.map((item) => ({ label: item.day, value: item.value }))}
                color="#344767"
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6">Reservations proches d'echeance</Typography>
            <Typography variant="body2" color="text.secondary">Reservations a suivre sur les prochains jours.</Typography>
          </Box>
          <Grid container spacing={2}>
            {dashboardAlerts.reservationsProchesEcheance.map((reservation) => (
              <Grid item xs={12} md={4} key={reservation.reservationId}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">{reservation.client}</Typography>
                    <Typography variant="body2" color="text.secondary">{reservation.vehicule}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ScheduleRoundedIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">fin: {reservation.dateFin}</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {dashboardAlerts.reservationsProchesEcheance.length === 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">Aucune reservation proche d'echeance.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
}