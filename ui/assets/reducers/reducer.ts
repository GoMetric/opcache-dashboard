import {
    OPCACHE_STATUSES_FETCHED,
    CLUSTER_SWITCHED
} from '/actions/opcacheStatusesActions';

interface ApplicationState {
    selectedClusterName: string|null,
    opcacheStatuses: Array<Object>
}

// initial store
const initialState: ApplicationState = {
    selectedClusterName: null,
    opcacheStatuses: []
}

export default function(state = initialState, action: Object) {
    switch (action.type) {
        case OPCACHE_STATUSES_FETCHED:
            return {
                ...state,
                opcacheStatuses: action.opcacheStatuses,
                selectedClusterName: Object.keys(action.opcacheStatuses)[0]
            }

        case CLUSTER_SWITCHED: 
            return {
                ...state,
                selectedClusterName: action.clusterName
            }

        default:
            return state;
    }

    return state;
};

