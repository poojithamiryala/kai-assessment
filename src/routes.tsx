import React from 'react';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import type { RouteConfig } from './types/routes';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    title: 'Dashboard'
  },
  {
    path: '/analysis',
    element: Analysis,
    title: 'Analysis'
  }
];
