import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FrontHandIcon from '@mui/icons-material/FrontHand';
import BackHandIcon from '@mui/icons-material/BackHand';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SignLanguageIcon from '@mui/icons-material/SignLanguage';
import Grid from '@mui/material/Grid';
import { useTheme, useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// https://mui.com/material-ui/react-drawer/ RESPONSIVE DRAWER
// chatgpt.com & my brain worked together with responsive drawer
// as the base for this assignment.

const drawerWidth = 240;

/**
 * @param {object} props - The props passed to the component.
 * @param {array} props.emails - Array of email objects to display
 * @return {JSX.Element} The rendered ResponsiveDrawer component.
 */
 
 
function App() {

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [alignment, setAlignment] = React.useState('analytics');
  
  const [startDate, setStartDate] = React.useState(new Date());
  
  const [selectedFinger, setSelectedFinger] = React.useState(null);
  
  const [selectedExercise, setSelectedExercise] = React.useState(null);

  const handleSelect = (finger, popupState) => {
    setSelectedFinger(finger);
    popupState.close();
  };
  
  const handleSelectExercise = (exercise, popupState) => {
    setSelectedExercise(exercise);
    popupState.close();
  };
  
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
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


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

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
      [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.common.white,
      },
      [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
      },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      // hide last border
      '&:last-child td, &:last-child th': {
        border: 0,
      },
    }));

    function createData(finger, performance, time) {
      return { finger, performance, time };
    }

    const rows = [
      createData('Pinky', 1100, 10),
      createData('Ring', 1200, 13),
      createData('Middle', 1700, 20),
      createData('Index', 1350, 14),
      createData('Thumb', 1550, 17),
    ];


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
      <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Button variant="contained" color="warning" {...bindTrigger(popupState)} sx={{position: 'fixed', top: 112, left: 0,
            width: `calc(${1.5025*drawerWidth}px)`}}>
            <Typography variant="overline">Select a finger ...</Typography>
          </Button>
          <Menu {...bindMenu(popupState)}>
            {['Pinky', 'Ring', 'Middle', 'Index', 'Thumb'].map((finger) => (
              <MenuItem key={finger} onClick={() => handleSelect(finger, popupState)}>
                <Typography color={selectedFinger === finger ? "warning" : "lightgrey"} variant="overline">{finger}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
    <List
      sx={{
        width: `calc(${1.5025*drawerWidth}px)`,
        bottom: 0,
        left: 0,
        top: 466,
        bgcolor: 'background.paper',
        position: 'fixed',
        overflow: 'auto',
        '& ul': { padding: 0 },
      }}
      subheader={<li />}
    >
      <br/>
      {['Furthest Distance:', 'Best Time:', 'Current Threshold:', 'Exercises Completed:'].map((sectionId) => (
        <li key={`${sectionId}`}>
          <ul>
            <ListSubheader><Typography color="warning" variant="overline">{`${sectionId}`}</Typography></ListSubheader>
            {[0].map((item) => (
              <ListItem key={`item-${sectionId}-${item}`}>
                <ListItemText><Typography color="lightgrey" variant="overline">{`Item ${item}`}</Typography></ListItemText>
              </ListItem>
            ))}
          </ul>
        </li>
      ))}
    </List>
      </Box>
      ) : alignment === 'history' ? (
      <>
      <Box sx={{
        position: 'fixed',
        minWidth: 628,
        top: 131,
        left: 102,
        zIndex: 1300}}>
        <>
          <style>
            {`
              .react-datepicker {
                font-size: 0.75rem !important;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                font-weight: 500;
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
              }
            `}
          </style>

          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            customInput={
              <TextField
                variant="outlined"
                label="Start Date"
                color="warning"
                InputProps={{
                  sx: {
                    typography: 'overline',
                  },
                }}
              />
            }
          />
        </>
      </Box>
      
      
      
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: `calc(${1.5025*drawerWidth}px)`,
        //overflow: 'auto',
        '& ul': { padding: 0 },}}>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: `calc(${1.5025*drawerWidth}px)`}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Finger</StyledTableCell>
            <StyledTableCell align="right">Avg. Performance</StyledTableCell>
            <StyledTableCell align="right">Time (s)</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.finger}>
              <StyledTableCell component="th" scope="row">
                {row.finger}
              </StyledTableCell>
              <StyledTableCell align="right">{row.performance}</StyledTableCell>
              <StyledTableCell align="right">{row.time}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Box>
      
      
      
    <List
      sx={{
        width: `calc(${1.5025*drawerWidth}px)`,
        bottom: 321,
        height: 275,
        left: 0,
        bgcolor: 'background.paper',
        position: 'fixed',
        overflow: 'auto',
        '& ul': { padding: 0 },
      }}
      subheader={<li />}
    >
      {['Total Time:', 'Exercises Completed:', 'Exercises Aborted:'].map((sectionId) => (
        <li key={`${sectionId}`}>
          <ul>
            <ListSubheader><Typography color="warning" variant="overline">{`${sectionId}`}</Typography></ListSubheader>
            {[0].map((item) => (
              <ListItem key={`item-${sectionId}-${item}`}>
                <ListItemText><Typography color="lightgrey" variant="overline">{`Item ${item}`}</Typography></ListItemText>
              </ListItem>
            ))}
          </ul>
        </li>
      ))}
      </List>
      </>
      ) : alignment === 'exercises' ? (
      <Box sx={{display: 'flex'}}>
      <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Button variant="contained" color="warning" {...bindTrigger(popupState)} sx={{position: 'fixed', top: 112, left: 0,
            width: `calc(${1.5025*drawerWidth}px)`}}>
            <Typography variant="overline">Select an Exercise ...</Typography>
          </Button>
          <Menu {...bindMenu(popupState)}>
            {['Exercise 1', 'Exercise 2', 'Exercise 3', 'Exercise 4', 'Exercise 5'].map((exercise) => (
              <MenuItem key={exercise} onClick={() => handleSelectExercise(exercise, popupState)}>
                <Typography color={selectedExercise === exercise ? "warning" : "lightgrey"} variant="overline">{exercise}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
    <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: `calc(${1.5025*drawerWidth}px)`,
        //overflow: 'auto',
        '& ul': { padding: 0 },}}>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: `calc(${1.5025*drawerWidth}px)`}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Finger</StyledTableCell>
            <StyledTableCell align="right">Performance</StyledTableCell>
            <StyledTableCell align="right">Time (s)</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.finger}>
              <StyledTableCell component="th" scope="row">
                {row.finger}
              </StyledTableCell>
              <StyledTableCell align="right">{row.performance}</StyledTableCell>
              <StyledTableCell align="right">{row.time}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Box>
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
      </Box>
    </Box>
  );
}

export default App;
