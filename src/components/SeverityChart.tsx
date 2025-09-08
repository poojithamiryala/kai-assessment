import React, { useMemo, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Security } from '@mui/icons-material';
import type { DataMetrics } from '../types/vulnerability';

interface SeverityChartProps {
  metrics: DataMetrics;
  title?: string;
}



const SeverityChart: React.FC<SeverityChartProps> = memo(({
  metrics,
  title = "Severity Distribution"
}) => {
  const theme = useTheme();


  // Prepare data for chart
  const chartData = useMemo(() => {
    if (!metrics.severityDistribution || Object.keys(metrics.severityDistribution).length === 0) {
      return [];
    }
    
    return Object.entries(metrics.severityDistribution).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      percentage: ((count / metrics.totalVulnerabilities) * 100).toFixed(1),
    }));
  }, [metrics.severityDistribution, metrics.totalVulnerabilities]);

  // Color mapping based on severity labels
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.success.main;
      case 'negligible':
        return theme.palette.grey[400];
      default:
        return theme.palette.primary.main;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'white', 
          border: `1px solid ${theme.palette.grey[300]}`,
          borderRadius: 1,
          boxShadow: 2
        }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {payload[0].value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {((payload[0].value / metrics.totalVulnerabilities) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Security color="primary" />
          {title}
        </Typography>
        
        <Box sx={{ height: 300 }}>
          {chartData.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body1">No severity data available</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: theme.palette.text.primary }}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: theme.palette.text.primary }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  label={{ position: 'right' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSeverityColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

SeverityChart.displayName = 'SeverityChart';

export default SeverityChart;
