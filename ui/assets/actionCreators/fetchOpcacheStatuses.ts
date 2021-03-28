import OpcacheStatusesDataProvider from '/dataProviders/OpcacheStatusesDataProvider';
import {opcacheStatusesFetched} from '/actions/opcacheStatusesActions';

export default function() {
    return (dispatch, getState) => {
        const opcacheStatusesDataProvider = new OpcacheStatusesDataProvider();
        
        return opcacheStatusesDataProvider
            .fetch()
            .then((opcacheStatuses: Object) => {
                dispatch(opcacheStatusesFetched(opcacheStatuses));
            });
    }
}
