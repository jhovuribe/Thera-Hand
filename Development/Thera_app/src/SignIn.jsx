import React, { useEffect, useContext, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Context } from './Context.jsx';

const defaultTheme = createTheme();

export default function SignIn() {
  const theme = useTheme();
  const warningColor = theme.palette.warning.main;

  const { remember, setRemember, rememberEmail, setRememberEmail } = useContext(Context);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rememberEmail || !password) return;

    const user = {
      email: rememberEmail,
      password: password,
    };

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3010/v0/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const json = await response.json();
      localStorage.setItem('user', JSON.stringify(json));
      if (remember) {
        localStorage.setItem('remember', JSON.stringify({ email: rememberEmail }));
      } else {
        localStorage.removeItem('remember');
        setRememberEmail('');
      }
      if (JSON.parse(localStorage.getItem('user')).role === 'admin') navigate('/admin');
      else navigate('/home');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRememberChange = (event) => {
    setRemember(event.target.checked);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('remember'));
    if (storedUser) {
      setRememberEmail(storedUser.email || '');
      setRemember(true);
    } else {
      setRememberEmail('');
      setRemember(false);
    }
  }, [setRemember, setRememberEmail]);

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
          <Avatar sx={{ m: 1, bgcolor: 'warning.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color="warning">
            Sign in
          </Typography>

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
            <FormControlLabel
              role="button"
              aria-label="rememberMe"
              control={
                <Checkbox
                  value="remember"
                  color="warning"
                  onChange={handleRememberChange}
                  checked={remember}
                />
              }
              label="Remember me"
              sx={{
                '& .MuiFormControlLabel-label': {
                  color: remember ? warningColor : 'grey',
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
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
