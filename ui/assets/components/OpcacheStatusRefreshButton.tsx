import React from 'react';
import { Button } from '@material-ui/core';
import { connect } from 'react-redux';
import refreshOpcacheStatuses from '/actionCreators/refreshOpcacheStatuses';

const mapDispatchToProps = (dispatch) => {
    return {
        refreshOpcacheStatuses: () => {
            dispatch(refreshOpcacheStatuses());
        }
    }
};

function OpcacheStatusRefreshButtonComponent(props) {
    const handleButtonClick = function(e) {
        props.refreshOpcacheStatuses();
    };

    return (
        <Button color="inherit" onClick={handleButtonClick}>
            <span>
                Refresh
            </span>
        </Button>
    );
}

const OpcacheStatusRefreshButton = connect(null, mapDispatchToProps)(OpcacheStatusRefreshButtonComponent);

export default OpcacheStatusRefreshButton;