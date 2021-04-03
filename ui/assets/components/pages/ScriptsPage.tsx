import React from 'react';
import { connect } from 'react-redux';
import MaterialTable from 'material-table';
import {DateTime} from 'luxon';
import prettyBytes from 'pretty-bytes';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { Tab, Tabs } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dataGridRoot: {
            '& .MuiTableCell-body': {
                padding: '6px 16px',
                fontSize: '0.8em',
                background: 'red',
            },
        },
        tabs: {
            marginBottom: '20px',
        }
    }),
);

const mapStateToProps = (state: Object) => {
    let groupScriptAggregatedStatus = null;
    let allScriptAggregatedStatus = null;

    if (state.selectedClusterName) {
        [allScriptAggregatedStatus, groupScriptAggregatedStatus] = buildScriptAggregatedStatus(
            state.opcacheStatuses[state.selectedClusterName]
        )
    }

    return {
        selectedClusterName: state.selectedClusterName,
        selectedClusterGroupNames: state.selectedClusterName
            ? Object.keys(state.opcacheStatuses[state.selectedClusterName])
            : [],
        allScriptAggregatedStatus: allScriptAggregatedStatus, 
        groupScriptAggregatedStatus: groupScriptAggregatedStatus,
    };
};

const formatTime = function(timestamp: bigint): string {
    const datetime = DateTime.fromSeconds(timestamp);
    return datetime.toFormat('yyyy-LL-dd hh:mm:ss');
};

const buildScriptAggregatedStatus = function(clusterOpcacheStatuses): Array<Object> {
    const groupScriptAggregatedStatus = {};
    const allScriptAggregatedStatus = {};

    for (const groupName in clusterOpcacheStatuses) {
        for (const host in clusterOpcacheStatuses[groupName]) {
            if (!clusterOpcacheStatuses[groupName][host]['Scripts'] || clusterOpcacheStatuses[groupName][host]['Scripts'].length === 0) {
                continue;
            }

            groupScriptAggregatedStatus[groupName] = {};

            for (const script in clusterOpcacheStatuses[groupName][host]['Scripts']) {
                const scriptStatus = clusterOpcacheStatuses[groupName][host]['Scripts'][script];
                
                if (!(script in groupScriptAggregatedStatus[groupName])) {
                    groupScriptAggregatedStatus[groupName][script] = {
                        script: script,
                        createTimestamp: scriptStatus.CreateTimestamp,
                        lastUsedTimestamp: scriptStatus.LastUsedTimestamp,
                        hits: scriptStatus.Hits,
                        memory: scriptStatus.Memory,
                    }
                } else {
                    groupScriptAggregatedStatus[groupName][script].createTimestamp = Math.min(
                        groupScriptAggregatedStatus[script].createTimestamp, 
                        scriptStatus.CreateTimestamp
                    );
    
                    groupScriptAggregatedStatus[groupName][script].lastUsedTimestamp = Math.max(
                        groupScriptAggregatedStatus[script].lastUsedTimestamp, 
                        scriptStatus.LastUsedTimestamp
                    );
    
                    groupScriptAggregatedStatus[groupName][script].hits += scriptStatus.Hits;
                }

                if (!(script in allScriptAggregatedStatus)) {
                    allScriptAggregatedStatus[script] = {
                        script: script,
                        createTimestamp: scriptStatus.CreateTimestamp,
                        lastUsedTimestamp: scriptStatus.LastUsedTimestamp,
                        hits: scriptStatus.Hits,
                        memory: scriptStatus.Memory,
                    }
                } else {
                    allScriptAggregatedStatus[script].createTimestamp = Math.min(
                        allScriptAggregatedStatus[script].createTimestamp, 
                        scriptStatus.CreateTimestamp
                    );
    
                    allScriptAggregatedStatus[script].lastUsedTimestamp = Math.max(
                        allScriptAggregatedStatus[script].lastUsedTimestamp, 
                        scriptStatus.LastUsedTimestamp
                    );
    
                    allScriptAggregatedStatus[script].hits += scriptStatus.Hits;
                }
            }
        }
    }

    return [allScriptAggregatedStatus, groupScriptAggregatedStatus];
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

    const [currentGroupTabId, setCurrentGroupTabId] = React.useState(0);

    const handleGroupTabChange = (event: React.ChangeEvent<{}>, groupTabId: number) => {
        setCurrentGroupTabId(groupTabId);
    };

    if (props.selectedClusterName === null) {
        return <div>Loading</div>
    }

    if (props.allScriptAggregatedStatus.length === 0) {
        return <div>No scripts found</div>
    }

    let groupScripts = (currentGroupTabId === 0)
        ? props.allScriptAggregatedStatus
        : props.groupScriptAggregatedStatus[props.selectedClusterGroupNames[currentGroupTabId - 1]]

    return <div style={{ minHeight: '400px', width: '100%' }}>
        <Paper square>
            <Tabs
                value={currentGroupTabId}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleGroupTabChange}
                className={classes.tabs}
            >
                <Tab key="All" label="All" />
                {props.selectedClusterGroupNames.map(groupName => <Tab key={groupName} label={groupName} />)}
            </Tabs>
        </Paper>
        <ScriptsMaterialTable rows={Object.values(groupScripts)} className={classes.dataGridRoot}></ScriptsMaterialTable>
    </div>
}

const ScriptsPage = connect(mapStateToProps)(ScriptsPageComponent);

export default ScriptsPage;
