// Enhanced API service with optimized vulnerability processing
import { createVulnerabilityProcessor } from '../utils/vulnerabilityProcessor';
import type {
  VulnerabilityData,
  OptimizedVulnerabilityApiResponse,
} from '../types/vulnerability';

// Enhanced fetch function with optimized processing
export const fetchVulnerabilityDataProcessor = async (
  onProgress?: (progress: number) => void
): Promise<OptimizedVulnerabilityApiResponse> => {
  try {
    console.log('Starting optimized data fetch...');

    const response = await fetch('/ui_demo.json'); // using fetch instead of axios as it is more efficient for large files as response.body is a readable stream
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';

    // Streaming data
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      loaded += value.length;
      buffer += new TextDecoder().decode(value, { stream: true });

      // Reporting progress
      if (onProgress && total > 0) {
        const downloadProgress = Math.round((loaded / total) * 70); // allocating 70% for download and 30% for processing
        onProgress(downloadProgress);
      }
    }

    console.log('Download completed, parsing JSON...');

    // Parsing JSON
    // TODO have to check if this is the best way to parse the JSON to avoid memory issues 
    // TODO also check if there is any other way instead of loading the entire file into memory
    const rawData: VulnerabilityData = JSON.parse(buffer);

    console.log('JSON parsed, processing data...');

    // Creating processor and processing data
    const processor = createVulnerabilityProcessor();
    await processor.processRawData(rawData, (progress) => {
      if (onProgress) {
        // 70-100% for processing
        onProgress(70 + Math.round(progress * 0.3));
      }
    });

    console.log('Optimized processing completed!');

    // Get metrics and statistics
    const metrics = processor.getMetrics();

    // Clear the buffer to free memory
    buffer = '';

    return {
      rawData,
      processor,
      metrics,
    };
  } catch (error) {
    console.error('Error in optimized data fetch:', error);
    throw new Error('Failed to load vulnerability data efficiently');
  }
};

// Export the main fetch function
export const fetchVulnerabilityData = fetchVulnerabilityDataProcessor;
