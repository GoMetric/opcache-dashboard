package observer

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
			StartTime                int64 `json:"start_time"`
			TotalPrime               int   `json:"max_cached_keys"`
			UsedKeys                 int   `json:"num_cached_keys"`
			UsedScripts              int   `json:"num_cached_scripts"`
			Hits                     int   `json:"hits"`
			Misses                   int   `json:"misses"`
			OutOfMemoryRestartsCount int   `json:"oom_restarts"`
			HashRestartsCount        int   `json:"hash_restarts"`
			ManualRestartsCount      int   `json:"manual_restarts"`
			LastRestartTime          int64 `json:"last_restart_time"`
		} `json:"opcache_statistics"`
		MemoryUsage struct {
			Used                    int     `json:"used_memory"`
			Free                    int     `json:"free_memory"`
			Wasted                  int     `json:"wasted_memory"`
			CurrentWastedPercentage float64 `json:"current_wasted_percentage"`
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

	// optimisations bitmap to int array
	var optimisationsIntSlice = []int{}
	var optimisationsBitmap = int(agentMessage.Configuration.Directives["opcache.optimization_level"].(float64))
	for optimisationID := 0; optimisationID <= 16; optimisationID++ {
		if ((1 << optimisationID) & optimisationsBitmap) != 0 {
			optimisationsIntSlice = append(optimisationsIntSlice, optimisationID)
		}
	}

	// build struct
	opcacheStatus := NodeOpcacheStatus{
		Configuration: agentMessage.Configuration.Directives,
		PHPVersion:    agentMessage.Configuration.Version.Version,
		Optimizations: optimisationsIntSlice,
		Scripts:       map[string]Script{},
		StartTime:     agentMessage.Status.OpcacheStatistics.StartTime,
		CacheFull:     agentMessage.Status.CacheFull,
		Memory: Memory{
			Total:                   int(agentMessage.Configuration.Directives["opcache.memory_consumption"].(float64)),
			Used:                    agentMessage.Status.MemoryUsage.Used,
			Free:                    agentMessage.Status.MemoryUsage.Free,
			Wasted:                  agentMessage.Status.MemoryUsage.Wasted,
			MaxWastedPercentage:     agentMessage.Configuration.Directives["opcache.max_wasted_percentage"].(float64),
			CurrentWastedPercentage: agentMessage.Status.MemoryUsage.CurrentWastedPercentage,
		},
		InternedStingsMemory: InternedStingsMemory{
			Total:        int(agentMessage.Configuration.Directives["opcache.interned_strings_buffer"].(float64)) * 1024 * 1024,
			BufferSize:   agentMessage.Status.InternedStringsUsage.BufferSize,
			UsedMemory:   agentMessage.Status.InternedStringsUsage.UsedMemory,
			FreeMemory:   agentMessage.Status.InternedStringsUsage.FreeMemory,
			NumOfStrings: agentMessage.Status.InternedStringsUsage.NumOfStrings,
		},
		Keys: Keys{
			Total:       int(agentMessage.Configuration.Directives["opcache.max_accelerated_files"].(float64)),
			TotalPrime:  agentMessage.Status.OpcacheStatistics.TotalPrime,
			UsedKeys:    agentMessage.Status.OpcacheStatistics.UsedKeys,
			UsedScripts: agentMessage.Status.OpcacheStatistics.UsedScripts,
			Free:        agentMessage.Status.OpcacheStatistics.TotalPrime - agentMessage.Status.OpcacheStatistics.UsedKeys,
		},
		KeyHits: KeyHits{
			Hits:   agentMessage.Status.OpcacheStatistics.Hits,
			Misses: agentMessage.Status.OpcacheStatistics.Misses,
		},
		Restarts: Restarts{
			OutOfMemoryCount: agentMessage.Status.OpcacheStatistics.OutOfMemoryRestartsCount,
			HashCount:        agentMessage.Status.OpcacheStatistics.HashRestartsCount,
			ManualCount:      agentMessage.Status.OpcacheStatistics.ManualRestartsCount,
			LastRestartTime:  agentMessage.Status.OpcacheStatistics.LastRestartTime,
		},
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
