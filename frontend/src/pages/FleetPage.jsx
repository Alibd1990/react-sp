import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/client';

const emptyForm = {
  immatriculation: '',
  marque: '',
  modele: '',
  annee: '',
  statut: 'DISPONIBLE',
  kilometrage: '',
  couleur: '',
  prochainEntretienKm: '',
  derniereVidangeKm: '',
  derniereVidangeDate: ''
};

const statusOptions = ['DISPONIBLE', 'RESERVE', 'EN_LOCATION', 'EN_MAINTENANCE', 'HORS_SERVICE', 'RETIRE_DU_PARC'];
const brandModels = {
  Peugeot: ['208', '3008', 'Partner'],
  Renault: ['Clio', 'Megane', 'Kangoo'],
  Dacia: ['Duster', 'Logan'],
  Ford: ['Transit', 'Focus'],
  Hyundai: ['Tucson', 'i20'],
  Toyota: ['Yaris', 'Corolla', 'Hilux']
};


export default function FleetPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyRows, setHistoryRows] = useState([]);
  const [historyVehiculeLabel, setHistoryVehiculeLabel] = useState('');
  const [brandFilter, setBrandFilter] = useState('toutes');
  const [modelFilter, setModelFilter] = useState('tous');
  
  const [statusFilter, setStatusFilter] = useState('tous');

  const loadRows = async () => {
    setError('');
    try {
      const res = await api.get('/vehicules');
      setRows(res.data.map((item) => ({ ...item, id: item.id })));
    } catch {
      setError('Impossible de charger le catalogue');
    }
  };

  const total = rows.length;
  const available = rows.filter((item) => String(item.statut || '').toLowerCase().includes('dispo')).length;
  const totalKm = rows.reduce((sum, item) => sum + Number(item.kilometrage || 0), 0);
  const availableModels = brandFilter === 'toutes' ? [] : (brandModels[brandFilter] || []);

  useEffect(() => {
    loadRows();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      immatriculation: row.immatriculation || '',
      marque: row.marque || '',
      modele: row.modele || '',
      annee: row.annee ?? '',
      statut: row.statut || 'DISPONIBLE',
      kilometrage: row.kilometrage ?? '',
      couleur: row.couleur || '',
      prochainEntretienKm: row.prochainEntretienKm ?? '',
      derniereVidangeKm: row.derniereVidangeKm ?? '',
      derniereVidangeDate: row.derniereVidangeDate || ''
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (loading) {
      return;
    }
    setDialogOpen(false);
  };

  const onChangeField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const openHistory = async (row) => {
    setHistoryVehiculeLabel(`${row.immatriculation} - ${row.marque} ${row.modele}`);
    setHistoryDialogOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const res = await api.get(`/vehicules/${row.id}/historique-reservations`);
      setHistoryRows((res.data || []).map((item) => ({ ...item, id: item.reservationId })));
    } catch {
      setHistoryError('Impossible de charger l\'historique des reservations');
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredRows = rows.filter((item) => {
    const rowBrand = String(item.marque || '');
    const rowModel = String(item.modele || '');
    const rowStatus = String(item.statut || '');

    const matchBrand = brandFilter === 'toutes' || rowBrand === brandFilter;
    const matchModel = modelFilter === 'tous' || rowModel === modelFilter;
    const matchStatus = statusFilter === 'tous' || rowStatus === statusFilter;

    return matchBrand && matchModel && matchStatus;
  });

  const saveVehicule = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      const payload = {
        immatriculation: String(form.immatriculation || '').trim(),
        marque: String(form.marque || '').trim(),
        modele: String(form.modele || '').trim(),
        annee: Number(form.annee),
        statut: form.statut,
        kilometrage: Number(form.kilometrage),
        couleur: String(form.couleur || '').trim(),
        prochainEntretienKm: form.prochainEntretienKm === '' ? null : Number(form.prochainEntretienKm),
        derniereVidangeKm: form.derniereVidangeKm === '' ? null : Number(form.derniereVidangeKm),
        derniereVidangeDate: form.derniereVidangeDate || null
      };

      if (editingId) {
        await api.put(`/vehicules/${editingId}`, payload);
      } else {
        await api.post('/vehicules', payload);
      }

      setDialogOpen(false);
      await loadRows();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Operation echouee');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicule = async (row) => {
    const ok = window.confirm(`Supprimer le vehicule ${row.immatriculation} ?`);
    if (!ok) {
      return;
    }
    setError('');
    try {
      await api.delete(`/vehicules/${row.id}`);
      await loadRows();
    } catch (err) {
      setError(err?.response?.data?.message || 'Suppression echouee');
    }
  };

  const columns = [
    { field: 'immatriculation', headerName: 'Immatriculation', flex: 1 },
    { field: 'marque', headerName: 'Marque', flex: 1 },
    { field: 'modele', headerName: 'Modele', flex: 1 },
    { field: 'annee', headerName: 'Annee', flex: 0.7 },
    
    { field: 'statut', headerName: 'Statut', flex: 1 },
    { field: 'kilometrage', headerName: 'Km', flex: 0.8 },
    {
      field: 'vidange',
      headerName: 'Vidange',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const currentKm = Number(params.row.kilometrage || 0);
        const lastKm = params.row.derniereVidangeKm == null ? null : Number(params.row.derniereVidangeKm);
        if (lastKm == null) {
          return <Chip size="small" label="Non renseignee" variant="outlined" />;
        }
        const delta = Math.max(0, currentKm - lastKm);
        const needsAlert = delta >= 4500;
        return (
          <Chip
            size="small"
            color={needsAlert ? 'warning' : 'success'}
            label={`${delta} km depuis vidange`}
            variant={needsAlert ? 'filled' : 'outlined'}
          />
        );
      }
    },
    {
      field: 'couleur',
      headerName: 'Couleur',
      flex: 1,
      renderCell: (params) => {
        const value = String(params.row.couleur || '').trim();
        return value ? (
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: 10,
              color: '#111827',
              fontSize: 12,
              fontWeight: 700,
              bgcolor: '#f3f4f6',
              border: '1px solid rgba(17,24,39,0.12)'
            }}
          >
            {value}
          </Box>
        ) : '-';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            aria-label="historique reservations"
            onClick={() => openHistory(params.row)}
            sx={{ minWidth: 36 }}
          >
            <HistoryRoundedIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            variant="outlined"
            aria-label="modifier vehicule"
            onClick={() => openEdit(params.row)}
            sx={{ minWidth: 36 }}
          >
            <EditRoundedIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            aria-label="supprimer vehicule"
            onClick={() => deleteVehicule(params.row)}
            sx={{ minWidth: 36 }}
          >
            <DeleteRoundedIcon fontSize="small" />
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2, md: 3.2 },
          borderRadius: 3,
          background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
          color: 'white'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5">Catalogue Vehicules</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Vue globale du parc, statuts et kilometrage.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            aria-label="ajouter vehicule"
            onClick={openCreate}
            sx={{ minWidth: 48, bgcolor: '#e91e63', '&:hover': { bgcolor: '#d81b60' } }}
          >
            <AddRoundedIcon />
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" color="text.secondary">Vehicules</Typography>
                <Typography variant="h5">{total}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
                <DirectionsCarFilledRoundedIcon fontSize="small" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" color="text.secondary">Disponibles</Typography>
                <Typography variant="h5">{available}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'success.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
                <VerifiedRoundedIcon fontSize="small" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" color="text.secondary">Tarif moyen</Typography>
                <Typography variant="h5">{totalKm} km</Typography>
              </Box>
              <Box sx={{ bgcolor: 'info.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
                <PaymentsRoundedIcon fontSize="small" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          select
          size="small"
          label="Marque"
          value={brandFilter}
          onChange={(event) => {
            setBrandFilter(event.target.value);
            setModelFilter('tous');
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="toutes">Toutes</MenuItem>
          {Object.keys(brandModels).map((brand) => (
            <MenuItem key={brand} value={brand}>{brand}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Modele"
          value={modelFilter}
          onChange={(event) => setModelFilter(event.target.value)}
          disabled={brandFilter === 'toutes'}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="tous">Tous</MenuItem>
          {availableModels.map((model) => (
            <MenuItem key={model} value={model}>{model}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          size="small"
          label="Statut"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="tous">Tous</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
      </Box>
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
        <DataGrid autoHeight rows={filteredRows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} />
      </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Modifier vehicule' : 'Ajouter vehicule'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Immatriculation" value={form.immatriculation} onChange={onChangeField('immatriculation')} />
              <TextField label="Marque" value={form.marque} onChange={onChangeField('marque')} />
              <TextField label="Modele" value={form.modele} onChange={onChangeField('modele')} />
              <TextField label="Annee" type="number" value={form.annee} onChange={onChangeField('annee')} />
              <TextField select label="Statut" value={form.statut} onChange={onChangeField('statut')}>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <TextField label="Kilometrage" type="number" value={form.kilometrage} onChange={onChangeField('kilometrage')} />
              <TextField label="Derniere vidange (km)" type="number" value={form.derniereVidangeKm} onChange={onChangeField('derniereVidangeKm')} />
              <TextField label="Date derniere vidange" type="date" InputLabelProps={{ shrink: true }} value={form.derniereVidangeDate} onChange={onChangeField('derniereVidangeDate')} />
              <TextField label="Prochain entretien (km)" type="number" value={form.prochainEntretienKm} onChange={onChangeField('prochainEntretienKm')} />
              <TextField label="Couleur" value={form.couleur} onChange={onChangeField('couleur')} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={closeDialog} disabled={loading} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
          <Button variant="contained" aria-label={editingId ? 'enregistrer vehicule' : 'ajouter vehicule'} onClick={saveVehicule} disabled={loading} sx={{ minWidth: 44 }}>
            <CheckRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Historique reservations - {historyVehiculeLabel}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {historyError && <Alert severity="error">{historyError}</Alert>}
            <Box sx={{ '& .MuiDataGrid-root': { border: 0 } }}>
              <DataGrid
                autoHeight
                loading={historyLoading}
                rows={historyRows}
                columns={[
                  { field: 'reservationId', headerName: '#', width: 70 },
                  { field: 'clientNom', headerName: 'Client', flex: 1.2 },
                  { field: 'dateDebut', headerName: 'Date debut', flex: 1 },
                  { field: 'dateFin', headerName: 'Date fin', flex: 1 },
                  { field: 'statut', headerName: 'Statut', flex: 1 },
                  { field: 'kilometrageDepart', headerName: 'Km depart', flex: 1 },
                  { field: 'kilometrageRetour', headerName: 'Km retour', flex: 1 },
                  { field: 'montantLocation', headerName: 'Montant (TND)', flex: 1 }
                ]}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="fermer historique" onClick={() => setHistoryDialogOpen(false)} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
