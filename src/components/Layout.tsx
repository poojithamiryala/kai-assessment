import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { routes } from '../routes';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Security Vulnerability Dashboard
          </Typography>
          <Navigation routes={routes} />
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, py: 3, px: 3, width: '100vw' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
