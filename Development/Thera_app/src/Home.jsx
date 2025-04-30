import * as React from 'react';
import { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MessageIcon from '@mui/icons-material/Message';
import FrontHandIcon from '@mui/icons-material/FrontHand';
import BackHandIcon from '@mui/icons-material/BackHand';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
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
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './App.css';
// https://mui.com/material-ui/react-drawer/ RESPONSIVE DRAWER
// chatgpt.com & my brain worked together with responsive drawer
// as the base for this assignment.
import { Canvas } from "@react-three/fiber";
import { HandModel } from "./HandModel";
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { OrbitControls } from "@react-three/drei";

const drawerWidth = 273;

/**
 * @param {object} props - The props passed to the component.
 * @param {array} props.emails - Array of email objects to display
 * @return {JSX.Element} The rendered ResponsiveDrawer component.
 */

const MessageDialog = React.memo(({ open, onClose, messageContent, setMessageContent, messages, selectedUser, isDoctor, doctorName, handleSendMessage }) => (
  <Dialog fullScreen open={open} onClose={onClose}>
    <Box sx={{ position: 'fixed', bottom: 5, right: 10, zIndex: 6000 }}>
      <TextField
        fullWidth
        multiline
        maxRows={10}
        variant="outlined"
        label={
          isDoctor
            ? `Message ${selectedUser?.name || 'Patient'}`
            : `Message ${doctorName || 'Doctor'}`
        }
        color="warning"
        placeholder=""
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
    </Box>
    <AppBar sx={{ position: 'relative' }} color="warning">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
        <Typography sx={{ ml: 1, mt: 0.25, flex: 1 }} variant="overline">
          Messages
        </Typography>
      </Toolbar>
    </AppBar>
    <List>
      {messages.map((msg) => {
        const isSender = msg.sender_id === JSON.parse(localStorage.getItem('user'))?.id;
        return (
          <React.Fragment key={msg.id}>
            <ListItemText
              sx={{ ml: isSender ? 100 : 3 }}
              disableTypography
              primary={
                <>
                  <Box>
                    <Typography variant="overline" color="text.primary">
                      {isSender
                        ? `YOU AT ${new Date(msg.created_at || Date.now()).toLocaleString()}`
                        : `${(selectedUser?.name || doctorName || selectedUser?.email || 'UNKNOWN').toUpperCase()} AT ${new Date(msg.created_at || Date.now()).toLocaleString()}`
                      }
                    </Typography>

                  </Box>
                  <Box>
                    <Typography variant="overline" color="warning.main" sx={{ mt: 0.25 }}>
                      {msg.content}
                    </Typography>
                  </Box>
                </>
              }
            />
            <Divider />
          </React.Fragment>
        );
      })}
    </List>
  </Dialog>
));



function Home() {
  const [isClosed, setIsClosed] = React.useState(false);
  const history = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [startDate, setStartDate] = React.useState(new Date());

  const [selectedFinger, setSelectedFinger] = React.useState(null);

  const [selectedExercise, setSelectedExercise] = React.useState(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    history('/login');
  };

  const handleCreate = () => {
    history('/create');
  }

  const handleSelect = (finger, popupState) => {
    setSelectedFinger(finger);
    popupState.close();
  };
  const [patients, setPatients] = React.useState([]);
  const initialUser = React.useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  const [selectedUser, setSelectedUser] = React.useState(initialUser);
  const [messageContent, setMessageContent] = React.useState('');

  const handleSendMessage = async () => {
    if (!messageContent?.trim()) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const patientId = user.role === 'doctor' ? selectedUser?.id : user.id;

      const response = await fetch(`http://localhost:3010/v0/messages/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (response.ok) {
        const newMessage = {
          sender_id: user.id,
          recipient_id: user.role === 'doctor' ? selectedUser?.id : doctorName,
          content: messageContent,
          id: Date.now(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setMessageContent('');
      } else {
        const errorText = await response.text();
        console.error('Send message failed:', errorText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  useEffect(() => {
    const fetchPatients = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));

      if (!stored) {
        console.warn('No user in localStorage');
        return;
      }

      if (stored?.role !== 'doctor') {
        console.warn('Not a doctor, skipping fetch');
        return;
      }

      const response = await fetch(`http://localhost:3010/v0/home/${stored.id}`, {
        headers: {
          Authorization: `Bearer ${stored.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        const err = await response.text();
        console.error('Failed to load patients:', err);
      }
    };

    fetchPatients();
  }, []);


  const handleUserSelect = (user) => {
    setSelectedUser(user);
    console.log('Selected user:', user);
  };

  const handleSelectExercise = (exercise, popupState) => {
    setSelectedExercise(exercise);
    popupState.close();
  };
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const [openMessages, setOpenMessages] = React.useState(false);

  const handleClickOpenMessages = () => {
    setOpenMessages(true);
  };

  const handleCloseMessages = () => {
    setOpenMessages(false);
  };

  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState('');
  const [noButtons, setNoButtons] = React.useState(false);
  useEffect(() => {
    if (!isMobile) {
      setNoButtons(false);
      setMobileOpen(false);
    }
  }, [isMobile]);
  const handleClickOpen = () => {
    setOpen(true);
    setNoButtons(!noButtons);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
    setNoButtons(!noButtons);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setNoButtons(!noButtons);
  };

  const [value, setValue] = React.useState(0);
  const isDoctor = JSON.parse(localStorage.getItem('user'))?.role === 'doctor';
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function SimpleDialog(props) {
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
      onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
      onClose(value);
    };

    return (
      <Dialog onClose={handleClose} open={open}>
        {isDoctor ? (<DialogTitle sx={{ ml: 5 }}><Typography variant="overline" color="warning">SELECT A PATIENT</Typography></DialogTitle>) : null}
        <List sx={{ pt: 0 }}>
          {isDoctor ? (<>{patients.map((user) => (
            <ListItem disablePadding key={user.id}>
              <ListItemButton onClick={() => {
                handleUserSelect(user);
                handleClose();
                handleListItemClick(user.name);
              }}
                selected={selectedUser?.id === user.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'warning.light',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'warning.dark',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'warning.dark',
                    },
                  },
                }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }} style={{ color: 'white' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="overline" color="text.primary">
                      {user.email}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
            <ListItem disablePadding>
              <ListItemButton
                autoFocus
                onClick={() => handleCreate()} sx={{
                  '&:hover': {
                    backgroundColor: 'warning.light',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'warning.dark',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'warning.dark',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <AddIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="overline" color="text.primary">
                      CREATE PATIENT
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem></>) : null}
          <ListItem disablePadding>
            <ListItemButton
              autoFocus
              onClick={() => handleLogout()} sx={{
                '&:hover': {
                  backgroundColor: 'warning.light',
                },
                '&.Mui-selected': {
                  backgroundColor: 'warning.dark',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'warning.dark',
                  },
                }, mb: -0.95
              }}
            >
              <ListItemAvatar >
                <Avatar>
                  <LogoutIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText sx={{ mr: 1 }}
                primary={
                  <Typography variant="overline" color="text.primary" >
                    Logout
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>
    );
  }

  SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [messages, setMessages] = React.useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      let patientId = user.id; // default for patient

      // If the user is a doctor, use selectedUser.id as the patient
      if (user.role === 'doctor') {
        if (!selectedUser?.id) return; // no patient selected yet
        patientId = selectedUser.id;
      }

      const response = await fetch(`http://localhost:3010/v0/messages/${patientId}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        const err = await response.text();
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  const [doctorName, setDoctorName] = React.useState('');


  useEffect(() => {
    const fetchDoctorName = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'patient') return;
      const response = await fetch(`http://localhost:3010/v0/doctor/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/json',
        },
      });
      console.log("hi2");
      if (response.ok) {
        const doctor = await response.json(); // should return doctor object with .name
        setDoctorName(doctor.name);
      } else {
        console.error('Failed to fetch doctor');
      }
    };

    fetchDoctorName();
    console.log(doctorName);
  }, []);

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
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs TabIndicatorProps={{
          style: {
            backgroundColor: '#ed6c02', // warning.main default from MUI
          },
        }} value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label={
            <Box display="flex" alignItems="center" gap={0.5}>
              <AnalyticsIcon sx={{ mb: 0.25 }} />
              Analytics
            </Box>
          } sx={{
            '&.Mui-selected': {
              color: 'warning.main',
            },
          }}{...a11yProps(0)} />
          <Tab label={
            <Box display="flex" alignItems="center" gap={0.5}>
              <HistoryIcon sx={{ mb: 0.25 }} />
              History
            </Box>
          } sx={{
            '&.Mui-selected': {
              color: 'warning.main',
            },
          }}{...a11yProps(1)} />
          <Tab label={
            <Box display="flex" alignItems="center" gap={0.5}>
              <SignLanguageIcon sx={{ mb: 0.75 }} />
              Exercises
            </Box>
          } sx={{
            '&.Mui-selected': {
              color: 'warning.main',
            },
          }}{...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box sx={{ display: 'flex' }}>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button variant="contained" color="warning" {...bindTrigger(popupState)} sx={{
                  position: 'fixed', top: 119, left: 0,
                  width: `calc(${1.5025 * drawerWidth}px)`
                }}>
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
              width: `calc(${1.5025 * drawerWidth}px)`,
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
            <br />
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
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <>
          <Box sx={{
            position: 'fixed',
            minWidth: 628,
            top: 131,
            left: 120,
            zIndex: 1300
          }}>
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



          <Box
            sx={{
              width: `calc(${1.5025 * drawerWidth}px)`,
              bottom: 0,
              left: 0,
              top: 449,
              bgcolor: 'background.paper',
              position: 'fixed',
              // overflow: 'auto',
              '& ul': { padding: 0 },
            }}
            subheader={<li />}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: `calc(${1.5025 * drawerWidth}px)` }} aria-label="customized table">
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
              width: `calc(${1.5025 * drawerWidth}px)`,
              top: 199,
              height: 250,
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
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Box sx={{ display: 'flex' }}>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button variant="contained" color="warning" {...bindTrigger(popupState)} sx={{
                  position: 'fixed', top: 119, left: 0,
                  width: `calc(${1.5025 * drawerWidth}px)`
                }}>
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
          <Box
            sx={{
              width: `calc(${1.5025 * drawerWidth}px)`,
              bottom: 0,
              left: 0,
              top: 449,
              bgcolor: 'background.paper',
              position: 'fixed',
              // overflow: 'auto',
              '& ul': { padding: 0 },
            }}
            subheader={<li />}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: `calc(${1.5025 * drawerWidth}px)` }} aria-label="customized table">
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
      </CustomTabPanel>

    </div>
  );

  // Remove this const when copying and pasting into your project.

  // const c = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        color="warning"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div"
            data-testid="appbar-title" color="inherit">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography variant='overline'>
                {`THERAHAND`}
              </Typography>
              <FrontHandIcon fontSize="small" sx={{ ml: 1.5, mb: 0.5 }} />
              <BackHandIcon fontSize="small" sx={{ mb: 0.5 }} />
            </Box>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
              'display': { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth * 1.5025 },
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
              'display': { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth * 1.5025 },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Box sx={{ position: 'absolute', right: 10, left: isMobile ? 10 : 1.55 * drawerWidth, top: 85 }}>
          <Grid container spacing={2}>
            <Grid size="grow">
              <Item><Typography variant='overline'>Ring<br />1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Middle<br />1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Index<br />1000</Typography></Item>
            </Grid>
          </Grid>
          <br />
          <Grid container spacing={0} // spacing must be a number — not a string! So you can’t use calc() here
            sx={{
              '--custom-spacing': 'calc(500vw / 30)',
              gap: 'var(--custom-spacing)',
            }}>
            <Grid size="grow">
              <Item><Typography variant='overline'>Pinky<br />1000</Typography></Item>
            </Grid>
            <Grid size="grow">
              <Item><Typography variant='overline'>Thumb<br />1000</Typography></Item>
            </Grid>
          </Grid>
        </Box>
        {!openMessages && !noButtons && !mobileOpen && (
          <Button variant="contained" color="warning"
            sx={{
              position: 'fixed',
              bottom: 5,
              left: isMobile ? 10 : 1.5025 * drawerWidth + 4,
              zIndex: 2000,
            }}
            onClick={() => setIsClosed((prev) => !prev)}
          >
            {isClosed ? "Open Hand" : "Close Hand"}
          </Button>
        )}
        {!openMessages && !noButtons && (
          <Button variant="contained" color="warning"
            sx={{
              position: 'fixed',
              bottom: 5,
              right: 10,
              zIndex: 2000,
            }}
            onClick={handleClickOpenMessages}
          >
            <Typography variant="overline">Messages</Typography><MessageIcon sx={{ ml: 1 }} />
          </Button>
        )}
        <MessageDialog
          open={openMessages}
          onClose={handleCloseMessages}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
          handleSendMessage={handleSendMessage}
          messages={messages}
          selectedUser={selectedUser}
          isDoctor={isDoctor}
          doctorName={doctorName}
        />

        <IconButton variant="contained" color="warning"
          sx={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 2000,
          }} style={{ color: 'white' }}
          onClick={handleClickOpen}
        >
          <Typography variant='overline'>{selectedUser.name}</Typography><AccountCircleIcon sx={{ ml: 0.75, mb: 0.275 }} />
        </IconButton>
        <SimpleDialog
          selectedValue={selectedValue}
          open={open}
          onClose={handleClose}
        />
        {!openMessages && (
          <Box sx={{
            pointerEvents: 'none',
            position: 'absolute',
            bottom: 30,
            right: 0,
            top: 270,
            width: isMobile ? '100%' : `calc(100% - ${1.5025 * drawerWidth}px)`,
            display: 'flex',
            height: '100%',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight />
              <pointLight position={[10, 10, 10]} />
              <HandModel isClosed={isClosed} />
              <OrbitControls />
            </Canvas>
          </Box>)}

      </Box>
    </Box>
  );
}

export default Home;
