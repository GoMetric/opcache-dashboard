import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';
import fetchApcuStatuses from '/actionCreators/fetchApcuStatuses';

const mapStateToProps = (state: Object) => {
    let hostConfigurations;
    let groupNames;

    if (state.selectedClusterName && state.apcuStatuses) {
        hostConfigurations = buildHostConfigurations(state.apcuStatuses[state.selectedClusterName]);
        groupNames = Object.keys(hostConfigurations);
    } else {
        hostConfigurations = null;
        groupNames = [];
    }

    const props = {
        clusterGroupsHostsConfigurations: hostConfigurations,
        groupNames: groupNames,
        selectedClusterName: state.selectedClusterName,    
    };

    return props;
};

const mapDispatchToProps = dispatch => {
    return {
        fetchApcuStatus: () => {
            dispatch(fetchApcuStatuses());
        }
    }
};

const buildHostConfigurations = (groupsStatuses: Object) => {
    let hostConfigurations = {};

    for (let groupName in groupsStatuses) {
        hostConfigurations[groupName] = {};

        for (let host in groupsStatuses[groupName]) {
            hostConfigurations[groupName][host] = groupsStatuses[groupName][host].Settings;
        }
    }

    return hostConfigurations;
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        tableRoot: {
            '& .MuiTableCell-body': {
                fontSize: '0.8em',
            },
        },
    }),
);

function HostConfigurationTableComponent(props: Object) {
    let hostConfigurationTable = [];

    const classes = useStyles();

    for (let host in props.groupHostsConfigurations) {
        // build table rows
        let tableRows = [];
        for (let configParam in props.groupHostsConfigurations[host]) {
            let configGlobalValueCell = '' + props.groupHostsConfigurations[host][configParam].GlobalValue;
            let configLocalValueCell = '' + props.groupHostsConfigurations[host][configParam].LocalValue;
            let configAccessCell = '' + props.groupHostsConfigurations[host][configParam].Access;

            tableRows.push(
                <TableRow key={host+configParam} hover={true}>
                    <TableCell>
                        <span>{configParam}</span>
                    </TableCell>
                    <TableCell>{configGlobalValueCell}</TableCell>
                    <TableCell>{configLocalValueCell}</TableCell>
                    <TableCell>{configAccessCell}</TableCell>
                </TableRow>
            )
        }

        if (Object.keys(tableRows).length === 0) {
            hostConfigurationTable.push(
                <Grid item xs={6} key={host}>
                    <Paper className={classes.paper}>
                        <h2>{host}</h2>
                        Node status was not fetched
                    </Paper>
                </Grid>
            )
        } else {
            hostConfigurationTable.push(
                <Grid item xs={12} sm={12} md={6} key={host}>
                    <Paper className={classes.paper}>
                        <h2>{host}</h2>
                        <Table size="small" className={classes.tableRoot}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell>Global Value</TableCell>
                                    <TableCell>Local Value</TableCell>
                                    <TableCell>Access</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>{tableRows}</TableBody>
                        </Table>
                    </Paper>
                </Grid>
            );
        }
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={1}>{hostConfigurationTable}</Grid>
        </div>
    );
}

class ConfigurationPageComponent extends React.Component 
{
    componentDidMount() {
        if (this.props.clusterGroupsHostsConfigurations === null) {
            this.props.fetchApcuStatus();
        }
    }

    render() {
        if (this.props.groupNames.length === 0 || !this.props.clusterGroupsHostsConfigurations) {
            return (<div>Loading</div>);
        }

        let groups = [];

        for (let groupName in this.props.clusterGroupsHostsConfigurations) {
            groups.push(
                <div key={groupName}>
                    <h1>{groupName}</h1>

                    <HostConfigurationTableComponent
                        groupHostsConfigurations={this.props.clusterGroupsHostsConfigurations[groupName]}
                    />
                </div>
            );
        }
    
        return (
            <div>{groups}</div>
        );
    }
}

const ApcuConfigurationPage = connect(mapStateToProps, mapDispatchToProps)(ConfigurationPageComponent);

export default ApcuConfigurationPage;
