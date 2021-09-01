class OpcacheStatusesDataProvider {
    async fetch(): Promise<Object> {
        return await fetch("/api/nodes/statistics/opcache").then(response => response.json());
    }
}

export default OpcacheStatusesDataProvider;