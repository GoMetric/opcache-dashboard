import React from 'react';
import { connect } from 'react-redux';
import { DataGrid, ValueGetterParams } from '@material-ui/data-grid';
import {DateTime} from 'luxon';
import prettyBytes from 'pretty-bytes';
import { Paper } from '@material-ui/core';

const mapStateToProps = (state: Object) => {
    return {
        selectedClusterName: state.selectedClusterName,
        scriptAggregatedStatus: state.selectedClusterName
            ? buildScriptAggregatedStatus(state.opcacheStatuses[state.selectedClusterName])
            : []
    };
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
                        scriptStatus.lastUsedTimestamp
                    );

                    scriptAggregatedStatus[script].hits += scriptStatus.hits;
                }
            }
        }
    }

    return Object.values(scriptAggregatedStatus);
}

function ScriptsPageComponent(props: Object) {
    if (props.selectedClusterName === null) {
        return <div>Loading</div>
    }

    if (props.scriptAggregatedStatus.length === 0) {
        return <div>No scripts found</div>
    }

    let formatTime = function(timestamp: bigint): string {
        let datetime = DateTime.fromSeconds(timestamp);
        return datetime.toFormat('yyyy-LL-dd hh:mm:ss');
    };

    let columns = [
        {
            field: 'script',
            headerName: 'Script',
            sortable: true,
            flex: 1,
        },
        {
            field: 'hits',
            headerName: 'Hits',
            sortable: true,
            width: 100,
        },
        {
            field: 'memoryHumanReadable',
            headerName: 'Memory',
            sortable: true,
            width: 105,
            valueGetter: (params: ValueGetterParams) => {
                return prettyBytes(params.getValue('memory'));
            },
        },
        {
            field: 'lastUsedDate',
            headerName: 'Last used',
            sortable: true,
            width: 170,
            valueGetter: (params: ValueGetterParams) => {
                return formatTime(params.getValue('lastUsedTimestamp'));
            },
        },
        {
            field: 'createDate',
            headerName: 'Created',
            sortable: true,
            width: 170,
            valueGetter: (params: ValueGetterParams) => {
                return formatTime(params.getValue('createTimestamp'));
            },
        },
    ];
    
    let rows = props.scriptAggregatedStatus;

    return <div style={{ minHeight: '400px', width: '100%' }}>
        <Paper>
            <DataGrid rows={rows} columns={columns} autoHeight="true" autoPageSize="true" density="compact"></DataGrid>
        </Paper>
    </div>
}

const ScriptsPage = connect(mapStateToProps)(ScriptsPageComponent);

export default ScriptsPage;
