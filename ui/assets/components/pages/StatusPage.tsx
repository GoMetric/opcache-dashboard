import { createStyles, makeStyles, Theme } from '@material-ui/core';
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
import {OpcacheStatusAlerts, buildAlertsDataFromOpcacheStatus} from '/components/OpcacheStatusAlerts';

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
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
                        'value': clusterOpcacheStatuses[groupName][hostName].Memory.CurrentWastedPercentage + ' of ' + clusterOpcacheStatuses[groupName][hostName].Memory.MaxWastedPercentage,
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
                        'value': clusterOpcacheStatuses[groupName][hostName].Restarts.LastRestartTime,
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
            height: '460px'
        },
        statusTableRoot: {
            '& .MuiTableCell-body': {
                fontSize: '0.9em',
            },
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

    let groupGridCollection = [];

    for (let groupName in props.charts) {
        const hostGridCollection = [];

        for (let hostName in props.charts[groupName]) {
            hostGridCollection.push(
                <div key={hostName + "hostGrid"}>
                    <h2>{hostName}</h2>

                    <OpcacheStatusAlerts alerts={props.alerts[groupName][hostName]}></OpcacheStatusAlerts>

                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "memory"}>
                            <Paper className={classes.paper}>
                                <h2>Memory</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].memory.chartData} 
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].memory}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "internedStrings"}>
                            <Paper className={classes.paper}>
                                <h2>Interned strings</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].internedStrings.chartData}
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].internedStrings}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "keys"}>
                            <Paper className={classes.paper}>
                                <h2>Keys</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keys.chartData}
                                />
                                <StatusTable rows={props.tables[groupName][hostName].keys}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "hits"}>
                            <Paper className={classes.paper}>
                                <h2>Key Hits</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keyHits.chartData} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].keyHits}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "restarts"}>
                            <Paper className={classes.paper}>
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
            <div key={groupName + "groupGrid"}>
                <h1>{groupName}</h1>
                {hostGridCollection}
            </div>
        );
    }

    return <div>{groupGridCollection}</div>;
}

const StatusPage = connect(mapStateToProps)(StatusPageComponent);

export default StatusPage;
