import React from 'react';
import Home from './pages/Home';
import Analysis from './pages/Analysis';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title: string;
}

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
