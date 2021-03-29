package opcachestatus

type MetricSenderInterface interface {
	Send(
		clusterName string,
		groupName string,
		hostName string,
		nodeOpcacheStatus NodeOpcacheStatus,
	)
}
