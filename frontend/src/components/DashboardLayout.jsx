import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../auth/AuthContext';

const menu = [
  { label: 'Dashboard', path: '/' },
  { label: 'Maintenance', path: '/parc' },
  { label: 'Vehicules', path: '/vehicules' },
  { label: 'Disponibilite', path: '/disponibilite' },
  { label: 'Reservations', path: '/reservations' },
  { label: 'Clients', path: '/clients' },
  { label: 'Facturation', path: '/facturation' },
  { label: 'Utilisateurs', path: '/utilisateurs' }
];

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const drawerContent = (
    <Box sx={{ height: '100%', p: 2 }}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 1, pb: 2.5, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
          <DirectionsCarFilledRoundedIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>Agence Location</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</Typography>
        </Box>
      </Stack>

      <List sx={{ gap: 0.75, display: 'grid', pt: 1.5 }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 1,
                bgcolor: active ? 'primary.main' : 'transparent',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: active ? '#d81b60' : 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 600,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.82)'
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.05)',
          bgcolor: 'rgba(255,255,255,0.9)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
              <DirectionsCarFilledRoundedIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Agence Location
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pilotage flotte et disponibilites
              </Typography>
            </Box>
          </Stack>

          <IconButton
            color="primary"
            aria-label="logout"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            borderRight: 'none',
            bgcolor: '#1f283e',
            color: '#ffffff'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            borderRight: 'none',
            bgcolor: '#1f283e',
            color: '#ffffff',
            top: 65,
            height: 'calc(100% - 65px)',
            boxShadow: '0 8px 24px rgba(31,40,62,0.35)'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ pt: 11, pb: 4, pl: { md: '280px' } }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
