import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/client';

const emptyForm = {
  type: 'PARTICULIER',
  nom: '',
  email: '',
  cin: '',
  permisNumero: '',
  permisExpiration: '',
  blackliste: false
};

const types = ['PARTICULIER', 'ENTREPRISE'];

export default function ClientsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadRows = async () => {
    setError('');
    try {
      const res = await api.get('/clients');
      setRows(res.data.map((item) => ({ ...item, id: item.id })));
    } catch {
      setError('Impossible de charger les clients');
    }
  };

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
    setForm({ ...row });
    setSubmitError('');
    setDialogOpen(true);
  };

  const onChange = (field) => (event) => {
    const value = field === 'blackliste' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveClient = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const payload = {
        type: form.type,
        nom: String(form.nom || '').trim(),
        email: String(form.email || '').trim(),
        cin: String(form.cin || '').trim(),
        permisNumero: String(form.permisNumero || '').trim(),
        permisExpiration: form.permisExpiration,
        blackliste: Boolean(form.blackliste)
      };
      if (editingId) {
        await api.put(`/clients/${editingId}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      setDialogOpen(false);
      await loadRows();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Operation echouee');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (row) => {
    if (!window.confirm(`Supprimer le client ${row.nom} ?`)) {
      return;
    }
    try {
      await api.delete(`/clients/${row.id}`);
      await loadRows();
    } catch (err) {
      setError(err?.response?.data?.message || 'Suppression echouee');
    }
  };

  const columns = [
    { field: 'nom', headerName: 'Nom', flex: 1 },
    { field: 'cin', headerName: 'CIN', flex: 0.8 },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'type', headerName: 'Type', flex: 0.9 },
    { field: 'permisNumero', headerName: 'Permis', flex: 0.9 },
    { field: 'permisExpiration', headerName: 'Expiration', flex: 0.8 },
    {
      field: 'blackliste',
      headerName: 'Blacklist',
      flex: 0.7,
      valueGetter: (_, row) => (row.blackliste ? 'Oui' : 'Non')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
          <Button size="small" variant="outlined" aria-label="modifier client" onClick={() => openEdit(params.row)} sx={{ minWidth: 36 }}>
            <EditRoundedIcon fontSize="small" />
          </Button>
          <Button size="small" color="error" variant="outlined" aria-label="supprimer client" onClick={() => deleteClient(params.row)} sx={{ minWidth: 36 }}>
            <DeleteRoundedIcon fontSize="small" />
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: { xs: 2, md: 3.2 }, borderRadius: 3, background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)', color: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5">Gestion Clients</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Ajouter, modifier et supprimer les clients.</Typography>
          </Box>
          <Button variant="contained" aria-label="ajouter client" onClick={openCreate} sx={{ minWidth: 48, bgcolor: '#e91e63', '&:hover': { bgcolor: '#d81b60' } }}>
            <AddRoundedIcon />
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ '& .MuiDataGrid-root': { border: 0 } }}>
          <DataGrid autoHeight rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} />
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Modifier client' : 'Ajouter client'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField select label="Type" value={form.type} onChange={onChange('type')}>
                {types.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField label="Nom" value={form.nom} onChange={onChange('nom')} />
              <TextField label="CIN" value={form.cin} onChange={onChange('cin')} />
              <TextField label="Email" value={form.email} onChange={onChange('email')} />
              <TextField label="Permis numero" value={form.permisNumero} onChange={onChange('permisNumero')} />
              <TextField type="date" label="Permis expiration" InputLabelProps={{ shrink: true }} value={form.permisExpiration} onChange={onChange('permisExpiration')} />
              <FormControlLabel control={<Switch checked={Boolean(form.blackliste)} onChange={onChange('blackliste')} />} label="Client blackliste" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={() => setDialogOpen(false)} disabled={loading} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
          <Button variant="contained" aria-label={editingId ? 'enregistrer client' : 'ajouter client'} onClick={saveClient} disabled={loading} sx={{ minWidth: 44 }}>
            <CheckRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
