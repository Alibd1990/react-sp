import { useState } from 'react';
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

const roleOptions = ['ADMIN', 'AGENT', 'CLIENT'];

const initialUsers = [
  { id: 1, username: 'admin', role: 'ADMIN' },
  { id: 2, username: 'agent', role: 'AGENT' },
  { id: 3, username: 'client', role: 'CLIENT' }
];

export default function UsersPage() {
  const [rows, setRows] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: '', role: 'AGENT' });
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm({ username: '', role: 'AGENT' });
    setDialogOpen(true);
    setError('');
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ username: row.username, role: row.role });
    setDialogOpen(true);
    setError('');
  };

  const saveUser = () => {
    if (!form.username.trim()) {
      setError('Username requis');
      return;
    }
    if (editingId) {
      setRows((prev) => prev.map((u) => (u.id === editingId ? { ...u, username: form.username.trim(), role: form.role } : u)));
    } else {
      const nextId = rows.length ? Math.max(...rows.map((u) => u.id)) + 1 : 1;
      setRows((prev) => [...prev, { id: nextId, username: form.username.trim(), role: form.role }]);
    }
    setDialogOpen(false);
  };

  const deleteUser = (row) => {
    if (!window.confirm(`Supprimer l'utilisateur ${row.username} ?`)) {
      return;
    }
    setRows((prev) => prev.filter((u) => u.id !== row.id));
  };

  const columns = [
    { field: 'username', headerName: 'Utilisateur', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 0.8 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.5 }}>
          <Button size="small" variant="outlined" aria-label="modifier utilisateur" onClick={() => openEdit(params.row)} sx={{ minWidth: 36 }}><EditRoundedIcon fontSize="small" /></Button>
          <Button size="small" color="error" variant="outlined" aria-label="supprimer utilisateur" onClick={() => deleteUser(params.row)} sx={{ minWidth: 36 }}><DeleteRoundedIcon fontSize="small" /></Button>
        </Stack>
      )
    }
  ];

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: { xs: 2, md: 3.2 }, borderRadius: 3, background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)', color: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5">Gestion Utilisateurs</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Gestion locale des comptes de dashboard.</Typography>
          </Box>
          <Button variant="contained" aria-label="ajouter utilisateur" onClick={openCreate} sx={{ minWidth: 48, bgcolor: '#e91e63', '&:hover': { bgcolor: '#d81b60' } }}><AddRoundedIcon /></Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1.5, borderRadius: 3 }}>
        <Box sx={{ '& .MuiDataGrid-root': { border: 0 } }}>
          <DataGrid autoHeight rows={rows} columns={columns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }} />
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Modifier utilisateur' : 'Ajouter utilisateur'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Username" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button aria-label="annuler" onClick={() => setDialogOpen(false)} sx={{ minWidth: 44 }}><CloseRoundedIcon fontSize="small" /></Button>
          <Button variant="contained" aria-label={editingId ? 'enregistrer utilisateur' : 'ajouter utilisateur'} onClick={saveUser} sx={{ minWidth: 44 }}><CheckRoundedIcon fontSize="small" /></Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
