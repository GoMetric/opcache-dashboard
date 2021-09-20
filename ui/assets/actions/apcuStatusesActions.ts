export const APCU_STATUSES_FETCHED   = 'APCU_STATUSES_FETCHED';

export const apcuStatusesFetched = (apcuStatuses: Object) => ({
    type: APCU_STATUSES_FETCHED,
    apcuStatuses: apcuStatuses
});