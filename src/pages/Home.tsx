import React, { useState, useMemo } from 'react';
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  Container,
  useTheme,
} from '@mui/material';
import {
  Security,
  Psychology,
  FilterList,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import SeverityChart from '../components/SeverityChart';
import { useVulnerabilityData } from '../hooks/useVulnerabilityData';

const Home: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error, progress, isStreaming } = useVulnerabilityData();
  const [activeFilter, setActiveFilter] = useState<'none' | 'analysis' | 'ai-analysis'>('none');

  // Fetching pre-calculated filtered metrics from processor
  const filteredMetrics = useMemo(() => {
    if (!data?.processor) return null;

    switch (activeFilter) {
      case 'analysis':
        return data.processor.getAnalysisFilteredMetrics();
      case 'ai-analysis':
        return data.processor.getAiAnalysisFilteredMetrics();
      default:
        return data.metrics;
    }
  }, [data?.processor, data?.metrics, activeFilter]);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>

        {isLoading && (
          <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading data...
            </Typography>
            {isStreaming && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {progress}% complete
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {error && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Alert severity="error">
              Error loading vulnerability data: {error.message}
            </Alert>
          </Paper>
        )}

        {data && (
          <>
            {/* Filter Buttons */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Vulnerability Analysis Tools
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Button
                  variant={activeFilter === 'analysis' ? 'contained' : 'outlined'}
                  onClick={() => setActiveFilter(activeFilter === 'analysis' ? 'none' : 'analysis')}
                  startIcon={<Security />}
                  sx={{
                    background: activeFilter === 'analysis'
                      ? theme.palette.custom.gradients.analysis
                      : 'transparent',
                    color: activeFilter === 'analysis' ? 'white' : 'primary.main',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: activeFilter === 'analysis'
                      ? theme.palette.custom.shadows.analysis.active
                      : theme.palette.custom.shadows.button.default,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: activeFilter === 'analysis'
                        ? theme.palette.custom.gradients.analysisHover
                        : theme.palette.custom.gradients.analysisInactive,
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.custom.shadows.analysis.hover,
                    },
                  }}
                >
                  Analysis Filter
                </Button>

                <Button
                  variant={activeFilter === 'ai-analysis' ? 'contained' : 'outlined'}
                  onClick={() => setActiveFilter(activeFilter === 'ai-analysis' ? 'none' : 'ai-analysis')}
                  startIcon={<Psychology />}
                  sx={{
                    background: activeFilter === 'ai-analysis'
                      ? theme.palette.custom.gradients.aiAnalysis
                      : 'transparent',
                    color: activeFilter === 'ai-analysis' ? 'white' : 'secondary.main',
                    border: '2px solid',
                    borderColor: 'secondary.main',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: activeFilter === 'ai-analysis'
                      ? theme.palette.custom.shadows.aiAnalysis.active
                      : theme.palette.custom.shadows.button.default,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: activeFilter === 'ai-analysis'
                        ? theme.palette.custom.gradients.aiAnalysisHover
                        : theme.palette.custom.gradients.aiAnalysisInactive,
                      borderColor: 'secondary.main', // Keep secondary border color on hover
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.custom.shadows.aiAnalysis.hover,
                    },
                  }}
                >
                  AI Analysis Filter
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setActiveFilter('none')}
                  startIcon={<FilterList />}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    border: '2px solid',
                    borderColor: 'grey.400',
                    color: 'grey.600',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'grey.600',
                      color: 'grey.800',
                      backgroundColor: 'grey.50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>

            {/* Statistics Overview */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Data Overview {activeFilter !== 'none' && `(${activeFilter.replace('-', ' ')} filtered)`}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                {/* Total Vulnerabilities */}
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }
                }}>
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {filteredMetrics?.totalVulnerabilities.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Total Vulnerabilities
                        </Typography>
                      </Box>

                    </Box>
                  </CardContent>
                </Card>

                {/* High Risk Vulnerabilities */}
                <Card sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }
                }}>
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {(filteredMetrics?.severityDistribution.critical || 0) + (filteredMetrics?.severityDistribution.high || 0)}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          High Risk Vulnerabilities
                        </Typography>
                      </Box>

                    </Box>

                  </CardContent>
                </Card>

                {/* Groups */}
                <Card sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }
                }}>
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {filteredMetrics?.groupCount || data.metrics.groupCount}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Security Groups
                        </Typography>
                      </Box>

                    </Box>
                  </CardContent>
                </Card>

                {/* Repositories */}
                <Card sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                  }
                }}>
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {filteredMetrics?.repoCount || data.metrics.repoCount}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Repositories
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Severity Distribution Chart */}
            <Box sx={{ mb: 4 }}>
              <SeverityChart 
                metrics={filteredMetrics || data.metrics} 
                title={activeFilter !== 'none' ? `${activeFilter.replace('-', ' ')} Filtered Severity` : "Severity Distribution"}
              />
            </Box>

            {/* Kai Status Distribution */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Kai Status Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(filteredMetrics?.kaiStatusDistribution || {}).map(([status, count]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${(count as number).toLocaleString()}`}
                    color={status.includes('invalid') ? 'success' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Filter Impact */}
            {activeFilter !== 'none' && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  Filter Impact
                </Typography>
                <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                  <Typography variant="h6" gutterBottom>
                    {activeFilter === 'analysis' ? 'Analysis Filter Applied' : 'AI Analysis Filter Applied'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {activeFilter === 'analysis'
                      ? 'Showing vulnerabilities that are marked as "invalid - norisk"'
                      : 'Showing vulnerabilities that are marked as "ai-invalid-norisk"'
                    }
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      label={`Original: ${data.metrics.totalVulnerabilities.toLocaleString()}`}
                      color="default"
                      variant="outlined"
                    />
                    <Chip
                      label={`Filtered: ${filteredMetrics?.totalVulnerabilities.toLocaleString() || 0}`}
                      color="primary"
                      variant="filled"
                    />
                    <Chip
                      label={`Reduction: ${((data.metrics.totalVulnerabilities - (filteredMetrics?.totalVulnerabilities || 0)) / data.metrics.totalVulnerabilities * 100).toFixed(1)}%`}
                      color="success"
                      variant="filled"
                    />
                  </Box>
                </Paper>
              </Box>
            )}

          </>
        )}
      </Container>
    </Layout>
  );
};

export default Home;
