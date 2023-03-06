import React from 'react';
import AlertsPanel from '/components/AlertsPanel';
import {FormattedMessage} from 'react-intl';

const buildAlertsDataFromOpcacheStatus = function(opcacheStatus) {
    const alerts = [];
    let message;

    if (opcacheStatus.CacheFull) {
        message = <FormattedMessage defaultMessage='Cache is full, increase "opcache.memory_consumption" or decrease "opcache.max_wasted_percentage".' />;

        alerts.push({
            'severity': 'error',
            'message': message
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