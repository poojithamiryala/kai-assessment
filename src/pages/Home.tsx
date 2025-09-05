import React from 'react';
import { Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import Layout from '../components/Layout';
import { useVulnerabilityData } from '../hooks/useVulnerabilityData';

const Home: React.FC = () => {
  const { data, isLoading, error } = useVulnerabilityData();

  return (
    <Layout>
      <Box>
        
        {isLoading && (
          <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading vulnerability data... 
            </Typography>
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
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Loaded Successfully!
            </Typography>
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default Home;
