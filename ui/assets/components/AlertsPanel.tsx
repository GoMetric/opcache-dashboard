function AlertsPanel(props) {
    return (
        props.alerts[groupName][hostName].map((alert) => (
            <MuiAlert 
                className={classes.alert} 
                elevation={6} 
                variant="filled" 
                severity={alert.severity}
            >
                {alert.message}
            </MuiAlert>
        ));
    );
}