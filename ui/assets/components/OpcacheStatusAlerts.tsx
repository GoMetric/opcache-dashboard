import React from 'react';
import AlertsPanel from '/components/AlertsPanel';

const buildAlertsDataFromOpcacheStatus = function(opcacheStatus) {
    const alerts = [];

    if (opcacheStatus.CacheFull) {
        alerts.push({
            'severity': 'error',
            'message': 'Cache is full, increase "opcache.memory_consumption" or decrease "opcache.max_wasted_percentage".',
        });
    }

    return alerts;
}

function OpcacheStatusAlerts(props) {
    return <AlertsPanel alerts={props.alerts}></AlertsPanel>;
}

export {
    OpcacheStatusAlerts, 
    buildAlertsDataFromOpcacheStatus
};