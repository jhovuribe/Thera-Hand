import * as React from 'react';
import {useContext} from 'react';
import {EmailContext} from './EmailContext.jsx';
import {format, isToday, subMonths, isAfter} from 'date-fns';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import FrontHandIcon from '@mui/icons-material/FrontHand';
import BackHandIcon from '@mui/icons-material/BackHand';
import {
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


// https://mui.com/material-ui/react-drawer/ RESPONSIVE DRAWER
// chatgpt.com & my brain worked together with responsive drawer
// as the base for this assignment.

const drawerWidth = 240;

/**
 * @param {object} props - The props passed to the component.
 * @param {function} props.window - Function to return the window object.
 * @param {array} props.emails - Array of email objects to display
 * @return {JSX.Element} The rendered ResponsiveDrawer component.
 */
function ResponsiveDrawer() {
  const {emails, selectedMailbox, setSelectedMailbox,
    selectedEmail, setSelectedEmail, window} = useContext(EmailContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  /* const [isClosing, setIsClosing] = React.useState(false); */
  const isMobile = (window().innerWidth < 600);

  const handleDrawerClose = () => {
    /* setIsClosing(true); */
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setSelectedEmail(null);
  };

  /*
  const handleTitleToggle = () => {
    if (mobileOpen) setMobileOpen(!mobileOpen);
    setSelectedEmail(null);
  };
  */

  const handleInboxClick = () => {
    setSelectedEmail(null);
    setSelectedMailbox('Inbox');
    if (isMobile) {
      handleDrawerClose(); // Close the drawer on mobile
    }
  };

  const handleTrashClick = () => {
    setSelectedEmail(null);
    setSelectedMailbox('Trash');
    if (isMobile) {
      handleDrawerClose(); // Close the drawer on mobile
    }
  };

  const filterEmails = (emails) => {
    return emails.filter((email) => {
      return email.mailbox.toLowerCase() === selectedMailbox.toLowerCase();
    });
  };

  const sortEmails = (emails) => {
    return emails.sort((a, b) => new Date(b.received) -new Date(a.received));
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    const twelveMonthsAgo = subMonths(new Date('2024-01-01T00:00:00'), 12);
    if (isToday(parsedDate)) {
      const hours = parsedDate.getHours().toString().padStart(2, '0');
      const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (isAfter(parsedDate, twelveMonthsAgo)) {
      return format(parsedDate, 'MMM dd');
    } else {
      return format(parsedDate, 'yyyy');
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleEmailClose = () => {
    setSelectedEmail(null);
  };

  /*
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') handleEmailClose();
  });
  */


  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem key={'Inbox'} disablePadding>
          <ListItemButton onClick={handleInboxClick}
            aria-label = "Inbox" data-testid="inbox-button">
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            Inbox
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem key={'Trash'} disablePadding>
          <ListItemButton onClick={handleTrashClick}
            aria-label = "Trash" data-testid="trash-button">
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            Trash
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  // Remove this const when copying and pasting into your project.

  // const c = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />
      {!isMobile || !selectedEmail ? (
      <AppBar
        position="fixed"
        sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}
        color="warning"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{mr: 2, display: {sm: 'none'}}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div"
            data-testid="appbar-title" color="inherit">
            <IconButton aria-label="title toggle"
              /* onClick={handleTitleToggle} */ sx={{color: 'inherit'}}>
              {!isMobile || !mobileOpen ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Typography variant='overline'>
                    {`THERAHAND - ${selectedMailbox}`}
                  </Typography>
                  <FrontHandIcon fontSize="small" sx={{ ml: 1, mb: 0.5}}/>
                  <BackHandIcon fontSize="small" sx={{mb: 0.5}}/>
                </Box>
              ) : (
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Typography variant='overline'>
                    {`THERAHAND`}
                  </Typography>
                  <FrontHandIcon fontSize="small" sx={{ ml: 1, mb: 0.5 }}/>
                  <BackHandIcon fontSize="small" sx={{mb: 0.5}}/>
                </Box>
              )}
            </IconButton>
          </Typography>
        </Toolbar>
      </AppBar>
      ) : null}
      <Box
        component="nav"
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
        aria-label="mailbox folders"
      >
        {isMobile ? (
        <Drawer
          // container={c}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            'display': {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
        >
          {drawer}
        </Drawer>
        ) : (
        <Drawer
          variant="permanent"
          sx={{
            'display': {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
          open
        >
          {drawer}
        </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{flexGrow: 1, p: 3, width: {sm: `calc(100% - ${drawerWidth}px)`}}}
      >
        <Toolbar />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortEmails(filterEmails(emails)).map((email) => (
                <TableRow key={email.id} onClick={() => handleEmailClick(email)}
                  style={{cursor: 'pointer'}} role="button"
                  aria-label={`${email.from.name} ${email.subject}`}>
                  <TableCell>{email.from.name}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>{formatDate(email.received)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Slide direction="up" in={!!selectedEmail} mountOnEnter unmountOnExit>
          <Box sx={{position: 'fixed', bottom: 0, right: 0,
            width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
            height: isMobile ? '100%' : '50%',
            bgcolor: 'background.paper', boxShadow: 24}}>
            {selectedEmail && (
              <>
                <AppBar position="static">
                  <Toolbar>
                    <Typography variant="h6" component="div"
                      sx={{flexGrow: 1}} data-testid="email-subject">
                      {selectedEmail.subject}
                    </Typography>
                    <IconButton edge="end"
                      color="inherit" onClick={handleEmailClose}
                      role="button"
                      aria-label= {isMobile ? 'close mobile reader' :
                      'close desktop reader'}
                      style={{display: 'block'}}>
                      <CloseIcon />
                    </IconButton>
                  </Toolbar>
                </AppBar>
                <Box p={2}>
                  <Typography variant="body1">
                    From: {selectedEmail.from.name} (
                    {selectedEmail.from.address})
                  </Typography>
                  <Typography variant="body1">
                    To: {selectedEmail.to.name} ({selectedEmail.to.address})
                  </Typography>
                  <Typography variant="body1">
                    Subject: {selectedEmail.subject}
                  </Typography>
                  <Typography variant="body1">
                    Received: {formatDate(selectedEmail.received)}
                  </Typography>
                  <Divider sx={{my: 2}} />
                  <Typography variant="body2">
                    {selectedEmail.content}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Slide>
      </Box>
    </Box>
  );
}

export default ResponsiveDrawer;
