import { createStyles, makeStyles } from '@material-ui/core';
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

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        charts: state.selectedClusterName
            ? buildChartData(state.opcacheStatuses[state.selectedClusterName])
            : [],
        tables: state.selectedClusterName
            ? buildTableData(state.opcacheStatuses[state.selectedClusterName])
            : []
    };
};

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
                        'label': 'Max Wasted Percentage',
                        'value': clusterOpcacheStatuses[groupName][hostName].Memory.MaxWastedPercentage,
                    },
                    {
                        'label': 'Current Waster Percentage',
                        'value': clusterOpcacheStatuses[groupName][hostName].Memory.CurrentWasterPercentage,
                    }
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
                        <TableRow>
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
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4} lg={3} key={hostName + "memory"}>
                            <Paper className={classes.paper}>
                                <h2>Memory</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].memory.chartData} 
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].memory}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3} key={hostName + "internedStrings"}>
                            <Paper className={classes.paper}>
                                <h2>Interned strings</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].internedStrings.chartData}
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                                <StatusTable rows={props.tables[groupName][hostName].internedStrings}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3} key={hostName + "keys"}>
                            <Paper className={classes.paper}>
                                <h2>Keys</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keys.chartData}
                                />
                                <StatusTable rows={props.tables[groupName][hostName].keys}></StatusTable>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3} key={hostName + "hits"}>
                            <Paper className={classes.paper}>
                                <h2>Key Hits</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keyHits.chartData} 
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3} key={hostName + "restarts"}>
                            <Paper className={classes.paper}>
                                <h2>Restarts</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].restarts.chartData} 
                                />
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
