import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Chip,
  useTheme,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  TrendingUp,
  ShowChart,
  AreaChart as AreaChartIcon,
  ZoomIn,
  ZoomOut,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import type { DataMetrics } from '../types/vulnerability';

interface FixTrendChartProps {
  metrics: DataMetrics;
  title?: string;
}

type ChartType = 'line' | 'area';

const FixTrendChart: React.FC<FixTrendChartProps> = ({
  metrics,
  title = "Fix Trend - Fixed CVEs Over Time"
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 100]);
  const [showBrush] = useState(true);

  // Get available severities from data
  const availableSeverities = useMemo(() => {
    if (!metrics.fixTrend || Object.keys(metrics.fixTrend).length === 0) return [];
    return Array.from(new Set(
      Object.values(metrics.fixTrend)
        .flatMap(severities => Object.keys(severities))
    ));
  }, [metrics.fixTrend]);

  // Initialize visible series when severities change
  useEffect(() => {
    if (availableSeverities.length > 0) {
      const newVisibleSeries: Record<string, boolean> = {};
      availableSeverities.forEach(severity => {
        newVisibleSeries[severity] = visibleSeries[severity] !== undefined ? visibleSeries[severity] : true;
      });
      setVisibleSeries(newVisibleSeries);
    }
  }, [availableSeverities]);

  // Process fix trend data
  const chartData = useMemo(() => {
    if (!metrics.fixTrend || Object.keys(metrics.fixTrend).length === 0) return [];

    // Convert month -> severity -> count mapping to chart data format
    const processedData = Object.entries(metrics.fixTrend)
      .map(([month, severities]) => ({
        month,
        ...severities,
        total: Object.values(severities).reduce((sum, count) => sum + count, 0),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Ensure all months have all severity levels (fill gaps with 0)
    const filledData = processedData.map((item: any) => {
      const filledItem = { ...item };
      availableSeverities.forEach((severity: string) => {
        if ((filledItem as any)[severity] === undefined) {
          (filledItem as any)[severity] = 0;
        }
      });
      return filledItem;
    });

    // Apply zoom range
    const startIndex = Math.floor((filledData.length * zoomRange[0]) / 100);
    const endIndex = Math.ceil((filledData.length * zoomRange[1]) / 100);
    return filledData.slice(startIndex, endIndex);
  }, [metrics.fixTrend, zoomRange, availableSeverities]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: '#d32f2f',
      high: '#f57c00',
      medium: '#fbc02d',
      low: '#388e3c',
    };
    return colors[severity] || theme.palette.grey[500];
  };

  // Handle series toggle
  const handleSeriesToggle = (severity: string) => {
    setVisibleSeries(prev => ({
      ...prev,
      [severity]: !prev[severity]
    }));
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    const range = zoomRange[1] - zoomRange[0];
    const newRange = Math.max(10, range * 0.8);
    const center = (zoomRange[0] + zoomRange[1]) / 2;
    setZoomRange([
      Math.max(0, center - newRange / 2),
      Math.min(100, center + newRange / 2)
    ]);
  };

  const handleZoomOut = () => {
    const range = zoomRange[1] - zoomRange[0];
    const newRange = Math.min(100, range * 1.2);
    const center = (zoomRange[0] + zoomRange[1]) / 2;
    setZoomRange([
      Math.max(0, center - newRange / 2),
      Math.min(100, center + newRange / 2)
    ]);
  };

  const handleResetZoom = () => {
    setZoomRange([0, 100]);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
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
          {payload.map((item: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.dataKey}: {item.value.toLocaleString()}
              </Typography>
            </Box>
          ))}
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
            Total: {total.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary">
            Metrics not available for fix trend analysis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            Fix Trend - Fixed CVEs Over Time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MuiTooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Reset View">
              <IconButton onClick={handleResetZoom} size="small">
                <Refresh />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Shows number of vulnerabilities fixed each month.
          </Typography>
        </Box>

        {/* Chart Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Chart Type:
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setChartType('line')}
              variant={chartType === 'line' ? 'contained' : 'outlined'}
              startIcon={<ShowChart />}
            >
              Line Chart
            </Button>
            <Button
              onClick={() => setChartType('area')}
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              startIcon={<AreaChartIcon />}
            >
              Area Chart
            </Button>
          </ButtonGroup>
        </Box>

        {/* Interactive Series Controls */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
            Series:
          </Typography>
          {availableSeverities.map(severity => (
            <Chip
              key={`fix-${severity}`}
              label={severity.charAt(0).toUpperCase() + severity.slice(1)}
              size="small"
              onClick={() => handleSeriesToggle(severity)}
              icon={visibleSeries[severity] ? <Visibility /> : <VisibilityOff />}
              sx={{
                backgroundColor: visibleSeries[severity] ? getSeverityColor(severity) : theme.palette.grey[300],
                color: visibleSeries[severity] ? 'white' : theme.palette.text.secondary,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: visibleSeries[severity] ? getSeverityColor(severity) : theme.palette.grey[400],
                }
              }}
            />
          ))}
        </Box>


        {/* Chart */}
        <Box sx={{ height: 400, mb: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'CVEs Fixed', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {showBrush && <Brush dataKey="month" height={30} />}
                {availableSeverities.map(severity => (
                  visibleSeries[severity] && (
                    <Line
                      key={`fix-line-${severity}`}
                      type="monotone"
                      dataKey={severity}
                      stroke={getSeverityColor(severity)}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                      connectNulls={false}
                      isAnimationActive={true}
                    />
                  )
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'CVEs Fixed', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {showBrush && <Brush dataKey="month" height={30} />}
                {availableSeverities.map(severity => (
                  visibleSeries[severity] && (
                    <Area
                      key={`fix-area-${severity}`}
                      type="monotone"
                      dataKey={severity}
                      stackId="1"
                      stroke={getSeverityColor(severity)}
                      fill={getSeverityColor(severity)}
                      fillOpacity={0.6}
                      strokeWidth={2}
                      connectNulls={false}
                      isAnimationActive={true}
                    />
                  )
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Box>

      </CardContent>
    </Card>
  );
};

export default FixTrendChart;
