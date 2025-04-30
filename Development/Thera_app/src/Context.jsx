import React from 'react';
import PropTypes from 'prop-types';

export const Context = React.createContext();

export const ContextProvider = ({ children }) => {
  const [remember, setRemember] = React.useState(false);
  const [rememberEmail, setRememberEmail] = React.useState('');

  return (
    <Context.Provider value={{ remember, setRemember, rememberEmail, setRememberEmail }}>
      {children}
    </Context.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
