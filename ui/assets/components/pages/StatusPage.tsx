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
        chartData: state.selectedClusterName
            ? buildChartData(state.opcacheStatuses[state.selectedClusterName])
            : []
    };
};

const buildChartData = function(clusterOpcacheStatuses) {
    const chartData = {};

    for (let groupName in clusterOpcacheStatuses) {
        chartData[groupName] = {};

        for (let hostName in clusterOpcacheStatuses[groupName]) {
            chartData[groupName][hostName] = {
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
                                    '#FF6384',
                                    '#36A2EB',
                                    '#FFCE56'
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

    return chartData;
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

    for (let groupName in props.chartData) {
        const hostGridCollection = [];

        for (let hostName in props.chartData[groupName]) {
            hostGridCollection.push(
                <div>
                    <h2>{hostName}</h2>
                    <Grid container spacing={1}>
                        <Grid item xs={4} key={hostName + "memory"}>
                            <Paper className={classes.paper}>
                                <h2>Memory</h2>
                                <Doughnut 
                                    data={props.chartData[groupName][hostName].memory.chartData} 
                                    options={props.chartData[groupName][hostName].memory.chartOptions} 
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={4} key={hostName + "internedStrings"}>
                            <Paper className={classes.paper}>
                                <h2>Interned strings</h2>
                                Chart
                            </Paper>
                        </Grid>
                        <Grid item xs={4} key={hostName + "keys"}>
                            <Paper className={classes.paper}>
                                <h2>Keys</h2>
                                Chart
                            </Paper>
                        </Grid>
                        <Grid item xs={4} key={hostName + "hits"}>
                            <Paper className={classes.paper}>
                                <h2>Hits</h2>
                                Chart
                            </Paper>
                        </Grid>
                        <Grid item xs={4} key={hostName + "restarts"}>
                            <Paper className={classes.paper}>
                                <h2>Restarts</h2>
                                Chart
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            );
        }

        groupGridCollection.push(
            <div>
                <h1>{groupName}</h1>
                {hostGridCollection}
            </div>
        );
    }

    return <div>{groupGridCollection}</div>;
}

const StatusPage = connect(mapStateToProps)(StatusPageComponent);

export default StatusPage;
