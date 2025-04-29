import PropTypes from 'prop-types';
import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.accessToken) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
