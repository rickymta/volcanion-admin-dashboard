import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import config, { logConfig } from './config';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ApiExamplePage from './pages/Examples/ApiExamplePage';
import ApiVersioningDemo from './pages/Examples/ApiVersioningDemo';
import ApiConnectionTester from './pages/Examples/ApiConnectionTester';
import Users from './pages/Users/UsersNew';
import Services from './pages/Services/Services';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/SettingsNew';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';

function App() {
  // Log configuration in development
  React.useEffect(() => {
    logConfig();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/api-versioning-demo" element={<ApiVersioningDemo />} />
                      <Route path="/api-connection-tester" element={<ApiConnectionTester />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
