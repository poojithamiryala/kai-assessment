import React, { useMemo, memo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Psychology } from '@mui/icons-material';

interface KaiStatusChartProps {
  kaiStatusDistribution: Record<string, number>;
  title?: string;
}

const KaiStatusChart: React.FC<KaiStatusChartProps> = memo(({
  kaiStatusDistribution,
  title = "Kai Status Distribution"
}) => {
  const theme = useTheme();

  // Converting the distribution object to array format for Recharts library
  const chartData = useMemo(() => {
    if (!kaiStatusDistribution || Object.keys(kaiStatusDistribution).length === 0) {
      return [];
    }
    
    return Object.entries(kaiStatusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [kaiStatusDistribution]);

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().startsWith('invalid')) {
      return '#2e7d32'; // Dark green for invalid statuses
    } else if (status.toLowerCase().startsWith('ai-invalid')) {
      return '#66bb6a'; // Medium green for AI invalid statuses
    } else  {
      return '#f57c00'; // Dark orange for unknown statuses
    }
  };

  const colors = chartData.map(item => getStatusColor(item.name));

  // Custom tooltip matching SeverityChart style for Kai Status Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / totalCount) * 100).toFixed(1);
      return (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'white', 
          border: `1px solid ${theme.palette.grey[300]}`,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000
        }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom legend with counts in column format for Kai Status Chart
  const CustomLegend = ({ payload }: any) => {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5, 
        alignItems: 'flex-start', 
        width: '100%',
        mt: 2
      }}>
        {payload.map((entry: any, index: number) => {
          const dataItem = chartData.find(item => item.name === entry.value);
          const count = dataItem?.value || 0;
          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                justifyContent: 'flex-start',
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {entry.value}: {count.toLocaleString()} ({percentage}%)
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Psychology color="primary" />
          {title}
        </Typography>
        
        <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
          {chartData.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body1">No Kai status data available</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Total Display at Bottom for Kai Status Chart */}
        {chartData.length > 0 && (
          <Box sx={{ 
            mt: 3, 
            textAlign: 'left'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.text.primary
            }}>
              Total: {totalCount.toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

KaiStatusChart.displayName = 'KaiStatusChart';

export default KaiStatusChart;
