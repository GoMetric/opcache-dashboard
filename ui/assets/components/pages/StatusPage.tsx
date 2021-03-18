import { createStyles, makeStyles, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { Doughnut } from 'react-chartjs-2';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import prettyBytes from 'pretty-bytes';

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        charts: state.selectedClusterName
            ? buildChartData(state.opcacheStatuses[state.selectedClusterName])
            : []
    };
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
                            'Wasted'
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
    }),
);

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
                        <Grid item xs={12} sm={6} md={4} key={hostName + "memory"}>
                            <Paper className={classes.paper}>
                                <h2>Memory</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].memory.chartData} 
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "internedStrings"}>
                            <Paper className={classes.paper}>
                                <h2>Interned strings</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].internedStrings.chartData}
                                    options={props.charts[groupName][hostName].memory.chartOptions} 
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "keys"}>
                            <Paper className={classes.paper}>
                                <h2>Keys</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keys.chartData}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "hits"}>
                            <Paper className={classes.paper}>
                                <h2>Key Hits</h2>
                                <Doughnut 
                                    data={props.charts[groupName][hostName].keyHits.chartData} 
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} key={hostName + "restarts"}>
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
