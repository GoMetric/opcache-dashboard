import { Button, createStyles, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import prettyBytes from 'pretty-bytes';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { connect } from 'react-redux';
import {DateTime} from 'luxon';
import resetNodeOpcache from '/actionCreators/resetNodeOpcache';

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        selectedClusterGroupNames: state.selectedClusterName
            ? Object.keys(state.apcuStatuses[state.selectedClusterName])
            : [],
        charts: state.selectedClusterName
            ? buildChartData(state.apcuStatuses[state.selectedClusterName])
            : [],
        tables: state.selectedClusterName
            ? buildTableData(state.apcuStatuses[state.selectedClusterName])
            : [],
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        resetNodeOpcache: (clusterName: string, groupName: string, host: string) => {
            dispatch(resetNodeOpcache(clusterName, groupName, host));
        }
    }
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
            height: '100%',
        },
        statusTableRoot: {
            '& .MuiTableCell-body': {
                fontSize: '0.9em',
            },
        },
        nodeButton: {
            marginBottom: theme.spacing(1)
        },
    }),
);

const buildTableData = function(clusterApcuStatuses) {
    const tables = {};

    const formatTime = function(timestamp: bigint): string {
        if (timestamp === 0) {
            return '';
        }

        let datetime = DateTime.fromSeconds(timestamp);
        return datetime.toFormat('yyyy-LL-dd hh:mm:ss');
    };

    for (let groupName in clusterApcuStatuses) {
        tables[groupName] = {};

        for (let hostName in clusterApcuStatuses[groupName]) {
            tables[groupName][hostName] = {
                memory: [
                    {
                        'label': 'Total',
                        'value': [
                            clusterApcuStatuses[groupName][hostName].SmaInfo.SegSize,
                            '(' + prettyBytes(clusterApcuStatuses[groupName][hostName].SmaInfo.SegSize) + ')'
                        ].join(' '),
                    },
                    {
                        'label': 'Free',
                        'value': [
                            clusterApcuStatuses[groupName][hostName].SmaInfo.AvailMem,
                            '(' + prettyBytes(clusterApcuStatuses[groupName][hostName].SmaInfo.AvailMem) + ')'
                        ].join(' '),
                    },
                ],
            };
        }
    }

    return tables;
};

const buildChartData = function(clusterApcuStatuses) {
    const charts = {};

    for (let groupName in clusterApcuStatuses) {
        charts[groupName] = {};

        for (let hostName in clusterApcuStatuses[groupName]) {
            charts[groupName][hostName] = {
                memory: {
                    chartData: {
                        labels: [
                            'Free',
                            'Used',
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterApcuStatuses[groupName][hostName].SmaInfo.AvailMem,
                                    clusterApcuStatuses[groupName][hostName].SmaInfo.SegSize - clusterApcuStatuses[groupName][hostName].SmaInfo.AvailMem,
                                ],
                                backgroundColor: [
                                    '#FF6384',
                                    '#36A2EB',
                                ],
                                hoverBackgroundColor: [
                                    '#FF7394',
                                    '#36B2FB',
                                ]
                            }
                        ]
                    },
                    chartOptions: {
                        tooltips: {
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return prettyBytes(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
                                }
                            }
                        }
                    }
                }
            };
        }
    }

    return charts;
};

function StatusTable(props: Object)
{
    const classes = useStyles();

    return (
        <TableContainer>
            <Table size="small" className={classes.statusTableRoot}>
                <TableBody>
                    {props.rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell>{row.label}</TableCell>
                            <TableCell>{row.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function StatusPageComponent(props: Object) {
    const classes = useStyles();

    const [currentGroupTabId, setCurrentGroupTabId] = React.useState(0);

    const handleGroupTabChange = (event: React.ChangeEvent<{}>, groupTabId: number) => {
        setCurrentGroupTabId(groupTabId);
    };

    let groupGridCollection = [];

    props.selectedClusterGroupNames.map((groupName, groupTabId) => {
        const hostGridCollection = [];

        for (let hostName in props.charts[groupName]) {
            hostGridCollection.push(
                <div key={hostName}>
                    <h2>{hostName}</h2>

                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "memory"} height="100%">
                            <Paper className={classes.paper} height="100%">
                                <h2>Memory</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].memory.chartData} 
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].memory}></StatusTable>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            );
        }

        groupGridCollection.push(
            <div hidden={currentGroupTabId !== groupTabId} key={groupName}>
                {hostGridCollection}
            </div>
        );
    });

    return (
        <div>
            <Paper square>
                <Tabs
                    value={currentGroupTabId}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleGroupTabChange}
                >
                    {props.selectedClusterGroupNames.map(groupName => <Tab key={groupName} label={groupName} />)}
                </Tabs>
            </Paper>
            {groupGridCollection}
        </div>
    );
}

const ApcuStatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageComponent);

export default ApcuStatusPage;
