import React from 'react';
import { Typography } from '@mui/material';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <Typography variant="body1">
        Welcome to the vulnerability analysis dashboard. This tool helps you analyze and visualize security vulnerabilities in your software ecosystem.
      </Typography>
    </Layout>
  );
};

export default Home;
