import Home from './pages/Home';
import type { RouteConfig } from './types/routes';

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: Home,
    title: 'Dashboard'
  }
];
