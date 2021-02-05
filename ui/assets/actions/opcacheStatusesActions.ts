export const OPCACHE_STATUSES_FETCHED   = 'OPCACHE_STATUSES_FETCHED';
export const CLUSTER_SWITCHED   = 'CLUSTER_SWITCHED';

export const opcacheStatusesFetched = (opcacheStatuses: Object) => ({
    type: OPCACHE_STATUSES_FETCHED,
    opcacheStatuses: opcacheStatuses
});

export const clusterSwitched = (clusterName: string) => ({
    type: CLUSTER_SWITCHED,
    clusterName
});