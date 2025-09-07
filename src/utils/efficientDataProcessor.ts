import type { OptimizedVulnerability } from '../types/vulnerability';

export interface ProcessingStats {
  totalCount: number;
  filteredCount: number;
  processingTime: number;
  memoryUsage: number;
}

export class EfficientDataProcessor {
  private vulnerabilities: OptimizedVulnerability[] = [];
  private searchIndex: Map<string, Set<number>> = new Map();
  private severityIndex: Map<string, Set<number>> = new Map();
  private packageIndex: Map<string, Set<number>> = new Map();
  private repoIndex: Map<string, Set<number>> = new Map();
  private kaiStatusIndex: Map<string, Set<number>> = new Map();

  constructor(vulnerabilities: OptimizedVulnerability[]) {
    this.vulnerabilities = vulnerabilities;
    this.buildIndexes();
  }

  private buildIndexes(): void {
    console.time('Building indexes');
    
    this.vulnerabilities.forEach((vuln, index) => {
      // Search indexes (for CVE, imageName, repoName, description)
      const searchTerms = [
        vuln.cve.toLowerCase(),
        vuln.imageName.toLowerCase(),
        vuln.repoName.toLowerCase(),
        vuln.description.toLowerCase()
      ].join(' ');

      searchTerms.split(' ').forEach(term => {
        if (term.length > 0) { // Index all non-empty terms
          if (!this.searchIndex.has(term)) {
            this.searchIndex.set(term, new Set());
          }
          this.searchIndex.get(term)!.add(index);
        }
      });

      // Severity index
      if (!this.severityIndex.has(vuln.severity)) {
        this.severityIndex.set(vuln.severity, new Set());
      }
      this.severityIndex.get(vuln.severity)!.add(index);

      // Package index
      if (!this.packageIndex.has(vuln.imageName)) {
        this.packageIndex.set(vuln.imageName, new Set());
      }
      this.packageIndex.get(vuln.imageName)!.add(index);

      // Repo index
      if (!this.repoIndex.has(vuln.repoName)) {
        this.repoIndex.set(vuln.repoName, new Set());
      }
      this.repoIndex.get(vuln.repoName)!.add(index);

      // Kai status index
      if (!this.kaiStatusIndex.has(vuln.kaiStatus)) {
        this.kaiStatusIndex.set(vuln.kaiStatus, new Set());
      }
      this.kaiStatusIndex.get(vuln.kaiStatus)!.add(index);
    });

    console.timeEnd('Building indexes');
    console.log('Indexes built:', {
      searchTerms: this.searchIndex.size,
      severities: this.severityIndex.size,
      packages: this.packageIndex.size,
      repos: this.repoIndex.size,
      kaiStatuses: this.kaiStatusIndex.size
    });
  }

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
    console.time('Search operation');
    const startTime = performance.now();

    let resultIndices: Set<number> | null = null;

    // Apply search filter using index
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Try exact term matching first
      let exactMatchIndices = this.searchIndex.get(searchLower);
      
      if (exactMatchIndices && exactMatchIndices.size > 0) {
        resultIndices = new Set(exactMatchIndices);
      } else {
        // If no exact match, try splitting into words and finding intersection
        const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
        if (searchTerms.length > 1) {
          resultIndices = new Set();
          
          searchTerms.forEach((term, i) => {
            const termIndices = this.searchIndex.get(term) || new Set();
            if (i === 0) {
              resultIndices = new Set(termIndices);
            } else {
              resultIndices = new Set([...resultIndices!].filter(index => termIndices.has(index)));
            }
          });
        }
      }
    }

    // Apply other filters using indexes
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

    // If no filters applied, use all indices
    if (resultIndices === null) {
      resultIndices = new Set(this.vulnerabilities.map((_, index) => index));
    }

    // Convert indices to actual vulnerabilities
    const filteredVulnerabilities = [...resultIndices].map(index => this.vulnerabilities[index]);

    // Apply pagination
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredVulnerabilities.slice(startIndex, endIndex);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.timeEnd('Search operation');

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

  private getMemoryUsage(): number {
    // Rough estimation of memory usage
    const indexSize = this.searchIndex.size + this.severityIndex.size + 
                     this.packageIndex.size + this.repoIndex.size + this.kaiStatusIndex.size;
    return indexSize * 8; // Rough bytes estimation
  }

}
