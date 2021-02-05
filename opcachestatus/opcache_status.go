package opcachestatus

// ClustersOpcacheStatuses represents collection of node opcache statuses
type ClustersOpcacheStatuses map[string]map[string]map[string]NodeOpcacheStatus

// https://github.com/php/php-src/blob/master/ext/opcache/zend_accelerator_hash.c
var primeNumbers = []int{5, 11, 19, 53, 107, 223, 463, 983, 1979, 3907, 7963, 16229, 32531, 65407, 130987, 262237, 524521, 1048793}

// https://github.com/php/php-src/blob/master/Zend/Optimizer/zend_optimizer.h
var optimisationMap = map[int]string{
	0:  "Simple local optimizations",
	1:  "Constant conversion and jumps",
	2:  "Jump optimization",
	3:  "INIT_FCALL_BY_NAME -> DO_FCALL",
	4:  "CFG based optimization",
	5:  "DFA based optimization",
	6:  "CALL GRAPH optimization",
	7:  "SCCP (constant propagation)",
	8:  "TMP VAR usage",
	9:  "NOP removal",
	10: "Merge equal constants",
	11: "Adjust used stack",
	12: "Remove unused variables",
	13: "DCE (dead code elimination",
	14: "(unsafe) Collect constants",
	15: "Inline functions",
	16: "(unsafe) Ignore possibility of operator overloading",
}

// NodeOpcacheStatus represents status of opcache on single node
type NodeOpcacheStatus struct {
	Configuration map[string]interface{}
	PHPVersion    string // configuration.version.version
	Scripts       map[string]Script
	Optimizations []int //configuration.directives.opcache.optimization_level
	Statistics    struct {
		StartTime int64 // status.opcache_statistics.start_time
		// If cache_full is true and num_cached_keys equals max_cached_keys then there are too many files.
		// No restart will be triggered. As a result there are scripts that don't get cached,
		// even though there might be memory available.
		CacheFull bool // status.cache_full
		Memory    struct {
			Total                   int     // configuration.directives.opcache.memory_consumption
			Used                    int     // status.memory_usage.used_memory
			Free                    int     // status.memory_usage.free_memory
			Wasted                  int     // status.memory_usage.wasted_memory
			MaxWastedPercentage     float32 // configuration.directives.opcache.max_wasted_percentage
			CurrentWasterPercentage float32 // status.memory_usage.current_wasted_percentage
			InternedStings          struct {
				Total        int // configuration.directives.opcache.interned_strings_buffer
				BufferSize   int // status.interned_strings_usage.buffer_size
				UsedMemory   int // status.interned_strings_usage.used_memory
				FreeMemory   int // status.interned_strings_usage.free_memory
				NumOfStrings int // status.interned_strings_usage.number_of_strings
			}
		}
		Keys struct {
			Total       int // configuration.directives.opcache.max_accelerated_files, The maximum number of keys (and therefore scripts) in the OPcache hash table
			TotalPrime  int // status.opcache_statistics.max_cached_keys
			UsedKeys    int // status.opcache_statistics.num_cached_keys
			UsedScripts int // status.opcache_statistics.num_cached_scripts
			// Free - may be defined as TotalPrime-UsedKeys
			Hit struct {
				Hits   int // status.opcache_statistics.hits
				Misses int // status.opcache_statistics.misses
			}
		}
		Restarts struct {
			// Restarts occured when:
			//  - wasted scripts > "opcache.max_wasted_percentage"
			//  - "status.opcache_statistics.num_cached_scripts" > "opcache.max_accelerated_files"
			Count struct {
				OutOfMemory int // status.opcache_statistics.oom_restarts
				Hash        int // status.opcache_statistics.hash_restarts
				Manual      int // status.opcache_statistics.manual_restarts
			}
			LastRestartTime int64 // status.opcache_statistics.last_restart_time
		}
	}
}

// Script represents info abount signle script on one node
type Script struct {
	Hits              int
	CreateTimestamp   int64
	LastUsedTimestamp int64
	Memory            int
}
