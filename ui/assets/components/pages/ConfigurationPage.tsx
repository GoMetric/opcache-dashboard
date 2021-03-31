import { createStyles, makeStyles, Zoom } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';
import { opcacheConfigDescriptionMap } from '/dataProviders/OpcacheConfigDescription';
import OptimizationPopover from '/components/OptimizationPopover';

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
            let configValueCell;

            if (configParam === "opcache.optimization_level") {
                configValueCell = <OptimizationPopover level={props.groupHostsConfigurations[host][configParam]}></OptimizationPopover>
            } else {
                configValueCell = '' + props.groupHostsConfigurations[host][configParam];
            }

            tableRows.push(
                <TableRow key={host+configParam} hover={true}>
                    <TableCell>
                        <Tooltip 
                            title={opcacheConfigDescriptionMap[configParam] || ''} 
                            interactive 
                            arrow
                            TransitionComponent={Zoom}
                            placement="right-end"
                        >
                            <span>{configParam}</span>
                        </Tooltip>
                    </TableCell>
                    <TableCell>{configValueCell}</TableCell>
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
                <Grid item xs={12} sm={12} md={6} key={host}>
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
    }

    return (
        <div className={classes.root}>
            <Grid container spacing={1}>{hostConfigurationTable}</Grid>
        </div>
    );
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

const ConfigurationPage = connect(mapStateToProps)(ConfigurationPageComponent);

export default ConfigurationPage;
