import { Box, Container, Stack, Typography } from '@mui/material';
import LoginBox from '../components/LoginBox';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'radial-gradient(circle at 15% 20%, rgba(29,78,216,0.2), transparent 35%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.2), transparent 40%), linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={2.2}>
          <Typography variant="h4" sx={{ textAlign: 'center' }}>
            Connexion au Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
            Authentifie-toi pour acceder a la gestion de flotte et disponibilite.
          </Typography>
          <LoginBox />
        </Stack>
      </Container>
    </Box>
  );
}
