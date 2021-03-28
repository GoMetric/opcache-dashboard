import {opcacheStatusesRefreshed} from '/actions/opcacheStatusesActions';
import fetchOpcacheStatuses from '/actionCreators/fetchOpcacheStatuses';

export default function() {
    return (dispatch, getState) => {
        // request for fetch new opcache status from nodes
        fetch('/api/nodes/statistics/refresh')
            .then(() => {
                // wait before status updated and refresh state
                setTimeout(() => {
                    dispatch(fetchOpcacheStatuses()).then(() => dispatch(opcacheStatusesRefreshed()));
                }, 5000);
            });
    }
}
