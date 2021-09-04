package observer

type ClustersApcuStatuses map[string]map[string]map[string]NodeApcuStatus

type NodeApcuStatus struct{
	Enabled bool
	SmaInfo *NodeApcuSmaInfo
	Settings *NodeApcuSettings
}

type NodeApcuSmaInfo struct {
	NumSeg     int
	SegSize    int
	AvailMem   int
	//BlockLists [][]struct {
	//	Size   int
	//	Offset int
	//}
}
type NodeApcuSettings map[string]struct {
	GlobalValue string
	LocalValue  string
	Access      int
}
