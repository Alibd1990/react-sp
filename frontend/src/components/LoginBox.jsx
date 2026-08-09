import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import api from '../api/client';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthContext';

export default function LoginBox() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      authLogin({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        remember
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login echoue'));
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)'
      }}
      elevation={0}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LockRoundedIcon color="primary" />
          <Typography variant="h6">Connexion API</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Connecte-toi pour activer les appels backend securises.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <FormControlLabel
          control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
          label="Se souvenir de moi"
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" aria-label="login" onClick={login} sx={{ minHeight: 55, minWidth: 55 }}>
            <LoginRoundedIcon />
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
