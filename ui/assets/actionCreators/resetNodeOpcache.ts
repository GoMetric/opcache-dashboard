import refreshOpcacheStatuses from '/actionCreators/refreshOpcacheStatuses';

export default function(clusterName: string, groupName: string, host: string) {
    return (dispatch, getState) => {
        // request for fetch new opcache status from nodes
        fetch('/api/nodes/' + clusterName + '/'  + groupName + '/' + host + '/resetOpcache')
            .then(() => {
                // wait before status updated and refresh state
                dispatch(refreshOpcacheStatuses());
            });
    }
}
