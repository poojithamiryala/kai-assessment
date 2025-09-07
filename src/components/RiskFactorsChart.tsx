import React, { useMemo, memo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  IconButton,
  Tooltip as MuiTooltip,
  Chip,
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
import { Warning, TrendingUp, TrendingDown, FilterList } from '@mui/icons-material';
import type { DataMetrics } from '../types/vulnerability';

interface RiskFactorsChartProps {
  metrics: DataMetrics;
  title?: string;
  filters?: {
    riskFactors: string[];
    sortBy: 'count' | 'name';
    sortOrder: 'asc' | 'desc';
  };
  onBarClick?: (data: any) => void;
}

const RiskFactorsChart: React.FC<RiskFactorsChartProps> = memo(({
  metrics,
  title = "Risk Factors Frequency",
  filters,
  onBarClick,
}) => {
  const theme = useTheme();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Preparing data for risk factors chart - using real vulnerability data
  const chartData = useMemo(() => {
    if (!metrics.riskFactorDistribution || Object.keys(metrics.riskFactorDistribution).length === 0) {
      console.log('No risk factor distribution data available');
      return [];
    }
    
    console.log('Risk factor distribution:', metrics.riskFactorDistribution);
    
    let data = Object.entries(metrics.riskFactorDistribution).map(([riskFactor, count]) => ({
      name: riskFactor,
      count,
    }));

    console.log('Processing chart data:', data);

    // Apply risk factor filter
    if (filters?.riskFactors && filters.riskFactors.length > 0) {
      data = data.filter(item => filters.riskFactors.includes(item.name));
    }

    // Applying sorting
    const currentSortBy = filters?.sortBy || 'count';
    const currentSortOrder = filters?.sortOrder || sortOrder;
    
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (currentSortBy) {
        case 'count':
          aValue = a.count;
          bValue = b.count;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.count;
          bValue = b.count;
      }
      
      if (currentSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [metrics.riskFactorDistribution, metrics.totalVulnerabilities, filters, sortOrder]);

  const getRiskFactorColor = (factorName: string) => {
    const colors = [
      theme.palette.error.main,      // Red
      theme.palette.warning.main,    // Orange  
      theme.palette.info.main,       // Blue
      theme.palette.success.main,    // Green
      theme.palette.secondary.main,  // Purple
      theme.palette.grey[600],       // Gray
      theme.palette.primary.light,   // Light Blue
      theme.palette.error.light,     // Light Red
      theme.palette.warning.light,   // Light Orange
      theme.palette.info.light,      // Light Blue
    ];
    
    let hash = 0;
    for (let i = 0; i < factorName.length; i++) {
      hash = ((hash << 5) - hash + factorName.charCodeAt(i)) & 0xffffffff;
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
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
        </Box>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onBarClick) {
      onBarClick(data);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="primary" />
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {filters?.riskFactors && filters.riskFactors.length > 0 && (
              <Chip
                icon={<FilterList />}
                label={`${filters.riskFactors.length} filter${filters.riskFactors.length > 1 ? 's' : ''}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
            <MuiTooltip title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
              <IconButton onClick={toggleSort} size="small">
                {getSortIcon()}
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
        
        <Box sx={{ height: 300 }}>
          {chartData.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body1">No risk factor data available</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: theme.palette.text.primary }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: theme.palette.text.primary }}
                  width={200}
                  interval={0}
                />
                <Tooltip content={CustomTooltip} />
                <Bar 
                  dataKey="count" 
                  onClick={handleBarClick}
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskFactorColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Chart Statistics */}
        {chartData.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {chartData.length} risk factor{chartData.length > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()} vulnerabilities
            </Typography>
          </Box>
        )}

        {/* Debug: Show all available risk factors */}
        {metrics.riskFactorDistribution && Object.keys(metrics.riskFactorDistribution).length > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              Available Risk Factors ({Object.keys(metrics.riskFactorDistribution).length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(metrics.riskFactorDistribution).map(([factor, count]) => (
                <Chip
                  key={factor}
                  label={`${factor}: ${count}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

RiskFactorsChart.displayName = 'RiskFactorsChart';

export default RiskFactorsChart;
