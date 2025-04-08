import React from 'react';
import {createContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import emailS from './data/emails.json';

export const EmailContext = createContext();

export const EmailProvider = ({children, window}) => {
  const [emails, setEmails] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState('Inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    setEmails(emailS);
  }, []);

  return (
    <EmailContext.Provider value={{emails, setEmails, selectedMailbox,
      setSelectedMailbox, selectedEmail, setSelectedEmail, window}}>
      {children}
    </EmailContext.Provider>
  );
};

EmailProvider.propTypes = {
  window: PropTypes.func,
  children: PropTypes.node.isRequired,
};
