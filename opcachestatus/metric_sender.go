package opcachestatus

type MetricSender interface {
	Send(
		clusterName string,
		groupName string,
		hostName string,
		nodeOpcacheStatus NodeOpcacheStatus,
	)
}
