import { useEffect, useState } from 'react';
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
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
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
  categorie: '',
  couleur: ''
};

const statusOptions = ['DISPONIBLE', 'RESERVE', 'EN_LOCATION', 'EN_MAINTENANCE', 'HORS_SERVICE', 'RETIRE_DU_PARC'];
const categoryOptions = ['citadine', 'SUV', 'utilitaire', 'premium'];
const brandModels = {
  Peugeot: ['208', '3008', 'Partner'],
  Renault: ['Clio', 'Megane', 'Kangoo'],
  Dacia: ['Duster', 'Logan'],
  Ford: ['Transit', 'Focus'],
  Hyundai: ['Tucson', 'i20'],
  Toyota: ['Yaris', 'Corolla', 'Hilux']
};

const colorOptions = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Beige', 'Argent'];

const categoryColor = {
  citadine: '#1a73e8',
  suv: '#344767',
  utilitaire: '#fb8c00',
  premium: '#2e7d32'
};

export default function FleetPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [brandFilter, setBrandFilter] = useState('toutes');
  const [modelFilter, setModelFilter] = useState('tous');
  const [categoryFilter, setCategoryFilter] = useState('toutes');
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
      categorie: row.categorie || '',
      couleur: row.couleur || ''
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

  const onChangeMarque = (event) => {
    const marque = event.target.value;
    const allowedModels = brandModels[marque] || [];
    setForm((prev) => ({
      ...prev,
      marque,
      modele: allowedModels.includes(prev.modele) ? prev.modele : (allowedModels[0] || '')
    }));
  };

  const filteredRows = rows.filter((item) => {
    const rowBrand = String(item.marque || '');
    const rowModel = String(item.modele || '');
    const rowCategory = String(item.categorie || '').toLowerCase();
    const rowStatus = String(item.statut || '');

    const matchBrand = brandFilter === 'toutes' || rowBrand === brandFilter;
    const matchModel = modelFilter === 'tous' || rowModel === modelFilter;
    const matchCategory = categoryFilter === 'toutes' || rowCategory === categoryFilter.toLowerCase();
    const matchStatus = statusFilter === 'tous' || rowStatus === statusFilter;

    return matchBrand && matchModel && matchCategory && matchStatus;
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
        categorie: String(form.categorie || '').trim(),
        couleur: String(form.couleur || '').trim()
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
    {
      field: 'categorie',
      headerName: 'Categorie',
      flex: 1,
      renderCell: (params) => {
        const value = String(params.row.categorie || '').toLowerCase();
        return (
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: 10,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'capitalize',
              bgcolor: categoryColor[value] || '#7b809a'
            }}
          >
            {params.row.categorie || '-'}
          </Box>
        );
      }
    },
    { field: 'statut', headerName: 'Statut', flex: 1 },
    { field: 'kilometrage', headerName: 'Km', flex: 0.8 },
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
          label="Categorie"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="toutes">Toutes</MenuItem>
          {categoryOptions.map((category) => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
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
              <TextField select label="Marque" value={form.marque} onChange={onChangeMarque}>
                {Object.keys(brandModels).map((brand) => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Modele" value={form.modele} onChange={onChangeField('modele')} disabled={!form.marque}>
                {(brandModels[form.marque] || []).map((model) => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </TextField>
              <TextField label="Annee" type="number" value={form.annee} onChange={onChangeField('annee')} />
              <TextField select label="Statut" value={form.statut} onChange={onChangeField('statut')}>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <TextField label="Kilometrage" type="number" value={form.kilometrage} onChange={onChangeField('kilometrage')} />
              <TextField select label="Categorie" value={form.categorie} onChange={onChangeField('categorie')}>
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Couleur" value={form.couleur} onChange={onChangeField('couleur')}>
                {colorOptions.map((color) => (
                  <MenuItem key={color} value={color}>{color}</MenuItem>
                ))}
              </TextField>
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
    </Stack>
  );
}
