import * as React from 'react';
import PropTypes from 'prop-types';
import {Navigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.accessToken) {
    return <Navigate to="/login" replace />;
  }
  if (location.pathname === "/create" && user.role !== "doctor") {
    return <Navigate to="/home" />;
  }
  if (location.pathname === "/admin" && user.role !== "admin") {
    return <Navigate to="/home" />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
