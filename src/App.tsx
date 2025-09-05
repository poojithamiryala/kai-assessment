import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { routes } from './routes';
import { theme } from './theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
      retry: 2, // Retry failed requests 2 times
      retryDelay: 1000, // Wait 1 second between retries
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
