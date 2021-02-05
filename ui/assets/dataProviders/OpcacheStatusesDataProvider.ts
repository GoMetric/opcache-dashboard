class OpcacheStatusesDataProvider {
    async fetch(): Promise<Object> {
        return await fetch("/api/nodes").then(response => response.json());
    }
}

export default OpcacheStatusesDataProvider;