import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/client';

const baseColumns = [
  { field: 'immatriculation', headerName: 'Immatriculation', flex: 1 },
  { field: 'marque', headerName: 'Marque', flex: 1 },
  { field: 'modele', headerName: 'Modele', flex: 1 },
  { field: 'categorie', headerName: 'Categorie', flex: 1 }
];

export default function AvailabilityPage() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [clientId, setClientId] = useState('');
  const [tarifJournalier, setTarifJournalier] = useState('');
  const [cautionTnd, setCautionTnd] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setError('');
    try {
      const [res, clientsRes] = await Promise.all([
        api.get('/vehicules/disponibilite', { params: { dateDebut, dateFin } }),
        api.get('/clients')
      ]);
      setRows(res.data.map((item) => ({ ...item, id: item.id })));
      setClients(clientsRes.data);
    } catch {
      setError('Recherche indisponible');
    }
  };

  const openReserve = (row) => {
    setSelectedVehicule(row);
    setClientId('');
    setTarifJournalier('');
    setCautionTnd('');
    setSubmitError('');
    setDialogOpen(true);
  };

  const reserve = async () => {
    if (!selectedVehicule || !clientId || !dateDebut || !dateFin || !tarifJournalier) {
      setSubmitError('Dates et client obligatoires');
      return;
    }
    setLoading(true);
    setSubmitError('');
    try {
      await api.post('/reservations', {
        vehiculeId: Number(selectedVehicule.id),
        clientId: Number(clientId),
        dateDebut,
        dateFin,
        tarifJournalier: Number(tarifJournalier),
        cautionTnd: cautionTnd === '' ? null : Number(cautionTnd)
      });
      setDialogOpen(false);
      await search();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Creation reservation echouee');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    ...baseColumns,
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          aria-label="reserver"
          onClick={() => openReserve(params.row)}
          sx={{ minWidth: 36 }}
        >
          <AddRoundedIcon fontSize="small" />
        </Button>
      )
    }
  ];

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2, md: 3.2 },
          borderRadius: 3,
          background: 'linear-gradient(195deg, #49a3f1 0%, #1A73E8 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5">Disponibilite</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Selectionne une plage de dates pour afficher les vehicules libres.
        </Typography>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2, mb: 2 }}>
          <TextField type="date" label="Date debut" InputLabelProps={{ shrink: true }} value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          <TextField type="date" label="Date fin" InputLabelProps={{ shrink: true }} value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          <Button variant="contained" aria-label="chercher" onClick={search} sx={{ minHeight: 55, minWidth: 55 }}>
            <SearchRoundedIcon />
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.8, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" color="text.secondary">Periode</Typography>
                  <Typography variant="subtitle1">
                    {dateDebut || '----/--/--'} au {dateFin || '----/--/--'}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'info.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
                  <CalendarMonthRoundedIcon fontSize="small" />
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 1.8, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" color="text.secondary">Resultats</Typography>
                  <Typography variant="subtitle1">{rows.length} vehicules trouves</Typography>
                </Box>
                <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
                  <TravelExploreRoundedIcon fontSize="small" />
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box
          sx={{
            '& .MuiDataGrid-root': { border: 0 },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid rgba(123,128,154,0.2)'
            },
            '& .MuiDataGrid-cell': { borderColor: 'rgba(123,128,154,0.14)' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(123,128,154,0.2)' }
          }}
        >
          <DataGrid autoHeight rows={rows} columns={columns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }} />
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Creer reservation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Vehicule"
              value={selectedVehicule ? `${selectedVehicule.immatriculation} - ${selectedVehicule.marque} ${selectedVehicule.modele}` : ''}
              disabled
            />
            <TextField select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>{client.nom} ({client.email})</MenuItem>
              ))}
            </TextField>
            <TextField type="date" label="Date debut" InputLabelProps={{ shrink: true }} value={dateDebut} disabled />
            <TextField type="date" label="Date fin" InputLabelProps={{ shrink: true }} value={dateFin} disabled />
            <TextField type="number" label="Tarif journalier (TND)" value={tarifJournalier} onChange={(e) => setTarifJournalier(e.target.value)} />
            <TextField type="number" label="Caution (TND)" value={cautionTnd} onChange={(e) => setCautionTnd(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={() => setDialogOpen(false)} disabled={loading} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
          <Button variant="contained" aria-label="confirmer reservation" onClick={reserve} disabled={loading} sx={{ minWidth: 44 }}>
            <CheckRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}