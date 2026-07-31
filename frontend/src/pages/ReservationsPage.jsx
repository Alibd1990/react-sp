import { useEffect, useMemo, useState } from 'react';
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
  vehiculeId: '',
  clientId: '',
  dateDebut: '',
  dateFin: '',
  tarifJournalier: '',
  acompteTnd: '',
  cautionTnd: '',
  statut: 'EN_ATTENTE'
};

const statusOptions = ['EN_ATTENTE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'CLOTUREE', 'ANNULEE', 'NO_SHOW'];

export default function ReservationsPage() {
  const [rows, setRows] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const vehiculeMap = useMemo(() => Object.fromEntries(vehicules.map((v) => [v.id, `${v.immatriculation} - ${v.marque} ${v.modele}`])), [vehicules]);
  const clientMap = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, `${c.nom} (${c.email})`])), [clients]);

  const loadAll = async () => {
    setError('');
    try {
      const [resReservations, resVehicules, resClients] = await Promise.all([
        api.get('/reservations'),
        api.get('/vehicules'),
        api.get('/clients')
      ]);
      setRows(resReservations.data.map((item) => ({ ...item, id: item.id })));
      setVehicules(resVehicules.data);
      setClients(resClients.data);
    } catch {
      setError('Impossible de charger les reservations');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      vehiculeId: row.vehiculeId,
      clientId: row.clientId,
      dateDebut: row.dateDebut,
      dateFin: row.dateFin,
      tarifJournalier: row.tarifJournalier,
      acompteTnd: row.acompteTnd ?? '',
      cautionTnd: row.cautionTnd ?? '',
      statut: row.statut
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const saveReservation = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      if (editingId) {
        await api.put(`/reservations/${editingId}`, {
          vehiculeId: Number(form.vehiculeId),
          clientId: Number(form.clientId),
          dateDebut: form.dateDebut,
          dateFin: form.dateFin,
          tarifJournalier: Number(form.tarifJournalier),
          acompteTnd: form.acompteTnd === '' ? null : Number(form.acompteTnd),
          cautionTnd: form.cautionTnd === '' ? null : Number(form.cautionTnd),
          statut: form.statut
        });
      } else {
        await api.post('/reservations', {
          vehiculeId: Number(form.vehiculeId),
          clientId: Number(form.clientId),
          dateDebut: form.dateDebut,
          dateFin: form.dateFin,
          tarifJournalier: Number(form.tarifJournalier),
          acompteTnd: form.acompteTnd === '' ? null : Number(form.acompteTnd),
          cautionTnd: form.cautionTnd === '' ? null : Number(form.cautionTnd)
        });
      }
      setDialogOpen(false);
      await loadAll();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Operation echouee');
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (row) => {
    if (!window.confirm(`Supprimer la reservation #${row.id} ?`)) {
      return;
    }
    try {
      await api.delete(`/reservations/${row.id}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Suppression echouee');
    }
  };

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    {
      field: 'vehiculeId',
      headerName: 'Vehicule',
      flex: 1.2,
      valueGetter: (_, row) => vehiculeMap[row.vehiculeId] || row.vehiculeId
    },
    {
      field: 'clientId',
      headerName: 'Client',
      flex: 1.2,
      valueGetter: (_, row) => clientMap[row.clientId] || row.clientId
    },
    { field: 'dateDebut', headerName: 'Date debut', flex: 0.9 },
    { field: 'dateFin', headerName: 'Date fin', flex: 0.9 },
    { field: 'tarifJournalier', headerName: 'Tarif/jour (TND)', flex: 0.9 },
    { field: 'acompteTnd', headerName: 'Acompte (TND)', flex: 0.8 },
    { field: 'cautionTnd', headerName: 'Caution (TND)', flex: 0.8 },
    { field: 'statut', headerName: 'Statut', flex: 0.8 },
    { field: 'prixEstime', headerName: 'Prix estime (TND)', flex: 0.9 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.3,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
          <Button size="small" variant="outlined" aria-label="modifier reservation" onClick={() => openEdit(params.row)} sx={{ minWidth: 36 }}>
            <EditRoundedIcon fontSize="small" />
          </Button>
          <Button size="small" color="error" variant="outlined" aria-label="supprimer reservation" onClick={() => deleteReservation(params.row)} sx={{ minWidth: 36 }}>
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
            <Typography variant="h5">Gestion Reservations</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Ajouter, modifier et supprimer les reservations.</Typography>
          </Box>
          <Button variant="contained" aria-label="ajouter reservation" onClick={openCreate} sx={{ minWidth: 48, bgcolor: '#e91e63', '&:hover': { bgcolor: '#d81b60' } }}>
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
        <DialogTitle>{editingId ? 'Modifier reservation' : 'Ajouter reservation'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField select label="Vehicule" value={form.vehiculeId} onChange={onChange('vehiculeId')}>
                {vehicules.map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.immatriculation} - {v.marque} {v.modele}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Client" value={form.clientId} onChange={onChange('clientId')}>
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom} ({c.email})</MenuItem>
                ))}
              </TextField>
              <TextField type="date" label="Date debut" InputLabelProps={{ shrink: true }} value={form.dateDebut} onChange={onChange('dateDebut')} />
              <TextField type="date" label="Date fin" InputLabelProps={{ shrink: true }} value={form.dateFin} onChange={onChange('dateFin')} />
              <TextField type="number" label="Tarif journalier (TND)" value={form.tarifJournalier} onChange={onChange('tarifJournalier')} />
              <TextField type="number" label="Acompte (TND)" value={form.acompteTnd} onChange={onChange('acompteTnd')} />
              <TextField type="number" label="Caution (TND)" value={form.cautionTnd} onChange={onChange('cautionTnd')} />
              <TextField select label="Statut" value={form.statut} onChange={onChange('statut')} disabled={!editingId}>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={() => setDialogOpen(false)} disabled={loading} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
          <Button variant="contained" aria-label={editingId ? 'enregistrer reservation' : 'ajouter reservation'} onClick={saveReservation} disabled={loading} sx={{ minWidth: 44 }}>
            <CheckRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
