import React from 'react';
import { Button } from '@material-ui/core';

function RefreshButton(props) {
    const handleButtonClick = function(e) {
        fetch('/api/nodes/statistics/refresh');
    };

    return (
        <Button color="inherit" onClick={handleButtonClick}>
            <span>
                Refresh
            </span>
        </Button>
    );
}

export default RefreshButton;