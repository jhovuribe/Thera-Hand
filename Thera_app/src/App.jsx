import React from 'react';
import './App.css';
import loader from './data/loader';
import emails from './data/emails.json';
import ResponsiveDrawer from './ResponsiveDrawer.jsx';
import {EmailProvider} from './EmailContext.jsx';

loader(); // do not remove this!

/**
 * Simple component with no state.
 *
 * See the basic-react from lecture for an example of adding and
 * reacting to changes in state.
 *
 * @return {object} JSX
 */
function App() {
  return (
    <EmailProvider window={() => window}>
      <ResponsiveDrawer emails={emails} />
    </EmailProvider>
  );
}

export default App;
