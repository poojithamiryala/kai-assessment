import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
