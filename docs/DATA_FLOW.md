# Data Flow Architecture

This document describes the complete data flow architecture of the Vulnerability Analysis Dashboard, from raw data ingestion to UI rendering.

## 🔄 Data Flow Overview

```
Raw JSON Data → API Service → Processing Pipeline → Cache Layer → UI Components
```

## 📊 Detailed Data Flow

### 1. Data Ingestion Layer

#### API Service (`src/services/api.ts`)
```typescript
// Raw data fetching from external sources
fetchVulnerabilityData() → Raw JSON Response
```

**Responsibilities:**
- Fetch raw vulnerability data from external APIs
- Handle network requests and responses
- Provide streaming support for large datasets
- Error handling and retry logic

### 2. Raw Data Processing

#### VulnerabilityProcessor (`src/utils/vulnerabilityProcessor.ts`)
```typescript
Raw JSON → VulnerabilityProcessor → OptimizedVulnerability[]
```

**Processing Steps:**
1. **Data Normalization**: Convert raw data to consistent format
2. **Field Mapping**: Map external fields to internal structure
3. **Data Validation**: Ensure data integrity and completeness
4. **ID Generation**: Create unique identifiers for each vulnerability
5. **Metric Calculation**: Pre-calculate statistics and trends

**Key Transformations:**
- Date normalization (published, fixDate)
- Severity standardization
- Risk factor extraction and flattening
- Performance metrics calculation

### 3. Efficient Data Processing

#### EfficientDataProcessor (`src/utils/efficientDataProcessor.ts`)
```typescript
OptimizedVulnerability[] → Indexing → Searchable Data Structure
```

**Indexing Strategy:**
```typescript
// Search Index: word → Set<vulnerability indices>
searchIndex: Map<string, Set<number>>

// Filter Indexes: category → Set<vulnerability indices>
severityIndex: Map<string, Set<number>>
packageIndex: Map<string, Set<number>>
repoIndex: Map<string, Set<number>>
kaiStatusIndex: Map<string, Set<number>>

// Pre-sorted Arrays: sortField-direction → sorted indices
preSortedIds: Map<string, number[]>
```

**Performance Optimizations:**
- **O(1) Lookups**: Pre-built indexes for instant filtering
- **Amortized Sorting**: Pre-sorted arrays for different sort fields
- **Memory Efficiency**: Index-based approach reduces memory usage
- **Asynchronous Processing**: Non-blocking index building

### 4. Caching Layer

#### VulnerabilityCache (`src/services/vulnerabilityCache.ts`)
```typescript
Processed Data → Cache Storage → Instant Retrieval
```

**Caching Strategy:**
- **Singleton Pattern**: Single cache instance across the application
- **Cache-First Approach**: Always check cache before processing
- **Automatic Expiration**: 5-minute cache duration
- **Memory Management**: Efficient storage and cleanup

**Cache Structure:**
```typescript
interface CachedVulnerabilityData {
  vulnerabilities: OptimizedVulnerability[];
  dataProcessor: EfficientDataProcessor;
  performanceStats: ProcessingStats;
  timestamp: number;
  version: string;
}
```

### 5. React Integration Layer

#### useAsyncVulnerabilityData Hook (`src/hooks/useAsyncVulnerabilityData.ts`)
```typescript
Raw Data → Async Processing → React State → UI Components
```

**Hook Responsibilities:**
- **Data Orchestration**: Coordinate between raw data and processing
- **Cache Management**: Integrate with cache service
- **Loading States**: Manage processing and loading states
- **Error Handling**: Comprehensive error management
- **Performance Monitoring**: Track processing statistics

**State Management:**
```typescript
interface AsyncVulnerabilityData {
  vulnerabilities: OptimizedVulnerability[];
  dataProcessor: EfficientDataProcessor | null;
  performanceStats: ProcessingStats | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  progress: number;
  isStreaming: boolean;
}
```

### 6. Component Data Flow

#### Home Page (`src/pages/Home.tsx`)
```typescript
useAsyncVulnerabilityData() → Chart Components → Visualizations
```

**Data Flow:**
1. Hook provides processed data and processor
2. Chart components receive data via props
3. Charts render visualizations based on data
4. User interactions trigger data filtering

#### Vulnerabilities Page (`src/pages/Vulnerabilities.tsx`)
```typescript
useAsyncVulnerabilityData() → VulnerabilityTable → User Interactions
```

**Data Flow:**
1. Hook provides processed data and processor
2. Table component receives data and processor
3. User interactions (search, filter, sort) call processor methods
4. Processor returns filtered/sorted results
5. Table renders updated data

## 🔍 Search and Filtering Flow

### Search Process
```typescript
User Input → Debounced Search → EfficientDataProcessor.search() → Filtered Results
```

**Search Algorithm:**
1. **Input Processing**: Debounce user input to prevent excessive calls
2. **Index Lookup**: Use search index for O(1) word matching
3. **Filter Application**: Apply additional filters using category indexes
4. **Sorting**: Use pre-sorted arrays for instant sorting
5. **Pagination**: Slice results for current page

### Filtering Process
```typescript
Filter Selection → Index Lookup → Set Intersection → Filtered Results
```

**Filtering Algorithm:**
1. **Index Retrieval**: Get relevant vulnerability indices from filter index
2. **Set Operations**: Perform intersection/union operations for multiple filters
3. **Result Compilation**: Combine filtered indices into result set
4. **Pagination**: Apply pagination to filtered results

## 📈 Performance Data Flow

### Processing Pipeline
```typescript
Raw Data → Processing Time → Cache Check → Index Building → Performance Stats
```

**Performance Metrics:**
- **Processing Time**: Total time for data processing
- **Memory Usage**: Memory consumption during processing
- **Cache Hit Rate**: Cache effectiveness metrics
- **Search Performance**: Query response times

### Monitoring Integration
```typescript
Performance Stats → React State → UI Display → User Feedback
```

**Monitoring Points:**
- Data processing duration
- Cache hit/miss rates
- Search response times
- Memory usage patterns

## 🔄 State Management Flow

### React State Hierarchy
```
App State (Router) → Page State → Component State → UI Rendering
```

**State Layers:**
1. **Global State**: Router state, theme, user preferences
2. **Page State**: Data loading, processing states
3. **Component State**: UI interactions, form states
4. **Hook State**: Data processing, caching states

### State Updates Flow
```typescript
User Action → State Update → Re-render → UI Update
```

**Update Patterns:**
- **Optimistic Updates**: Immediate UI feedback
- **Debounced Updates**: Prevent excessive re-renders
- **Memoized Updates**: Prevent unnecessary recalculations
- **Cached Updates**: Use cached data when available

## 🚀 Lazy Loading Flow

### Code Splitting
```typescript
Route Change → Lazy Component Load → Suspense Fallback → Component Render
```

**Lazy Loading Strategy:**
1. **Route-based Splitting**: Split code by page/route
2. **Component Splitting**: Lazy load heavy components
3. **Data Splitting**: Load data only when needed
4. **Progressive Enhancement**: Load features progressively

### Loading States
```typescript
Loading State → Fallback UI → Data Load → Component Render
```

**Loading Patterns:**
- **Skeleton Loading**: Show content structure while loading
- **Progressive Loading**: Load content in stages
- **Error Boundaries**: Handle loading errors gracefully
- **Retry Logic**: Automatic retry for failed loads

## 🔧 Error Handling Flow

### Error Propagation
```typescript
Error Occurrence → Error Boundary → Error State → User Notification
```

**Error Handling Strategy:**
1. **Error Boundaries**: Catch React component errors
2. **Try-Catch Blocks**: Handle async operation errors
3. **Error States**: Display user-friendly error messages
4. **Retry Mechanisms**: Allow users to retry failed operations

### Recovery Flow
```typescript
Error Detection → Fallback Data → User Notification → Recovery Options
```

**Recovery Patterns:**
- **Cache Fallback**: Use cached data when available
- **Partial Data**: Show available data with error indicators
- **Retry Options**: Provide retry buttons for failed operations
- **Graceful Degradation**: Reduce functionality rather than fail completely

## 📊 Data Visualization Flow

### Chart Data Processing
```typescript
Raw Data → Data Transformation → Chart Configuration → Visualization
```

**Visualization Pipeline:**
1. **Data Extraction**: Extract relevant data for charts
2. **Data Transformation**: Transform data for chart consumption
3. **Chart Configuration**: Configure chart options and styling
4. **Rendering**: Render charts with Recharts library

### Interactive Updates
```typescript
User Interaction → Data Filter → Chart Update → Visual Feedback
```

**Interaction Patterns:**
- **Click to Filter**: Click chart elements to filter data
- **Hover Tooltips**: Show detailed information on hover
- **Zoom and Pan**: Interactive chart navigation
- **Legend Toggle**: Show/hide chart series

## 🔄 Comparison Feature Flow

### Multi-Selection Flow
```typescript
Checkbox Selection → Selection State → Compare Button → Comparison Modal
```

**Comparison Process:**
1. **Selection Management**: Track selected vulnerabilities
2. **Validation**: Ensure minimum selections for comparison
3. **Data Preparation**: Prepare data for side-by-side display
4. **Insight Generation**: Calculate comparison insights
5. **Modal Display**: Show comparison in responsive modal

### Insight Generation
```typescript
Selected Data → Analysis Functions → Insight Calculation → Visual Display
```

**Analysis Types:**
- **Severity Analysis**: Compare severity levels and patterns
- **Time Analysis**: Compare fix times and patterns
- **Package Analysis**: Compare package distributions
- **Risk Analysis**: Compare risk factors and patterns

---

This data flow architecture ensures efficient processing, optimal performance, and excellent user experience even with large datasets.
