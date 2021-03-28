import React from 'react';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import { clusterSwitched } from '../actions/opcacheStatusesActions';
import { Button, Menu } from '@material-ui/core';

const mapStateToProps = (state: Object) => {
    let clusterNames = Object.keys(state.opcacheStatuses);
    let selectedClusterName = state.selectedClusterName;

    return {
        clusterNames: clusterNames,
        selectedClusterName: selectedClusterName
    }
};

const mapDispatchToProps = dispatch => {
    return {
        switchCluster: (clusterName) => {
            dispatch(clusterSwitched(clusterName));
        }
    }
};

function ClusterSelectComponent(props) {
    if (props.clusterNames.length < 2) {
        return <div></div>
    }

    const [menu, setMenu] = React.useState(null);

    const handleButtonClick = function (event: React.ChangeEvent<{ value: unknown }>) {
        setMenu(event.currentTarget);
    };

    const handleClusterSelect = function (event: React.ChangeEvent<{ value: unknown }>) {
        props.switchCluster(event.currentTarget.getAttribute('cluster'));
        setMenu(null);
    };

    return (
        <div>
            <Button color="inherit" onClick={handleButtonClick}>
                <span>
                    {props.selectedClusterName}
                </span>
            </Button>
            <Menu open={Boolean(menu)} anchorEl={menu} onClose={handleClusterSelect}>
                {props.clusterNames.map(clusterName => (
                    <MenuItem
                        component="a"
                        data-no-link="true"
                        key={clusterName}
                        selected={clusterName === props.selectedClusterName}
                        cluster={clusterName}
                        onClick={handleClusterSelect}
                        
                    >
                        {clusterName}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}

const ClusterSelect = connect(mapStateToProps, mapDispatchToProps)(ClusterSelectComponent);

export default ClusterSelect;