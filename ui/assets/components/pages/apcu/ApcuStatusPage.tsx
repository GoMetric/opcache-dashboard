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
import {OpcacheStatusAlerts, buildAlertsDataFromOpcacheStatus} from '/components/OpcacheStatusAlerts';
import DeleteIcon from '@material-ui/icons/Delete';
import resetNodeOpcache from '/actionCreators/resetNodeOpcache';

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        selectedClusterGroupNames: state.selectedClusterName
            ? Object.keys(state.opcacheStatuses[state.selectedClusterName])
            : [],
        charts: state.selectedClusterName
            ? buildChartData(state.opcacheStatuses[state.selectedClusterName])
            : [],
        tables: state.selectedClusterName
            ? buildTableData(state.opcacheStatuses[state.selectedClusterName])
            : [],
        alerts: state.selectedClusterName
            ? buildAlertsData(state.opcacheStatuses[state.selectedClusterName])
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

const buildAlertsData = function(clusterOpcacheStatuses) {
    const alerts = {};

    for (let groupName in clusterOpcacheStatuses) {
        alerts[groupName] = {};

        for (let hostName in clusterOpcacheStatuses[groupName]) {
            alerts[groupName][hostName] = buildAlertsDataFromOpcacheStatus(clusterOpcacheStatuses[groupName][hostName]);
        }
    }

    return alerts;
}

const buildTableData = function(clusterOpcacheStatuses) {
    const tables = {};

    const formatTime = function(timestamp: bigint): string {
        if (timestamp === 0) {
            return '';
        }

        let datetime = DateTime.fromSeconds(timestamp);
        return datetime.toFormat('yyyy-LL-dd hh:mm:ss');
    };

    for (let groupName in clusterOpcacheStatuses) {
        tables[groupName] = {};

        for (let hostName in clusterOpcacheStatuses[groupName]) {
            tables[groupName][hostName] = {
                memory: [
                    {
                        'label': 'Total',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].Memory.Total,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].Memory.Total) + ')'
                        ].join(' '),
                    },
                    {
                        'label': 'Free',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].Memory.Free,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].Memory.Free) + ')'
                        ].join(' '),
                    },
                    {
                        'label': 'Used',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].Memory.Used,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].Memory.Used) + ')'
                        ].join(' ')
                    },
                    {
                        'label': 'Wasted',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].Memory.Wasted,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].Memory.Wasted) + ')'
                        ].join(' '),
                    },
                    {
                        'label': 'Wasted Percent',
                        'value': clusterOpcacheStatuses[groupName][hostName].Memory.CurrentWastedPercentage + ' of ' + (clusterOpcacheStatuses[groupName][hostName].Memory.MaxWastedPercentage * 100),
                    },
                ],
                internedStrings: [
                    {
                        'label': 'Used Memory',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.UsedMemory,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.UsedMemory) + ')'
                        ].join(' '),
                    },
                    {
                        'label': 'Free Memory',
                        'value': [
                            clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.FreeMemory,
                            '(' + prettyBytes(clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.FreeMemory) + ')'
                        ].join(' '),
                    },
                ],
                keys: [
                    {
                        'label': 'Total',
                        'value': clusterOpcacheStatuses[groupName][hostName].Keys.TotalPrime,
                    },
                    {
                        'label': 'Used keys',
                        'value': clusterOpcacheStatuses[groupName][hostName].Keys.UsedKeys,
                    },
                    {
                        'label': 'Used scripts',
                        'value': clusterOpcacheStatuses[groupName][hostName].Keys.UsedScripts,
                    },
                    {
                        'label': 'Free',
                        'value': clusterOpcacheStatuses[groupName][hostName].Keys.Free,
                    },
                ],
                keyHits: [
                    {
                        'label': 'Hits',
                        'value': clusterOpcacheStatuses[groupName][hostName].KeyHits.Hits,
                    },
                    {
                        'label': 'Misses',
                        'value': clusterOpcacheStatuses[groupName][hostName].KeyHits.Misses,
                    },
                ],
                restarts: [
                    {
                        'label': 'Out of memory count',
                        'value': clusterOpcacheStatuses[groupName][hostName].Restarts.OutOfMemoryCount,
                    },
                    {
                        'label': 'Hash count',
                        'value': clusterOpcacheStatuses[groupName][hostName].Restarts.HashCount,
                    },
                    {
                        'label': 'Manual count',
                        'value': clusterOpcacheStatuses[groupName][hostName].Restarts.ManualCount,
                    },
                    {
                        'label': 'Last restart time',
                        'value': formatTime(clusterOpcacheStatuses[groupName][hostName].Restarts.LastRestartTime),
                    },
                ],
            };
        }
    }

    return tables;
};

const buildChartData = function(clusterOpcacheStatuses) {
    const charts = {};

    for (let groupName in clusterOpcacheStatuses) {
        charts[groupName] = {};

        for (let hostName in clusterOpcacheStatuses[groupName]) {
            charts[groupName][hostName] = {
                memory: {
                    chartData: {
                        labels: [
                            'Free',
                            'Used',
                            'Wasted',
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterOpcacheStatuses[groupName][hostName].Memory.Free,
                                    clusterOpcacheStatuses[groupName][hostName].Memory.Used,
                                    clusterOpcacheStatuses[groupName][hostName].Memory.Wasted,
                                ],
                                backgroundColor: [
                                    '#FF6384',
                                    '#36A2EB',
                                    '#FFCE56'
                                ],
                                hoverBackgroundColor: [
                                    '#FF7394',
                                    '#36B2FB',
                                    '#FFDE66'
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
                },
                internedStrings: {
                    chartData: {
                        labels: [
                            'Used',
                            'Free',
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.UsedMemory,
                                    clusterOpcacheStatuses[groupName][hostName].InternedStingsMemory.FreeMemory,
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
                },
                keys: {
                    chartData: {
                        labels: [
                            'Used',
                            'Free',
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterOpcacheStatuses[groupName][hostName].Keys.UsedKeys,
                                    clusterOpcacheStatuses[groupName][hostName].Keys.Free,
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
                    }
                },
                keyHits: {
                    chartData: {
                        labels: [
                            'Hits',
                            'Misses',
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterOpcacheStatuses[groupName][hostName].KeyHits.Hits,
                                    clusterOpcacheStatuses[groupName][hostName].KeyHits.Misses,
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
                    }
                },
                restarts: {
                    chartData: {
                        labels: [
                            'Hash',
                            'Manual',
                            'OutOfMemory'
                        ],
                        datasets: [
                            {
                                data: [
                                    clusterOpcacheStatuses[groupName][hostName].Restarts.HashCount,
                                    clusterOpcacheStatuses[groupName][hostName].Restarts.ManualCount,
                                    clusterOpcacheStatuses[groupName][hostName].Restarts.OutOfMemoryCount,
                                ],
                                backgroundColor: [
                                    '#FF6384',
                                    '#36A2EB',
                                    '#FFCE56'
                                ],
                                hoverBackgroundColor: [
                                    '#FF7394',
                                    '#36B2FB',
                                    '#FFDE66'
                                ]
                            }
                        ]
                    }
                },
            };
        }
    }

    return charts;
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

    const onResetNodeOpcacheClick = function(e) {
        props.resetNodeOpcache(
            props.selectedClusterName,
            e.currentTarget.getAttribute('data-groupname'),
            e.currentTarget.getAttribute('data-host')
        );
    };

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

                    <Button 
                        className={classes.nodeButton} 
                        variant="contained" 
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={onResetNodeOpcacheClick}
                        data-groupname={groupName}
                        data-host={hostName}
                    >
                        Reset
                    </Button>

                    <OpcacheStatusAlerts alerts={props.alerts[groupName][hostName]}></OpcacheStatusAlerts>

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
                        <Grid item xs={12} sm={6} md={4} key={hostName + "internedStrings"} height="100%">
                            <Paper className={classes.paper} height="100%">
                                <h2>Interned strings</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].internedStrings.chartData}
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].internedStrings}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "keys"} height="100%">
                            <Paper className={classes.paper} height="100%">
                                <h2>Keys</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keys.chartData}
                                />
                                <StatusTable rows={props.tables[groupName][hostName].keys}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "hits"} height="100%">
                            <Paper className={classes.paper} height="100%">
                                <h2>Key Hits</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keyHits.chartData} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].keyHits}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "restarts"} height="100%">
                            <Paper className={classes.paper} height="100%">
                                <h2>Restarts</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].restarts.chartData} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].restarts}></StatusTable>
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
