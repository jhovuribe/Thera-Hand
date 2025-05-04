import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { CircularProgress, Alert } from '@mui/material';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import PersonIcon from '@mui/icons-material/Person';

const defaultTheme = createTheme();

export default function Admin() {
  const theme = useTheme();
  const warningColor = theme.palette.warning.main;
  const [selectedUser, setSelectedUser] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState('');
  const [rememberEmail, setRememberEmail] = React.useState('');
  const [rememberDoctorEmail, setRememberDoctorEmail] = React.useState('');
  const [rememberPatientEmail, setRememberPatientEmail] = React.useState('');



  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handlePatientSelect = (user) => {
    setSelectedPatient(user);
  }

  const [newname, setNewname] = useState('');
  const [password, setPassword] = useState('');

  const [patientNewname, setPatientNewname] = useState('');
  const [patientPassword, setPatientPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientError, setPatientError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const stored = JSON.parse(localStorage.getItem('user')); // Adjust if your token is stored differently
      const token = stored.accessToken;
      try {
        const response = await fetch('http://localhost:3010/v0/doctors', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch doctors');
        }

        const data = await response.json();
        setDoctors(data);
        if (!selectedUser) setSelectedUser(data[0]);
        console.log(data[0]);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));

      if (!stored) {
        console.warn('No user in localStorage');
        return;
      }

      if (!selectedUser) {
        return;
      }

      const response = await fetch(`http://localhost:3010/v0/home/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${stored.accessToken}`,
          Accept: 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        setSelectedPatient(data[0]);
      } else {
        const err = await response.text();
        console.error('Failed to load patients:', err);
      }
    };

    fetchPatients();
  }, [selectedUser]);

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
      const admin = JSON.parse(localStorage.getItem('user'));
      const adminId = admin?.id;
      const response = await fetch(`http://localhost:3010/v0/createdoctor/${adminId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin.accessToken}`,
        },
        body: JSON.stringify(newUser),
      });
      console.log(adminId);
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }

      const json = await response.json();
      console.log('Created doctor:', json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Doctor creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (event) => {
    event.preventDefault();
    if (!rememberDoctorEmail || !rememberPatientEmail || !patientPassword || !patientNewname) return;
    const newUser = {
      email: rememberPatientEmail,
      password: patientPassword,
      name: patientNewname, // you need to collect this from a form field too
    };
    setPatientLoading(true);
    setPatientError('');
    const doctor = doctors.find((doc) => doc.email === rememberDoctorEmail);
    if (!doctor) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = doctor?.id;
      const response = await fetch(`http://localhost:3010/v0/create/${doctorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }

      const json = await response.json();
      console.log('Created patient:', json);
    } catch (err) {
      console.error(err);
      setPatientError(err.message || 'Patient creation failed.');
    } finally {
      setPatientLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!selectedPatient) return;
    try {
      const response = await fetch(`http://localhost:3010/v0/deletepatient/${selectedPatient.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete patient failed:', errorText);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleDeleteDoctor = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!selectedUser) return;
    try {
      const response = await fetch(`http://localhost:3010/v0/deletedoctor/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete doctor failed:', errorText);
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
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
    mt: '3vh',
    mb: 0
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" sx={{ position: 'absolute', mt: -2, width: '51vw', ml: 0, height: '100vh' }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            marginBottom: 0
          }}
        >
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate >
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
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0 }}>
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
                sx={{ mt: '2vh', mb: 0 }}
              >
                <Typography variant="overline">Create Doctor</Typography>
              </Button>
            )}
          </Box>
          {patientError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {patientError}
            </Alert>
          )}
          <Box component="form" onSubmit={handlePatientSubmit} noValidate >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Doctor's Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setRememberDoctorEmail(e.target.value)}
              value={rememberDoctorEmail}
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setRememberPatientEmail(e.target.value)}
              value={rememberPatientEmail}
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
              onChange={(e) => setPatientPassword(e.target.value)}
              value={patientPassword}
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
              onChange={(e) => setPatientNewname(e.target.value)}
              value={patientNewname}
              sx={warningInputStyle}
              InputLabelProps={{
                sx: {
                  color: warningColor,
                  '&.Mui-focused': { color: warningColor },
                  '&.MuiFormLabel-filled': { color: warningColor },
                },
              }}
            />
            {patientLoading ? (
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
                sx={{ mt: '2vh', mb: 0 }}
              >
                <Typography variant="overline">Create Patient</Typography>
              </Button>
            )}
          </Box>
        </Box>
      </Container>
      <Container component="main" sx={{ position: 'relative', ml: '49vw', mt: '4vh', width: '51vw', height: '50vh' }} >
        <Box>
          <Box sx={{ overflow: 'auto' }}>
            {doctors.map((user) => (
              <ListItem disablePadding key={user.id}>
                <ListItemButton onClick={() => {
                  handleUserSelect(user);
                }}
                  selected={selectedUser?.id === user.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'warning.light',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'warning.dark',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'warning.dark',
                      },
                    },
                  }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }} style={{ color: 'white' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="overline" color="text.primary">
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
          <Button
            type="submit"
            role="button"
            aria-label="Login"
            fullWidth
            variant="contained"
            color="warning"
            sx={{ mt: '2vh', mb: '2vh' }}
            onClick={() => handleDeleteDoctor()}
          >
            <Typography variant="overline">{`Delete Doctor ${selectedUser?.name || ""}`}</Typography>
          </Button>
        </Box>
        <Box>
          <Box sx={{ overflow: 'auto' }}>
            {patients.map((user) => (
              <ListItem disablePadding key={user.id}>
                <ListItemButton onClick={() => {
                  handlePatientSelect(user);
                }}
                  selected={selectedPatient?.id === user.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'warning.light',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'warning.dark',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'warning.dark',
                      },
                    },
                  }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }} style={{ color: 'white' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="overline" color="text.primary">
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
          <Button
            type="submit"
            role="button"
            aria-label="Login"
            fullWidth
            variant="contained"
            color="warning"
            sx={{ mt: '2vh', mb: 0 }}
            onClick={() => handleDeletePatient()}
          >
            <Typography variant="overline">{`Delete Patient ${selectedPatient?.name || ""}`}</Typography>
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
