import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api/client';

export default function ParcPage() {
	const statusOptions = ['DISPONIBLE', 'RESERVE', 'EN_LOCATION', 'EN_MAINTENANCE', 'HORS_SERVICE', 'RETIRE_DU_PARC'];
  const statusColor = {
    DISPONIBLE: '#4caf50',
    RESERVE: '#fb8c00',
    EN_LOCATION: '#1a73e8',
    EN_MAINTENANCE: '#344767',
    HORS_SERVICE: '#f44335',
    RETIRE_DU_PARC: '#7b809a'
  };

	const [error, setError] = useState('');
	const [vehicles, setVehicles] = useState([]);

	const [statusFilter, setStatusFilter] = useState('TOUS');

	useEffect(() => {
		const loadVehicles = async () => {
			setError('');
			try {
				const res = await api.get('/vehicules');
				setVehicles(res.data.map((item) => ({ ...item, id: item.id })));
			} catch {
				setError('Impossible de charger les vehicules');
			}
		};

		loadVehicles();
	}, []);

	const filteredRows = useMemo(
		() =>
			vehicles.filter((row) => {
				const byStatus = statusFilter === 'TOUS' || row.statut === statusFilter;
				return byStatus;
			}),
			[vehicles, statusFilter]
	);

	const updateRow = (id, updates) => {
		setVehicles((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
	};

	const total = vehicles.length;
	const inMaintenance = vehicles.filter((vehicle) => vehicle.statut === 'EN_MAINTENANCE').length;
	const outOfService = vehicles.filter((vehicle) => vehicle.statut === 'HORS_SERVICE').length;
	const available = vehicles.filter((vehicle) => vehicle.statut === 'DISPONIBLE').length;

	const columns = [
		{ field: 'immatriculation', headerName: 'Immatriculation', flex: 1 },
		{ field: 'marque', headerName: 'Marque', flex: 1 },
		{ field: 'modele', headerName: 'Modele', flex: 1 },
		{ field: 'couleur', headerName: 'Couleur', flex: 0.9 },
		{ field: 'categorie', headerName: 'Categorie', flex: 0.9 },
		{
			field: 'statut',
			headerName: 'Statut',
			flex: 1.4,
			sortable: false,
			renderCell: (params) => (
				<Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
					<Box sx={{ px: 1, py: 0.45, borderRadius: 10, bgcolor: statusColor[params.row.statut] || '#7b809a', color: '#fff', fontSize: 12, fontWeight: 700 }}>
						{params.row.statut || '-'}
					</Box>
					<TextField
						select
						size="small"
						value={params.row.statut}
						onChange={(event) => {
							const nextStatut = event.target.value;
							updateRow(params.row.id, {
								statut: nextStatut
							});
						}}
						sx={{ minWidth: 140 }}
					>
						{statusOptions.map((status) => (
							<MenuItem key={status} value={status}>{status}</MenuItem>
						))}
					</TextField>
				</Stack>
			)
		},
		{
			field: 'actions',
			headerName: 'Actions',
			flex: 1.2,
			sortable: false,
			filterable: false,
			renderCell: (params) => (
				<Stack direction="row" spacing={0.5} sx={{ py: 0.5 }}>
					<IconButton size="small" color="info" aria-label="mettre en maintenance" onClick={() => updateRow(params.row.id, { statut: 'EN_MAINTENANCE' })}>
						<BlockRoundedIcon fontSize="small" />
					</IconButton>
					<IconButton size="small" color="warning" aria-label="bloquer vehicule" onClick={() => updateRow(params.row.id, { statut: 'HORS_SERVICE' })}>
						<HandymanRoundedIcon fontSize="small" />
					</IconButton>
					<IconButton size="small" color="success" aria-label="remettre disponible" onClick={() => updateRow(params.row.id, { statut: 'DISPONIBLE' })}>
						<CheckCircleRoundedIcon fontSize="small" />
					</IconButton>
				</Stack>
			)
		}
	];

	return (
		<Stack spacing={2.5}>
			<Paper sx={{ p: { xs: 2, md: 3.2 }, borderRadius: 3, background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)', color: 'white' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<BuildRoundedIcon />
					<Box>
						<Typography variant="h5">Maintenance et etats vehicules</Typography>
						<Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
							Suivi des statuts, controle des maintenances et remise en service.
						</Typography>
					</Box>
				</Stack>
			</Paper>

			{error && <Alert severity="error">{error}</Alert>}

			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<Paper sx={{ p: 2.2, borderRadius: 3, flex: 1 }}>
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
				<Paper sx={{ p: 2.2, borderRadius: 3, flex: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="overline" color="text.secondary">En maintenance</Typography>
							<Typography variant="h5">{inMaintenance}</Typography>
						</Box>
						<Box sx={{ bgcolor: 'info.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
							<HandymanRoundedIcon fontSize="small" />
						</Box>
					</Stack>
				</Paper>
				<Paper sx={{ p: 2.2, borderRadius: 3, flex: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="overline" color="text.secondary">Hors service</Typography>
							<Typography variant="h5">{outOfService}</Typography>
						</Box>
						<Box sx={{ bgcolor: 'error.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
							<WarningAmberRoundedIcon fontSize="small" />
						</Box>
					</Stack>
				</Paper>
				<Paper sx={{ p: 2.2, borderRadius: 3, flex: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="overline" color="text.secondary">Disponibles</Typography>
							<Typography variant="h5">{available}</Typography>
						</Box>
						<Box sx={{ bgcolor: 'success.main', color: '#fff', borderRadius: 2, p: 1, display: 'grid', placeItems: 'center' }}>
							<CheckCircleRoundedIcon fontSize="small" />
						</Box>
					</Stack>
				</Paper>
			</Stack>

			<Paper sx={{ p: 1.5, borderRadius: 3 }}>
				<Box sx={{ display: 'flex', gap: 1.25, mb: 2, flexWrap: 'wrap' }}>
					<TextField
						select
						size="small"
						label="Statut"
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						sx={{ minWidth: 190 }}
					>
						<MenuItem value="TOUS">Tous</MenuItem>
						{statusOptions.map((status) => (
							<MenuItem key={status} value={status}>{status}</MenuItem>
						))}
					</TextField>
					<Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.25, borderRadius: 2, bgcolor: 'rgba(26,115,232,0.08)' }}>
						<BuildRoundedIcon sx={{ mr: 0.5, fontSize: 18, color: 'info.main' }} />
						<Typography variant="caption" sx={{ color: 'info.main', fontWeight: 700 }}>
							{filteredRows.length} vehicules affiches
						</Typography>
					</Box>
				</Box>
				<Box sx={{ '& .MuiDataGrid-root': { border: 0 } }}>
					<DataGrid autoHeight rows={filteredRows} columns={columns} pageSizeOptions={[5, 10, 20]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} />
				</Box>
			</Paper>
		</Stack>
	);
}
