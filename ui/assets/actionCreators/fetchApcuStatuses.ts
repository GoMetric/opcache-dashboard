import ApcuStatusesDataProvider from '/dataProviders/ApcuStatusesDataProvider';
import {apcuStatusesFetched} from '/actions/apcuStatusesActions';

export default function() {
    return (dispatch, getState) => {
        const apcuStatusesDataProvider = new ApcuStatusesDataProvider();
        
        return apcuStatusesDataProvider
            .fetch()
            .then((apcuStatuses: Object) => {
                dispatch(apcuStatusesFetched(apcuStatuses));
            });
    }
}
