import React from 'react';
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import Layout from '../components/Layout';
import { useVulnerabilityData } from '../hooks/useVulnerabilityData';

const Home: React.FC = () => {
  const { data, isLoading, error, progress, isStreaming } = useVulnerabilityData();

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

            {/* Statistics Overview */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Data Overview
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Card sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {data.metrics.totalVulnerabilities.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Vulnerabilities
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <CardContent>
                    <Typography variant="h4" color="error" gutterBottom>
                      {(data.metrics.severityDistribution.critical || 0) + (data.metrics.severityDistribution.high || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Risk
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <CardContent>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {data.metrics.groupCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Groups
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <CardContent>
                    <Typography variant="h4" color="info.main" gutterBottom>
                      {data.metrics.repoCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Repositories
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Severity Distribution */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Severity Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(data.metrics.severityDistribution).map(([severity, count]) => (
                  <Chip
                    key={severity}
                    label={`${severity}: ${(count as number).toLocaleString()}`}
                    color={severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Kai Status Distribution */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Kai Status Distribution
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(data.metrics.kaiStatusDistribution).map(([status, count]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${(count as number).toLocaleString()}`}
                    color={status.includes('invalid') ? 'success' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

          </>
        )}
      </Container>
    </Layout>
  );
};

export default Home;
