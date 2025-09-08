import React, { Suspense } from 'react';
import Home from './pages/Home';
import Layout from './components/Layout';
import LoadingFallback from './components/LoadingFallback';
import type { RouteConfig } from './types/routes';

// Lazy loading the Vulnerabilities page for better performance
const Vulnerabilities = React.lazy(() => import('./pages/Vulnerabilities'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    title: 'Dashboard'
  },
  {
    path: '/vulnerabilities',
    element: () => (
      <Suspense fallback={
        <Layout>
          <LoadingFallback message="Loading vulnerability data..." />
        </Layout>
      }>
        <Vulnerabilities />
      </Suspense>
    ),
    title: 'Vulnerabilities'
  }
];
