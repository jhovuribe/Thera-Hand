import SignIn from './SignIn.jsx';
import CreateUser from './CreateUser.jsx'
import Home from './Home.jsx';
import Admin from './Admin.jsx';
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
          <Route path="/create" element={
            <ProtectedRoute requiredRole="doctor">
              <CreateUser/>
            </ProtectedRoute>
          }/>
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
