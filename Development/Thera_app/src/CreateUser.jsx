import React, { useEffect, useContext, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function CreateUser() {
  const theme = useTheme();
  const warningColor = theme.palette.warning.main;

  const [rememberEmail, setRememberEmail] = React.useState('');
  const navigate = useNavigate();
  const [newname, setNewname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rememberEmail || !password || !newname) return;
    const newUser = {
      email: rememberEmail,
      password: password,
      name: newname, // you need to collect this from a form field too
    };
    setLoading(true);
    setError('');
    try {
      const doctor = JSON.parse(localStorage.getItem('user'));
      const doctorId = doctor?.id;
      const response = await fetch(`http://localhost:3010/v0/create/${doctorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctor.accessToken}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }

      const json = await response.json();
      console.log('Created patient:', json);
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Patient creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const warningInputStyle = {
    '& label.Mui-focused': { color: warningColor },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: warningColor },
      '&:hover fieldset': { borderColor: warningColor },
      '&.Mui-focused fieldset': { borderColor: warningColor },
      '& .MuiInputBase-input': { color: warningColor },
    },
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ bgcolor: 'warning.main' }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setRememberEmail(e.target.value)}
              value={rememberEmail}
              sx={warningInputStyle}
              InputLabelProps={{
                sx: {
                  color: warningColor,
                  '&.Mui-focused': { color: warningColor },
                  '&.MuiFormLabel-filled': { color: warningColor },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              sx={warningInputStyle}
              InputLabelProps={{
                sx: {
                  color: warningColor,
                  '&.Mui-focused': { color: warningColor },
                  '&.MuiFormLabel-filled': { color: warningColor },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="Name"
              label="Name"
              type="Name"
              id="name"
              autoComplete="current-name"
              onChange={(e) => setNewname(e.target.value)}
              value={newname}
              sx={warningInputStyle}
              InputLabelProps={{
                sx: {
                  color: warningColor,
                  '&.Mui-focused': { color: warningColor },
                  '&.MuiFormLabel-filled': { color: warningColor },
                },
              }}
            />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress color="warning" />
              </Box>
            ) : (
              <Button
                type="submit"
                role="button"
                aria-label="Login"
                fullWidth
                variant="contained"
                color="warning"
                sx={{ mt: 3, mb: 2 }}
              >
                <Typography variant="overline">Create User</Typography>
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
