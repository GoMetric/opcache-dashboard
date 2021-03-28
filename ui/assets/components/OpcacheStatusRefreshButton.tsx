import React from 'react';
import { Button } from '@material-ui/core';
import { connect } from 'react-redux';
import fetchOpcacheStatuses from '/actionCreators/fetchOpcacheStatuses';

const mapDispatchToProps = (dispatch) => {
    return {
        fetchOpcacheStatuses: () => {
            dispatch(fetchOpcacheStatuses());
        }
    }
};

function OpcacheStatusRefreshButtonComponent(props) {
    const handleButtonClick = function(e) {
        // request for fetch new opcache status from nodes
        fetch('/api/nodes/statistics/refresh');

        // wait before status updated and refresh state
        setTimeout(() => {
            props.fetchOpcacheStatuses();
        }, 5000);
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