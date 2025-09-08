import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { Download, Refresh, CompareArrows } from '@mui/icons-material';
import Layout from '../components/Layout';
import VulnerabilityTable from '../components/VulnerabilityTable';
import VulnerabilityDetail from '../components/VulnerabilityDetail';
import VulnerabilityComparator from '../components/VulnerabilityComparator';
import { useAsyncVulnerabilityData } from '../hooks/useAsyncVulnerabilityData';
import type { OptimizedVulnerability } from '../types/vulnerability';

/**
 * Helper functions for exporting vulnerability data to CSV format
 * These make it easy for users to download and analyze data in Excel or other tools
 */

// Converts vulnerability data into CSV format that Excel can understand
const convertToCSV = (data: OptimizedVulnerability[]): string => {
  if (data.length === 0) return '';
  
  const headers = ['CVE', 'Severity', 'Package', 'Published', 'Fix Date', 'Kai Status', 'Image', 'Repo'];
  const rows = data.map(vuln => [
    vuln.cve,
    vuln.severity,
    vuln.imageName,
    vuln.published,
    vuln.fixDate,
    vuln.kaiStatus,
    vuln.imageName,
    vuln.repoName
  ]);
  
  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};

// Creates a downloadable file and triggers the browser's download dialog
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Vulnerabilities Page Component
 * 
 * This is the main page where users can view, search, and interact with all vulnerability data.
 * It shows a comprehensive table with filtering, sorting, and detailed views.
 * 
 * Key features:
 * - Displays all vulnerabilities in a searchable, sortable table
 * - Shows loading states while data is being processed
 * - Provides export functionality for data analysis
 * - Includes cache management for better performance
 * - Opens detailed vulnerability information in a modal
 */
const Vulnerabilities: React.FC = () => {
  // Get all the data and controls we need from our custom hook
  // This hook handles caching, loading states, and data processing automatically
  const { 
    vulnerabilities, 
    dataProcessor, 
    performanceStats, 
    isLoading, 
    error, 
    progress, 
    isStreaming,
    refreshData,
    clearCache,
    cacheInfo
  } = useAsyncVulnerabilityData();
  
  // State for showing detailed vulnerability information in a popup modal
  const [selectedVulnerability, setSelectedVulnerability] = useState<OptimizedVulnerability | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // State for vulnerability comparator
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<OptimizedVulnerability[]>([]);
  const [comparatorOpen, setComparatorOpen] = useState(false);

  // When a user clicks on a vulnerability row, show the detailed information
  const handleRowClick = (vulnerability: OptimizedVulnerability) => {
    setSelectedVulnerability(vulnerability);
    setDetailModalOpen(true);
  };

  // Close the detail modal and clear the selected vulnerability
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedVulnerability(null);
  };

  // Handle selection changes from the table
  const handleSelectionChange = (selectedIds: string[]) => {
    const selectedVulns = vulnerabilities.filter(vuln => selectedIds.includes(vuln.id));
    setSelectedVulnerabilities(selectedVulns);
  };

  // Open comparator with selected vulnerabilities
  const handleOpenComparator = () => {
    if (selectedVulnerabilities.length >= 2) {
      setComparatorOpen(true);
    }
  };

  // Close comparator
  const handleCloseComparator = () => {
    setComparatorOpen(false);
  };

  // Show a nice loading screen while we're getting the data
  // This keeps the navbar visible so users can still navigate
  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
          }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Loading Vulnerability Data
            </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {cacheInfo.hasCache && cacheInfo.isValid 
            ? 'Loading cached vulnerability data...' 
            : 'Please wait while we process the vulnerability information...'
          }
        </Typography>
            {isStreaming && (
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Progress: {progress}% complete
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  backgroundColor: 'grey.200', 
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Layout>
    );
  }

  // If something went wrong, show a helpful error message
  if (error) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Error Loading Vulnerability Data
              </Typography>
              <Typography variant="body2">
                {error.message}
              </Typography>
            </Alert>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }

  // Everything looks good! Show the main vulnerability table and controls
  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Vulnerability Management
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive view of all vulnerabilities with advanced filtering, sorting, and search capabilities.
        </Typography>

        {/* Show some quick stats about the vulnerabilities we found */}
        {performanceStats && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`${performanceStats.totalVulnerabilities.toLocaleString()} Total Vulnerabilities`}
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.9rem', fontWeight: 600 }}
              />
              <Chip 
                label={`Critical: ${performanceStats.severityBreakdown.critical || 0}`}
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.9rem' }}
              />
              <Chip 
                label={`High: ${performanceStats.severityBreakdown.high || 0}`}
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.9rem' }}
              />
              <Chip 
                label={`Medium: ${performanceStats.severityBreakdown.medium || 0}`}
                color="info"
                variant="outlined"
                sx={{ fontSize: '0.9rem' }}
              />
              <Chip 
                label={`Low: ${performanceStats.severityBreakdown.low || 0}`}
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.9rem' }}
              />
            </Box>
            
            {/* Action buttons for data management */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Download all vulnerability data as a CSV file for analysis */}
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  const csv = convertToCSV(vulnerabilities);
                  downloadCSV(csv, `vulnerabilities_${new Date().toISOString().split('T')[0]}.csv`);
                }}
                sx={{ borderRadius: '8px' }}
              >
                Export All Data
              </Button>
              {/* Force refresh to get the latest data from the server */}
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refreshData}
                sx={{ borderRadius: '8px' }}
              >
                Refresh Data
              </Button>
              {/* Clear the cache to free up memory (useful for debugging) */}
              <Button
                variant="outlined"
                onClick={clearCache}
                sx={{ borderRadius: '8px' }}
                color="secondary"
              >
                Clear Cache
              </Button>
              
              {/* Compare selected vulnerabilities */}
              <Button
                variant="contained"
                startIcon={<CompareArrows />}
                onClick={handleOpenComparator}
                disabled={selectedVulnerabilities.length < 2}
                sx={{ borderRadius: '8px' }}
                color="primary"
              >
                Compare ({selectedVulnerabilities.length})
              </Button>
              
              {/* Cache Status */}
              {cacheInfo.hasCache && (
                <Chip
                  label={`Cached: ${cacheInfo.size.toLocaleString()} items`}
                  color={cacheInfo.isValid ? 'success' : 'warning'}
                  size="small"
                  sx={{ borderRadius: '8px' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* The main vulnerability table - this is where all the magic happens */}
        {vulnerabilities.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            {/* Pass all the data to our smart table component */}
            <VulnerabilityTable 
              vulnerabilities={vulnerabilities}
              onRowClick={handleRowClick}
              dataProcessor={dataProcessor}
              onSelectionChange={handleSelectionChange}
            />
          </Box>
        ) : (
          /* If we don't have any vulnerabilities to show, let the user know */
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Vulnerabilities Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No vulnerabilities were found in the current dataset.
            </Typography>
          </Paper>
        )}

        {/* Popup modal that shows detailed vulnerability information when a row is clicked */}
        <VulnerabilityDetail
          vulnerability={selectedVulnerability}
          open={detailModalOpen}
          onClose={handleCloseModal}
        />
        
        {/* Vulnerability comparator modal */}
        <VulnerabilityComparator
          vulnerabilities={selectedVulnerabilities}
          open={comparatorOpen}
          onClose={handleCloseComparator}
        />
      </Container>
    </Layout>
  );
};

export default Vulnerabilities;
