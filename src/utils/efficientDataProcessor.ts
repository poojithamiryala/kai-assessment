import type { OptimizedVulnerability } from '../types/vulnerability';

export interface ProcessingStats {
  totalCount: number;
  filteredCount: number;
  processingTime: number;
  memoryUsage: number;
}

/**
 * High-performance data processor for large vulnerability datasets
 * Uses indexing for O(1) lookups and asynchronous processing to prevent UI blocking
 */
export class EfficientDataProcessor {
  private vulnerabilities: OptimizedVulnerability[] = [];
  
  // Indexes for fast searching and filtering
  private searchIndex: Map<string, Set<number>> = new Map();
  private severityIndex: Map<string, Set<number>> = new Map();
  private packageIndex: Map<string, Set<number>> = new Map();
  private repoIndex: Map<string, Set<number>> = new Map();
  private kaiStatusIndex: Map<string, Set<number>> = new Map();

  constructor(vulnerabilities: OptimizedVulnerability[]) {
    this.vulnerabilities = vulnerabilities;
    this.buildIndexesAsync();
  }

  // Defer heavy indexing work to prevent UI blocking
  private async buildIndexesAsync(): Promise<void> {
    if (window.requestIdleCallback) {
      await new Promise(resolve => {
        window.requestIdleCallback(() => {
          this.buildIndexes();
          resolve(undefined);
        });
      });
    } else {
      await new Promise(resolve => {
        setTimeout(() => {
          this.buildIndexes();
          resolve(undefined);
        }, 0);
      });
    }
  }

  // Core optimization: build lookup tables for O(1) searching
  private buildIndexes(): void {
    // Pre-allocate Maps for better performance
    const searchIndex = new Map<string, Set<number>>();
    const severityIndex = new Map<string, Set<number>>();
    const packageIndex = new Map<string, Set<number>>();
    const repoIndex = new Map<string, Set<number>>();
    const kaiStatusIndex = new Map<string, Set<number>>();

    this.vulnerabilities.forEach((vuln, index) => {
      // Build comprehensive search index from multiple fields
      const searchTerms = [
        vuln.cve.toLowerCase(),
        vuln.imageName.toLowerCase(),
        vuln.repoName.toLowerCase(),
        vuln.description.toLowerCase()
      ].join(' ');

      // Index each word for partial matching
      searchTerms.split(' ').forEach(term => {
        if (term.length > 0) {
          if (!searchIndex.has(term)) {
            searchIndex.set(term, new Set());
          }
          searchIndex.get(term)!.add(index);
        }
      });

      // Build filter indexes
      if (!severityIndex.has(vuln.severity)) {
        severityIndex.set(vuln.severity, new Set());
      }
      severityIndex.get(vuln.severity)!.add(index);

      if (!packageIndex.has(vuln.imageName)) {
        packageIndex.set(vuln.imageName, new Set());
      }
      packageIndex.get(vuln.imageName)!.add(index);

      if (!repoIndex.has(vuln.repoName)) {
        repoIndex.set(vuln.repoName, new Set());
      }
      repoIndex.get(vuln.repoName)!.add(index);

      if (!kaiStatusIndex.has(vuln.kaiStatus)) {
        kaiStatusIndex.set(vuln.kaiStatus, new Set());
      }
      kaiStatusIndex.get(vuln.kaiStatus)!.add(index);
    });

    // Assign all indexes at once for better performance
    this.searchIndex = searchIndex;
    this.severityIndex = severityIndex;
    this.packageIndex = packageIndex;
    this.repoIndex = repoIndex;
    this.kaiStatusIndex = kaiStatusIndex;
  }

  /**
   * Main search method with multi-word support and filter intersection
   * Uses pre-built indexes for O(1) lookups and handles complex search scenarios
   */
  public search(
    searchTerm: string = '',
    severityFilter: string = '',
    packageFilter: string = '',
    repoFilter: string = '',
    kaiStatusFilter: string = '',
    page: number = 0,
    pageSize: number = 50
  ): {
    results: OptimizedVulnerability[];
    totalCount: number;
    stats: ProcessingStats;
  } {
    const startTime = performance.now();
    let resultIndices: Set<number> | null = null;

    // Handle search term with exact match and multi-word intersection
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Try exact term matching first (fastest)
      let exactMatchIndices = this.searchIndex.get(searchLower);
      
      if (exactMatchIndices && exactMatchIndices.size > 0) {
        resultIndices = new Set(exactMatchIndices);
      } else {
        // Multi-word search: find intersection of all terms
        const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
        if (searchTerms.length > 1) {
          resultIndices = new Set();
          
          // Intersect results from each word - ALL words must be present
          searchTerms.forEach((term, i) => {
            const termIndices = this.searchIndex.get(term) || new Set();
            if (i === 0) {
              resultIndices = new Set(termIndices);
            } else {
              resultIndices = new Set([...resultIndices!].filter(index => termIndices.has(index)));
            }
          });
        } else {
          // Single word search with no matches - return empty results
          resultIndices = new Set();
        }
      }
    }

    // Apply filters using indexes (intersect with search results)
    const filters = [
      { filter: severityFilter, index: this.severityIndex },
      { filter: packageFilter, index: this.packageIndex },
      { filter: repoFilter, index: this.repoIndex },
      { filter: kaiStatusFilter, index: this.kaiStatusIndex }
    ];

    filters.forEach(({ filter, index }) => {
      if (filter) {
        const filterIndices = index.get(filter) || new Set();
        if (resultIndices === null) {
          resultIndices = new Set(filterIndices);
        } else {
          resultIndices = new Set([...resultIndices].filter(index => filterIndices.has(index)));
        }
      }
    });

    // Handle case where no search or filters applied
    if (resultIndices === null) {
      resultIndices = new Set(this.vulnerabilities.map((_, index) => index));
    }

    // Convert indices to vulnerabilities and apply pagination
    const filteredVulnerabilities = [...resultIndices].map(index => this.vulnerabilities[index]);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredVulnerabilities.slice(startIndex, endIndex);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    return {
      results: paginatedResults,
      totalCount: filteredVulnerabilities.length,
      stats: {
        totalCount: this.vulnerabilities.length,
        filteredCount: filteredVulnerabilities.length,
        processingTime,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  // Extract unique values from indexes for filter dropdowns
  public getUniqueValues(): {
    severities: string[];
    packages: string[];
    repos: string[];
    kaiStatuses: string[];
  } {
    return {
      severities: Array.from(this.severityIndex.keys()).sort(),
      packages: Array.from(this.packageIndex.keys()).sort(),
      repos: Array.from(this.repoIndex.keys()).sort(),
      kaiStatuses: Array.from(this.kaiStatusIndex.keys()).sort()
    };
  }

  // Rough memory usage estimation
  private getMemoryUsage(): number {
    const indexSize = this.searchIndex.size + this.severityIndex.size + 
                     this.packageIndex.size + this.repoIndex.size + this.kaiStatusIndex.size;
    return indexSize * 8;
  }

}
