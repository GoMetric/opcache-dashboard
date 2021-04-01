import React from 'react';
import { connect } from 'react-redux';
import MaterialTable from 'material-table';
import {DateTime} from 'luxon';
import prettyBytes from 'pretty-bytes';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dataGridRoot: {
            border: '1px solid red',
            background: 'red',
            '& .MuiTableCell-body': {
                padding: '6px 16px',
                fontSize: '0.8em',
                background: 'red',
            },
        },
    }),
);

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        scriptAggregatedStatus: state.selectedClusterName
            ? buildScriptAggregatedStatus(state.opcacheStatuses[state.selectedClusterName])
            : []
    };
};

const formatTime = function(timestamp: bigint): string {
    let datetime = DateTime.fromSeconds(timestamp);
    return datetime.toFormat('yyyy-LL-dd hh:mm:ss');
};

const buildScriptAggregatedStatus = function(clusterOpcacheStatuses): Array<Object> {
    let scriptAggregatedStatus = {};

    for (let groupName in clusterOpcacheStatuses) {
        for (let host in clusterOpcacheStatuses[groupName]) {
            if (!clusterOpcacheStatuses[groupName][host]['Scripts'] || clusterOpcacheStatuses[groupName][host]['Scripts'].length === 0) {
                continue;
            }

            let rowId = 0;
            for (let script in clusterOpcacheStatuses[groupName][host]['Scripts']) {
                let scriptStatus = clusterOpcacheStatuses[groupName][host]['Scripts'][script];
                if (!scriptAggregatedStatus.hasOwnProperty(script)) {
                    scriptAggregatedStatus[script] = {
                        id: rowId++,
                        script: script,
                        createTimestamp: scriptStatus.CreateTimestamp,
                        lastUsedTimestamp: scriptStatus.LastUsedTimestamp,
                        hits: scriptStatus.Hits,
                        memory: scriptStatus.Memory,
                    }
                } else {
                    scriptAggregatedStatus[script].createTimestamp = Math.min(
                        scriptAggregatedStatus[script].createTimestamp, 
                        scriptStatus.CreateTimestamp
                    );

                    scriptAggregatedStatus[script].lastUsedTimestamp = Math.max(
                        scriptAggregatedStatus[script].lastUsedTimestamp, 
                        scriptStatus.LastUsedTimestamp
                    );

                    scriptAggregatedStatus[script].hits += scriptStatus.Hits;
                }
            }
        }
    }

    return Object.values(scriptAggregatedStatus);
}

function ScriptsMaterialTable(props) {
    const columns = [
        {
            field: 'script',
            title: 'Script',
            sortable: true,
        },
        {
            field: 'hits',
            title: 'Hits',
            sortable: true,
            headerStyle: {
                width: "90px",
            },
            hidden: false,
            type: 'numeric',
        },
        {
            field: 'memoryHumanReadable',
            title: 'Size',
            sortable: true,
            headerStyle: {
                width: "85px",
            },
            render: (row) => {
                return prettyBytes(row.memory);
            },
            customSort: (a, b) => a.memory - b.memory,
            hidden: false,
        },
        {
            field: 'lastUsedDate',
            title: 'Last used',
            sortable: true,
            headerStyle: {
                width: "170x"
            },
            render: (row) => {
                return formatTime(row.lastUsedTimestamp);
            },
            customSort: (a, b) => a.lastUsedTimestamp - b.lastUsedTimestamp,
            hidden: false,
            type: 'datetime',
        }
    ];

    return (
        <MaterialTable
            title=""
            options={{
                search: true,
                sorting: true,
                pageSize: 100,
                pageSizeOptions: [20, 50, 100],
                rowStyle: {
                    fontSize: '0.8em',
                },
                padding: "dense",
                tableLayout: "auto"
            }}
            columns={columns}
            data={props.rows}
        ></MaterialTable>
    );
}

function ScriptsPageComponent(props: Object) {
    const classes = useStyles();

    if (props.selectedClusterName === null) {
        return <div>Loading</div>
    }

    if (props.scriptAggregatedStatus.length === 0) {
        return <div>No scripts found</div>
    }

    return <div style={{ minHeight: '400px', width: '100%' }}>
        <ScriptsMaterialTable rows={props.scriptAggregatedStatus} className={classes.dataGridRoot}></ScriptsMaterialTable>
    </div>
}

const ScriptsPage = connect(mapStateToProps)(ScriptsPageComponent);

export default ScriptsPage;
