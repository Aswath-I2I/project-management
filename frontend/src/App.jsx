import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

// Layout Components
import Layout from './components/layout/Layout.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';

// Page Components
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Tasks from './pages/Tasks.jsx';
import TaskDetail from './pages/TaskDetail.jsx';
import Team from './pages/Team.jsx';
import TimeTracking from './pages/TimeTracking.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Router future={{ v7_startTransition: true }}>
              <div className="App">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  
                  {/* Protected Routes with Layout */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Projects />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/projects/:id" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <ProjectDetail />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Tasks />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/tasks/:id" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <TaskDetail />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/team" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Team />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/time-tracking" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <TimeTracking />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout sidebar={Sidebar} header={Header}>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 