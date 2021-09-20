class ApcuStatusesDataProvider {
    async fetch(): Promise<Object> {
        return await fetch("/api/nodes/statistics/apcu").then(response => response.json());
    }
}

export default ApcuStatusesDataProvider;