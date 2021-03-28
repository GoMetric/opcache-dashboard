import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        alert: {
            width: '100%',
            marginBottom: theme.spacing(2),
        }
    }),
);

function AlertsPanel(props) {
    const classes = useStyles();

    return (
        props.alerts.map((alert) => (
            <MuiAlert 
                className={classes.alert} 
                elevation={6} 
                variant="filled" 
                severity={alert.severity}
            >
                {alert.message}
            </MuiAlert>
        ))
    );
}

export default AlertsPanel;