import React from 'react';
import { Button, Box, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RouteConfig } from '../types/routes';

interface NavigationProps {
  routes: RouteConfig[];
}

const Navigation: React.FC<NavigationProps> = ({ routes }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {routes.map((route) => (
        <Button
          key={route.path}
          color="inherit"
          onClick={() => navigate(route.path)}
          variant={location.pathname === route.path ? 'contained' : 'text'}
          sx={{
            backgroundColor: location.pathname === route.path 
              ? theme.palette.custom.button.active
              : 'transparent',
            border: location.pathname === route.path 
              ? `1px solid ${theme.palette.custom.button.border}`
              : '1px solid transparent',
            '&:hover': {
              backgroundColor: `${theme.palette.custom.button.hover} !important`,
              border: `1px solid ${theme.palette.custom.button.border} !important`,
            },
          }}
        >
          {route.title}
        </Button>
      ))}
    </Box>
  );
};

export default Navigation;
