import { Box, createStyles, makeStyles, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const mapStateToProps = (state: Object) => {
    const hostConfigurations = state.selectedClusterName
        ? buildHostConfigurations(state.opcacheStatuses[state.selectedClusterName])
        : {};

    const groupNames = Object.keys(hostConfigurations);

    const props = {
        clusterGroupsHostsConfigurations: hostConfigurations,
        groupNames: groupNames,
        selectedClusterName: state.selectedClusterName,    
    };

    return props;
};

const buildHostConfigurations = (groupsStatuses: Object) => {
    let hostConfigurations = {};

    for (let groupName in groupsStatuses) {
        hostConfigurations[groupName] = {};

        for (let host in groupsStatuses[groupName]) {
            hostConfigurations[groupName][host] = groupsStatuses[groupName][host].Configuration;
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
            tableRows.push(
                <TableRow key={host+configParam}>
                    <TableCell>{configParam}</TableCell>
                    <TableCell>{"" + props.groupHostsConfigurations[host][configParam]}</TableCell>
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
            //@todo Add parameter description from https://www.php.net/manual/en/opcache.configuration.php
            hostConfigurationTable.push(
                <Grid item xs={12} sm={6} md={6} key={host}>
                    <Paper className={classes.paper}>
                        <h2>{host}</h2>
                        <Table size="small" className={classes.tableRoot}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>{tableRows}</TableBody>
                        </Table>
                    </Paper>
                </Grid>
            );
        }

        return (
            <div className={classes.root}>
                <Grid container spacing={1}>{hostConfigurationTable}</Grid>
            </div>
        );
    }
}

class ConfigurationPageComponent extends React.Component 
{
    render() {
        if (this.props.groupNames.length === 0) {
            return (<div>Loading</div>);
        }


        let groups = [];

        for (let groupName in this.props.clusterGroupsHostsConfigurations) {
            groups.push(
                <div>
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

const ConfigurationPage = connect(mapStateToProps)(ConfigurationPageComponent);

export default ConfigurationPage;
