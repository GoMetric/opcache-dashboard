package observer

type ClustersApcuStatuses map[string]map[string]map[string]NodeApcuStatus

type NodeApcuStatus struct{
	Enabled bool
	SmaInfo *NodeApcuSmaInfo
	Settings *map[string]NodeApcuSetting
}

type NodeApcuSmaInfo struct {
	NumSeg     int
	SegSize    int // Total memory
	AvailMem   int // Free memory
	//BlockLists [][]struct {
	//	Size   int
	//	Offset int
	//}
}

type NodeApcuSetting struct {
	GlobalValue string
	LocalValue  string
	Access      int
}
