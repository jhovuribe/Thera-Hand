import React from 'react';
import {useNavigate} from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

const Unauthorized = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <div style={{textAlign: 'center', marginTop: '50px'}}>
      <br/>
      <h1 style={{ color: theme.palette.warning.main }}>Unauthorized Access</h1>
      <h2 style={{ color: theme.palette.warning.main }}>You do not have access to this page.</h2>
      <br/>
      <Button margintop='5000px' variant="contained"
        onClick={() => navigate('/login')}
        color="warning" role="button" aria-label="backToLogin">
        Back to Login
      </Button>
    </div>
  );
};

export default Unauthorized;
