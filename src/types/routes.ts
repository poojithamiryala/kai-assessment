import React from 'react';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title: string;
}
