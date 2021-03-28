import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import ScriptsPage from '/components/pages/ScriptsPage'
import StatusPage from '/components/pages/StatusPage'
import NotFoundPage from '/components/pages/NotFoundPage'
import ClusterSelect from '/components/ClusterSelect';
import RefreshButton from '/components/RefreshButton';
import ConfigurationPage from './pages/ConfigurationPage';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
}));


export default function Layout() {
    const classes = useStyles();

    const layoutDrawerOpenStateLocalstorageKey = 'layoutDrawerOpen';

    const [openDraver, setOpenDrawer] = React.useState(localStorage.getItem(layoutDrawerOpenStateLocalstorageKey) === "true");

    const handleDrawerOpen = () => {
        localStorage.setItem(layoutDrawerOpenStateLocalstorageKey, "true");
        setOpenDrawer(true);
    };

    const handleDrawerClose = () => {
        localStorage.setItem(layoutDrawerOpenStateLocalstorageKey, "false");
        setOpenDrawer(false);
    };

    return (
        <Router>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="absolute" className={clsx(classes.appBar, openDraver && classes.appBarShift)}>
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            className={clsx(classes.menuButton, openDraver && classes.menuButtonHidden)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                            Dashboard
                        </Typography>
                        <RefreshButton />
                        <ClusterSelect />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(classes.drawerPaper, !openDraver && classes.drawerPaperClose),
                    }}
                    open={openDraver}
                >
                    <div className={classes.toolbarIcon}>
                        <IconButton onClick={handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <div>
                            <ListItem button component={Link} to="/status">
                                <ListItemIcon>
                                    <EqualizerIcon />
                                </ListItemIcon>
                                <ListItemText primary="Status" />
                            </ListItem>
                            <ListItem button component={Link} to="/configuration">
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Configuration" />
                            </ListItem>
                            <ListItem button component={Link} to="/scripts">
                                <ListItemIcon>
                                    <ListIcon />
                                </ListItemIcon>
                                <ListItemText primary="Scripts" />
                            </ListItem>
                        </div>
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.appBarSpacer} />
                    <Container maxWidth={false} className={classes.container}>
                        <Switch>
                            <Route exact path="/">
                                <Redirect to="status" />
                            </Route>
                            <Route exact path="/status">
                                <StatusPage />
                            </Route>
                            <Route exact path="/configuration">
                                <ConfigurationPage />
                            </Route>
                            <Route exact path="/scripts">
                                <ScriptsPage />
                            </Route>
                            <Route>
                                <NotFoundPage />
                            </Route>
                        </Switch>
                    </Container>
                </main>
            </div>
        </Router>
    );
}