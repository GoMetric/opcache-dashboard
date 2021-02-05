import OpcacheStatusesDataProvider from '/dataProviders/OpcacheStatusesDataProvider';
import {opcacheStatusesFetched} from '/actions/opcacheStatusesActions';

export default function() {
    return (dispatch, getState) => {
        const opcacheStatusesDataProvider = new OpcacheStatusesDataProvider();
        opcacheStatusesDataProvider.fetch().then((opcacheStatuses: Object) => {
            dispatch(opcacheStatusesFetched(opcacheStatuses));
        });
    }
}