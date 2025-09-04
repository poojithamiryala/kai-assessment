import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { routes } from './routes';
import { theme } from './theme';

function App() {
  return (
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
  );
}

export default App;
