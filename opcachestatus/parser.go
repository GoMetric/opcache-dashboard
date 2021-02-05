package opcachestatus

import (
	"encoding/json"
	"errors"
)

// AgentMessageParser implements parsing of agent response
type AgentMessageParser struct {
}

type agentMessage struct {
	Configuration struct {
		Directives map[string]interface{} `json:"directives"`
		Version    struct {
			Version string `json:"version"`
		} `json:"version"`
	} `json:"configuration"`
	Status struct {
		CacheFull         bool `son:"cache_full"`
		OpcacheStatistics struct {
			StartTime           int64 `json:"start_time"`
			TotalPrime          int64 `json:"max_cached_keys"`
			UsedKeys            int64 `json:"num_cached_keys"`
			UsedScripts         int64 `json:"num_cached_scripts"`
			Hits                int64 `json:"hits"`
			Misses              int64 `json:"misses"`
			OutOfMemoryRestarts int   `json:"oom_restarts"`
			HashRestarts        int   `json:"hash_restarts"`
			ManualRestarts      int   `json:"manual_restarts"`
			LastRestartTime     int64 `json:"last_restart_time"`
		} `json:"opcache_statistics"`
		MemoryUsage struct {
			Used                    int     `json:"used_memory"`
			Free                    int     `json:"free_memory"`
			Wasted                  int     `json:"wasted_memory"`
			CurrentWasterPercentage float32 `json:"current_wasted_percentage"`
		} `json:"memory_usage"`
		InternedStringsUsage struct {
			BufferSize   int `json:"buffer_size"`
			UsedMemory   int `json:"used_memory"`
			FreeMemory   int `json:"free_memory"`
			NumOfStrings int `json:"number_of_strings"`
		} `json:"interned_strings_usage"`
		Scripts map[string]struct {
			Hits              int   `json:"hits"`
			CreateTimestamp   int64 `json:"timestamp"`
			LastUsedTimestamp int64 `json:"last_used_timestamp"`
			Memory            int   `json:"memory_consumption"`
		} `json:"scripts"`
	} `json:"status"`
}

// Parse agent response to struct
func (parser AgentMessageParser) Parse(body []byte) (*NodeOpcacheStatus, error) {
	var agentMessage = agentMessage{}
	err := json.Unmarshal(body, &agentMessage)
	if err != nil {
		return nil, err
	}

	if len(agentMessage.Status.Scripts) == 0 {
		return nil, errors.New("No scripts found in agent response")
	}

	opcacheStatus := NodeOpcacheStatus{
		Configuration: agentMessage.Configuration.Directives,
		PHPVersion:    agentMessage.Configuration.Version.Version,
		Scripts:       map[string]Script{},
	}

	for phpFilePath, script := range agentMessage.Status.Scripts {
		opcacheStatus.Scripts[phpFilePath] = Script{
			Hits:              script.Hits,
			CreateTimestamp:   script.CreateTimestamp,
			LastUsedTimestamp: script.LastUsedTimestamp,
			Memory:            script.Memory,
		}
	}

	return &opcacheStatus, nil
}
