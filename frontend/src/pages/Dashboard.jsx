import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp,
  FiCalendar,
  FiTarget
} from 'react-icons/fi';
import ProjectCard from '../components/dashboard/ProjectCard.jsx';
import StatsCard from '../components/dashboard/StatsCard.jsx';
import TaskList from '../components/dashboard/TaskList.jsx';
import { projectsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext.jsx';

const Dashboard = () => {
  console.log('Dashboard component rendering');
  
  const { user, token } = useAuth();
  console.log('Dashboard - Auth context:', { user: !!user, token: !!token });
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("dashboard useEffect triggered");
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check authentication first
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }
        
        console.log('Fetching dashboard data...');
        
        // Test API connection first
        console.log('Testing API connection...');
        try {
          const testResponse = await fetch('/api/health');
          console.log('Health check response:', testResponse.status);
        } catch (testError) {
          console.error('Health check failed:', testError);
        }
        
        // Fetch projects
        console.log('Fetching projects...');
        const projectsResponse = await projectsAPI.getAll();
        console.log('Projects response:', projectsResponse);
        const projects = projectsResponse.data.data || [];
        setProjects(projects);

        // Fetch user's tasks
        console.log('Fetching tasks...');
        const tasksResponse = await tasksAPI.getAssigned();
        console.log('Tasks response:', tasksResponse);
        const tasks = tasksResponse.data.data || [];
        setTasks(tasks);

        // Calculate stats
        const totalProjects = projects.length || 0;
        const activeTasks = tasks.filter(task => task.status !== 'completed').length || 0;
        const completedTasks = tasks.filter(task => task.status === 'completed').length || 0;
        
        console.log('Calculated stats:', { totalProjects, activeTasks, completedTasks });
        
        setStats({
          totalProjects,
          activeTasks,
          completedTasks,
          totalHours: 0 // This would be calculated from time logs
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        console.error('Error status:', error.response?.status);
        
        // Set empty data on error to prevent infinite loading
        setProjects([]);
        setTasks([]);
        setStats({
          totalProjects: 0,
          activeTasks: 0,
          completedTasks: 0,
          totalHours: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  console.log('Dashboard render - loading:', loading, 'projects:', projects.length, 'tasks:', tasks.length);

  // Simple fallback to ensure component renders
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-500 text-white p-4 rounded">
            ⚠️ No user found in Dashboard component. Auth context may not be working.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your projects and tasks.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FiTarget}
            color="blue"
            change="+12%"
            changeType="increase"
          />
          <StatsCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon={FiClock}
            color="orange"
            change="+5%"
            changeType="increase"
          />
          <StatsCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={FiCheckCircle}
            color="green"
            change="+8%"
            changeType="increase"
          />
          <StatsCard
            title="Total Hours"
            value={`${stats.totalHours}h`}
            icon={FiTrendingUp}
            color="purple"
            change="+15%"
            changeType="increase"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                  <a href="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all →
                  </a>
                </div>
                
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FiTarget className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first project.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                  <a href="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all →
                  </a>
                </div>
                
                <TaskList tasks={tasks.slice(0, 5)} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 