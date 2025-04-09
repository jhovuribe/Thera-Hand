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
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import FrontHandIcon from '@mui/icons-material/FrontHand';
import BackHandIcon from '@mui/icons-material/BackHand';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SignLanguageIcon from '@mui/icons-material/SignLanguage';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useTheme, useMediaQuery } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// https://mui.com/material-ui/react-drawer/ RESPONSIVE DRAWER
// chatgpt.com & my brain worked together with responsive drawer
// as the base for this assignment.

const drawerWidth = 240;

/**
 * @param {object} props - The props passed to the component.
 * @param {array} props.emails - Array of email objects to display
 * @return {JSX.Element} The rendered ResponsiveDrawer component.
 */
 
 
function ResponsiveDrawer() {
  const {selectedEmail, setSelectedEmail} = useContext(EmailContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  /* const [isClosing, setIsClosing] = React.useState(false); */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [alignment, setAlignment] = React.useState('analytics');
  
  const handleAnalytics = () => {
    setAlignment('analytics');
  };
  
  const handleHistory = () => {
    setAlignment('history');
  };
  
  const handleExercises = () => {
    setAlignment('exercises');
  };
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

  const Item = styled(Paper)(({ theme }) => ({
      backgroundColor: '#fff',
      ...theme.typography.body2,
      padding: theme.spacing(1),
      textAlign: 'center',
      color: (theme.vars ?? theme).palette.text.secondary,
      ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
      }),
  }));

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
      <ToggleButtonGroup color = "warning" value={alignment}
      aria-label="Platform" >
        <Typography color='warning'>
        <ToggleButton value="analytics" onClick={handleAnalytics} color='warning'>
           <Typography color={alignment === 'analytics' ? 'warning' : 'white'} variant="overline" sx={{ml: 0.2 }}>
             {`Analytics`}
             <AnalyticsIcon sx={{mb: -0.9 }}/>
           </Typography>
        </ToggleButton>
        </Typography>
        <ToggleButton value="history" onClick={handleHistory}>
           <Typography color={alignment === 'history' ? 'warning' : 'white'} variant="overline" sx={{ml: 0.2 }}>
              {`History`}
              <HistoryIcon sx={{mb: -0.9 }}/>
           </Typography>
        </ToggleButton>
        <ToggleButton value="exercises" onClick={handleExercises}>
           <Typography color={alignment === 'exercises' ? 'warning' : 'white'} variant="overline" sx={{ml: 0.2 }}>
              {`Exercises`}
              <SignLanguageIcon sx={{mb: -0.9 }}/>
           </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
      {alignment === 'analytics' ? (
      <Box sx={{display: 'flex'}}>
      analytics
      </Box>
      ) : alignment === 'history' ? (
      <Box sx={{display: 'flex'}}>
        <DatePicker />
      </Box>
      ) : alignment === 'exercises' ? (
      <Box sx={{display: 'flex'}}>
      exercises
      </Box>
      ) : null }
    </div>
  );

  // Remove this const when copying and pasting into your project.

  // const c = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />
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
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography variant='overline'>
                {`THERAHAND`}
              </Typography>
              <FrontHandIcon fontSize="small" sx={{ ml: 1.5, mb: 0.5 }}/>
              <BackHandIcon fontSize="small" sx={{mb: 0.5}}/>
            </Box>
          </Typography>
        </Toolbar>
      </AppBar>
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
          PaperProps={{
            sx: {
              backgroundColor: "lightgrey",
              color: "black",
            }
          }}
          sx={{
            'display': {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth*1.5025},
          }}
        >
          {drawer}
        </Drawer>
        ) : (
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              backgroundColor: "lightgrey",
              color: "black",
            }
          }}
          sx={{
            'display': {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth*1.5025},
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
        <Box sx={{position: 'absolute', right: 10, left: isMobile ? 10 : 1.55 * drawerWidth, top: 85}}>
          <Grid container spacing={2}>
            <Grid size="grow">
              <Item><Typography variant='overline'>Ring<br/>1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Middle<br/>1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Index<br/>1000</Typography></Item>
            </Grid>
          </Grid>
          <br/>
          <Grid container   spacing={0} // spacing must be a number — not a string! So you can’t use calc() here
  sx={{
    '--custom-spacing': 'calc(500vw / 30)',
    gap: 'var(--custom-spacing)',
  }}>
            <Grid size="grow">
              <Item><Typography variant='overline'>Pinky<br/>1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Thumb<br/>1000</Typography></Item>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 15,
            top: 250,
            width: isMobile ? '100%' : `calc(100% - ${1.5025 * drawerWidth}px)`,
            height: '65%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <FrontHandIcon sx={{ width: '100%', height: '100%' }} />
        </Box>
        {/*
        <TableContainer component={Paper}>
          <Table sx={{position: 'absolute', bottom: 0, right: 0, width: {sm: `calc(100% - ${1.5025*drawerWidth}px)`}}}>
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
        */}
        <Slide direction="up" in={!!selectedEmail} mountOnEnter unmountOnExit>
          <Box sx={{position: 'fixed', bottom: 0, right: 0,
            width: isMobile ? '100%' : `calc(100% - ${1.5025*drawerWidth}px)`,
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
