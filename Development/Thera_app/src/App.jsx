import SignIn from './SignIn.jsx';
import Home from './Home.jsx';
import Unauthorized from './Unauthorized.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ContextProvider } from './Context.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';

/**
 * Simple component with no state.
 *
 * @return {object} JSX
 */
function App({ router: Router = BrowserRouter }) {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }/>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
