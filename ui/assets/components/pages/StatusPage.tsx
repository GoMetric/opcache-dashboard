import { createStyles, makeStyles, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import HostGroupSelect from '/components/HostGroupSelect';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const mapStateToProps = (state: Object) => {
    return {};
};

function StatusPageComponent(props: Object) {
    return (
        <div>
            Status
        </div>
    );
}

const StatusPage = connect(mapStateToProps)(StatusPageComponent);

export default StatusPage;
