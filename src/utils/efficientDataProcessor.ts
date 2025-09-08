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
  
  // Pre-sorted ID arrays for different sort fields - amortized sorting cost
  private preSortedIds: Map<string, number[]> = new Map();

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
    
    // Build pre-sorted arrays for amortized sorting cost
    this.buildPreSortedArrays();
  }

  /**
   * Build pre-sorted arrays for different sort fields
   * This amortizes the sorting cost - sort once, reuse many times
   */
  private buildPreSortedArrays(): void {
    const allIndices = this.vulnerabilities.map((_, index) => index);
    
    // Pre-sort by published date (desc) - most common sort
    this.preSortedIds.set('published-desc', [...allIndices].sort((a, b) => {
      const dateA = new Date(this.vulnerabilities[a].published || '').getTime();
      const dateB = new Date(this.vulnerabilities[b].published || '').getTime();
      return dateB - dateA; // Descending
    }));
    
    // Pre-sort by published date (asc)
    this.preSortedIds.set('published-asc', [...allIndices].sort((a, b) => {
      const dateA = new Date(this.vulnerabilities[a].published || '').getTime();
      const dateB = new Date(this.vulnerabilities[b].published || '').getTime();
      return dateA - dateB; // Ascending
    }));
    
    // Pre-sort by CVE (asc)
    this.preSortedIds.set('cve-asc', [...allIndices].sort((a, b) => {
      return this.vulnerabilities[a].cve.localeCompare(this.vulnerabilities[b].cve);
    }));
    
    // Pre-sort by CVE (desc)
    this.preSortedIds.set('cve-desc', [...allIndices].sort((a, b) => {
      return this.vulnerabilities[b].cve.localeCompare(this.vulnerabilities[a].cve);
    }));
    
    // Pre-sort by severity (desc) - critical > high > medium > low
    this.preSortedIds.set('severity-desc', [...allIndices].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const orderA = severityOrder[this.vulnerabilities[a].severity as keyof typeof severityOrder] || 0;
      const orderB = severityOrder[this.vulnerabilities[b].severity as keyof typeof severityOrder] || 0;
      return orderB - orderA; // Descending
    }));
    
    // Pre-sort by severity (asc)
    this.preSortedIds.set('severity-asc', [...allIndices].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const orderA = severityOrder[this.vulnerabilities[a].severity as keyof typeof severityOrder] || 0;
      const orderB = severityOrder[this.vulnerabilities[b].severity as keyof typeof severityOrder] || 0;
      return orderA - orderB; // Ascending
    }));
    
    // Pre-sort by fix date (desc)
    this.preSortedIds.set('fixDate-desc', [...allIndices].sort((a, b) => {
      const dateA = new Date(this.vulnerabilities[a].fixDate || '').getTime();
      const dateB = new Date(this.vulnerabilities[b].fixDate || '').getTime();
      return dateB - dateA; // Descending
    }));
    
    // Pre-sort by fix date (asc)
    this.preSortedIds.set('fixDate-asc', [...allIndices].sort((a, b) => {
      const dateA = new Date(this.vulnerabilities[a].fixDate || '').getTime();
      const dateB = new Date(this.vulnerabilities[b].fixDate || '').getTime();
      return dateA - dateB; // Ascending
    }));
    
    // Pre-sort by Kai status (asc)
    this.preSortedIds.set('kaiStatus-asc', [...allIndices].sort((a, b) => {
      return this.vulnerabilities[a].kaiStatus.localeCompare(this.vulnerabilities[b].kaiStatus);
    }));
    
    // Pre-sort by Kai status (desc)
    this.preSortedIds.set('kaiStatus-desc', [...allIndices].sort((a, b) => {
      return this.vulnerabilities[b].kaiStatus.localeCompare(this.vulnerabilities[a].kaiStatus);
    }));
  }

  /**
   * Main search method using pre-sorted arrays and fast filtering
   * Amortized sorting cost - sort once, reuse many times
   */
  public search(
    searchTerm: string = '',
    severityFilter: string = '',
    packageFilter: string = '',
    repoFilter: string = '',
    kaiStatusFilter: string = '',
    page: number = 0,
    pageSize: number = 50,
    sortField: string = 'published',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): {
    results: OptimizedVulnerability[];
    totalCount: number;
    stats: ProcessingStats;
  } {
    const startTime = performance.now();
    
    // Get the pre-sorted array for the requested sort field and direction
    const sortKey = `${sortField}-${sortDirection}`;
    const preSortedIds = this.preSortedIds.get(sortKey);
    
    if (!preSortedIds) {
      // Fallback to default sorting if pre-sorted array not found
      const allIndices = this.vulnerabilities.map((_, index) => index);
      const sortedIndices = this.sortVulnerabilities(
        allIndices.map(index => this.vulnerabilities[index]), 
        sortField, 
        sortDirection
      ).map((_, index) => allIndices[index]);
      
      return this.filterAndPaginate(sortedIndices, searchTerm, severityFilter, packageFilter, repoFilter, kaiStatusFilter, page, pageSize, startTime);
    }
    
    // Fast scan: filter the pre-sorted array
    const visibleIds = preSortedIds.filter(id => this.passesFilters(id, searchTerm, severityFilter, packageFilter, repoFilter, kaiStatusFilter));
    
    // Apply pagination to filtered results
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedIds = visibleIds.slice(startIndex, endIndex);
    
    // Convert IDs back to vulnerability objects
    const results = paginatedIds.map(id => this.vulnerabilities[id]);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return {
      results,
      totalCount: visibleIds.length,
      stats: {
        totalCount: this.vulnerabilities.length,
        filteredCount: visibleIds.length,
        processingTime,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  /**
   * Fast filter check for a single vulnerability ID
   * Uses pre-built indexes for O(1) lookups
   */
  private passesFilters(
    id: number,
    searchTerm: string,
    severityFilter: string,
    packageFilter: string,
    repoFilter: string,
    kaiStatusFilter: string
  ): boolean {
    // Check search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 1) {
        // Single word search - check if it exists in search index
        const termIndices = this.searchIndex.get(searchTerms[0]);
        if (!termIndices || !termIndices.has(id)) {
          return false;
        }
      } else {
        // Multi-word search - ALL words must be present
        for (const term of searchTerms) {
          const termIndices = this.searchIndex.get(term);
          if (!termIndices || !termIndices.has(id)) {
            return false;
          }
        }
      }
    }
    
    // Check filters using indexes
    if (severityFilter && !this.severityIndex.get(severityFilter)?.has(id)) {
      return false;
    }
    if (packageFilter && !this.packageIndex.get(packageFilter)?.has(id)) {
      return false;
    }
    if (repoFilter && !this.repoIndex.get(repoFilter)?.has(id)) {
      return false;
    }
    if (kaiStatusFilter && !this.kaiStatusIndex.get(kaiStatusFilter)?.has(id)) {
      return false;
    }
    
    return true;
  }

  /**
   * Helper method for fallback filtering and pagination
   */
  private filterAndPaginate(
    sortedIndices: number[],
    searchTerm: string,
    severityFilter: string,
    packageFilter: string,
    repoFilter: string,
    kaiStatusFilter: string,
    page: number,
    pageSize: number,
    startTime: number
  ): {
    results: OptimizedVulnerability[];
    totalCount: number;
    stats: ProcessingStats;
  } {
    // Filter the sorted indices
    const visibleIds = sortedIndices.filter(id => 
      this.passesFilters(id, searchTerm, severityFilter, packageFilter, repoFilter, kaiStatusFilter)
    );
    
    // Apply pagination
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedIds = visibleIds.slice(startIndex, endIndex);
    
    // Convert to vulnerability objects
    const results = paginatedIds.map(id => this.vulnerabilities[id]);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    return {
      results,
      totalCount: visibleIds.length,
      stats: {
        totalCount: this.vulnerabilities.length,
        filteredCount: visibleIds.length,
        processingTime,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  /**
   * Efficient sorting method for vulnerability data
   * Handles different field types with optimized comparison functions
   */
  private sortVulnerabilities(
    vulnerabilities: OptimizedVulnerability[], 
    sortField: string, 
    sortDirection: 'asc' | 'desc'
  ): OptimizedVulnerability[] {
    return [...vulnerabilities].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'cve':
          aValue = a.cve;
          bValue = b.cve;
          break;
        case 'severity':
          // Sort by severity priority (critical > high > medium > low)
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          break;
        case 'published':
          aValue = new Date(a.published || '').getTime();
          bValue = new Date(b.published || '').getTime();
          break;
        case 'fixDate':
          aValue = new Date(a.fixDate || '').getTime();
          bValue = new Date(b.fixDate || '').getTime();
          break;
        case 'kaiStatus':
          aValue = a.kaiStatus;
          bValue = b.kaiStatus;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
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
