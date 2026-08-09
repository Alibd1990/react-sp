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
import { DataGrid } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import api from '../api/client';
import { getApiErrorMessage } from '../api/errors';

const emptyForm = {
  reservationId: '',
  dateEmission: '',
  montantTnd: '',
  statut: 'BROUILLON',
  notes: ''
};

const statutOptions = ['BROUILLON', 'EMISE', 'PAYEE', 'ANNULEE'];

export default function FacturationPage() {
  const [rows, setRows] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setError('');
    try {
      const [facturesRes, reservationsRes] = await Promise.all([
        api.get('/factures'),
        api.get('/reservations')
      ]);
      setRows(facturesRes.data.map((f) => ({ ...f, id: f.id })));
      setReservations(reservationsRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger la facturation'));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.montantTnd || 0), 0), [rows]);

  const reservationMap = useMemo(
    () => Object.fromEntries(reservations.map((r) => [r.id, `#${r.id} | veh:${r.vehiculeId} | cli:${r.clientId}`])),
    [reservations]
  );

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, dateEmission: new Date().toISOString().slice(0, 10) });
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      reservationId: row.reservationId,
      dateEmission: row.dateEmission,
      montantTnd: row.montantTnd,
      statut: row.statut,
      notes: row.notes || ''
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const saveFacture = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const payload = {
        reservationId: Number(form.reservationId),
        dateEmission: form.dateEmission,
        montantTnd: Number(form.montantTnd),
        statut: form.statut,
        notes: form.notes
      };

      if (editingId) {
        await api.put(`/factures/${editingId}`, payload);
      } else {
        await api.post('/factures', payload);
      }

      setDialogOpen(false);
      await loadAll();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Operation facture echouee'));
    } finally {
      setLoading(false);
    }
  };

  const deleteFacture = async (row) => {
    if (!window.confirm(`Supprimer la facture #${row.id} ?`)) {
      return;
    }
    try {
      await api.delete(`/factures/${row.id}`);
      await loadAll();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Suppression facture echouee'));
    }
  };

  const printFacture = (row) => {
    const printable = window.open('', '_blank', 'width=800,height=900');
    if (!printable) {
      return;
    }
    printable.document.write(`
      <html>
      <head><title>Facture #${row.id}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Facture #${row.id}</h2>
        <p><strong>Reservation:</strong> ${row.reservationId}</p>
        <p><strong>Date emission:</strong> ${row.dateEmission}</p>
        <p><strong>Montant:</strong> ${row.montantTnd} TND</p>
        <p><strong>Statut:</strong> ${row.statut}</p>
        <p><strong>Notes:</strong> ${row.notes || '-'}</p>
      </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  const columns = [
    {
      field: 'reservationId',
      headerName: 'Reservation',
      flex: 1.2,
      valueGetter: (_, row) => reservationMap[row.reservationId] || row.reservationId
    },
    { field: 'dateEmission', headerName: 'Date emission', flex: 0.9 },
    { field: 'montantTnd', headerName: 'Montant (TND)', flex: 0.8 },
    { field: 'statut', headerName: 'Statut', flex: 0.8 },
    { field: 'notes', headerName: 'Notes', flex: 1.2 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
            <Button size="small" variant="outlined" aria-label="modifier facture" onClick={() => openEdit(row)} sx={{ minWidth: 36 }}>
              <EditRoundedIcon fontSize="small" />
            </Button>
            <Button size="small" color="error" variant="outlined" aria-label="supprimer facture" onClick={() => deleteFacture(row)} sx={{ minWidth: 36 }}>
              <DeleteRoundedIcon fontSize="small" />
            </Button>
            <Button size="small" variant="contained" aria-label="imprimer facture" onClick={() => printFacture(row)} sx={{ minWidth: 36 }}>
              <PrintRoundedIcon fontSize="small" />
            </Button>
          </Stack>
        );
      }
    }
  ];

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: { xs: 2, md: 3.2 }, borderRadius: 3, background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)', color: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5">Gestion Facturation</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Creation, modification et impression des factures.</Typography>
            <Typography variant="h6" sx={{ mt: 1.5 }}>Total estime: {Math.round(total)} TND</Typography>
          </Box>
          <Button variant="contained" aria-label="ajouter facture" onClick={openCreate} sx={{ minWidth: 48, bgcolor: '#e91e63', '&:hover': { bgcolor: '#d81b60' } }}>
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
        <DialogTitle>{editingId ? 'Modifier facture' : 'Ajouter facture'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField select label="Reservation" value={form.reservationId} onChange={onChange('reservationId')}>
                {reservations.map((reservation) => (
                  <MenuItem key={reservation.id} value={reservation.id}>#{reservation.id} - veh:{reservation.vehiculeId} / cli:{reservation.clientId}</MenuItem>
                ))}
              </TextField>
              <TextField type="date" label="Date emission" InputLabelProps={{ shrink: true }} value={form.dateEmission} onChange={onChange('dateEmission')} />
              <TextField type="number" label="Montant (TND)" value={form.montantTnd} onChange={onChange('montantTnd')} />
              <TextField select label="Statut" value={form.statut} onChange={onChange('statut')}>
                {statutOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <TextField label="Notes" value={form.notes} onChange={onChange('notes')} multiline minRows={2} sx={{ gridColumn: { md: '1 / -1' } }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={() => setDialogOpen(false)} disabled={loading} sx={{ minWidth: 44 }}>
            <CloseRoundedIcon fontSize="small" />
          </Button>
          <Button variant="contained" aria-label={editingId ? 'enregistrer facture' : 'ajouter facture'} onClick={saveFacture} disabled={loading} sx={{ minWidth: 44 }}>
            <CheckRoundedIcon fontSize="small" />
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
