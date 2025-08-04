import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, milestonesAPI, teamAPI, tasksAPI } from '../services/api';
import { FiArrowLeft, FiEdit, FiPlus, FiUser, FiTrash2, FiCheckSquare, FiClock, FiUsers, FiFlag, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MilestoneModal from '../components/milestones/MilestoneModal';
import TeamMemberModal from '../components/team/TeamMemberModal';
import MilestoneStatusUpdate from '../components/milestones/MilestoneStatusUpdate';
import ProjectModal from '../components/projects/ProjectModal';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetail from '../components/tasks/TaskDetail';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { canAddTeamMembers, canManageMilestones, canEditProject, getRoleDisplayName, getRoleColor } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [milestoneLoading, setMilestoneLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestoneError, setMilestoneError] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [taskError, setTaskError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  
  // Modal states
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Delete confirmation modal states
  const [deleteMilestoneModal, setDeleteMilestoneModal] = useState({ isOpen: false, milestone: null });
  const [deleteTeamMemberModal, setDeleteTeamMemberModal] = useState({ isOpen: false, member: null });

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getById(id);
      setProject(response.data.data);
    } catch (err) {
      setError('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      setMilestoneLoading(true);
      setMilestoneError(null);
      const response = await milestonesAPI.getByProject(id);
      setMilestones(response.data.data || []);
    } catch (err) {
      setMilestoneError('Failed to fetch milestones');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      const response = await teamAPI.getProjectTeam(id);
      const teamData = response.data.data || [];
      setTeamMembers(teamData);
      
      // Get current user's role in the project
      try {
        const roleResponse = await teamAPI.getCurrentUserRole(id);
        setCurrentUserRole(roleResponse.data.data);
      } catch (roleError) {
        console.log('Could not fetch user role:', roleError);
        setCurrentUserRole(null);
      }
    } catch (err) {
      setTeamError('Failed to fetch team members');
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTaskLoading(true);
      setTaskError(null);
      const response = await tasksAPI.getByProject(id);
      setTasks(response.data.data || []);
    } catch (err) {
      setTaskError('Failed to fetch tasks');
    } finally {
      setTaskLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await teamAPI.getAssignableUsers();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    fetchMilestones();
  }, [id]);

  useEffect(() => {
    fetchTeamMembers();
  }, [id]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [id]);

  const handleCreateMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleDeleteMilestone = async (milestone) => {
    setDeleteMilestoneModal({ isOpen: true, milestone: milestone });
  };

  const handleMilestoneSuccess = () => {
    fetchMilestones();
  };

  const handleTeamSuccess = () => {
    fetchTeamMembers();
  };

  const onProjectUpdate = (updatedProject) => {
    setProject(updatedProject);
    toast.success('Project updated successfully!');
  };

  const handleRemoveTeamMember = async (member) => {
    setDeleteTeamMemberModal({ isOpen: true, member: member });
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };


  const handleTaskSuccess = () => {
    fetchTasks();
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleTaskProgressUpdate = async (taskId, newProgress) => {
    try {
      await tasksAPI.updateProgress(taskId, newProgress);
      toast.success('Task progress updated successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task progress');
    }
  };

  const handleTaskPriorityUpdate = async (taskId, newPriority) => {
    try {
      await tasksAPI.updatePriority(taskId, newPriority);
      toast.success('Task priority updated successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task priority');
    }
  };

  const handleTaskAssign = async (taskId, userId) => {
    try {
      await tasksAPI.assignTask(taskId, userId);
      toast.success('Task assigned successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    try {
      await tasksAPI.delete(selectedTask.id);
      toast.success('Task deleted successfully!');
      setShowTaskDetail(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidProgressPercentage = (percentage) => {
    return Math.min(Math.max(percentage || 0, 0), 100);
  };

  const tabs = [
    { id: 'milestones', label: 'Milestones', icon: FiFlag },
    { id: 'team', label: 'Team Members', icon: FiUsers },
    { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
    { id: 'activity', label: 'Recent Activities', icon: FiClock }
  ];

  const renderMilestonesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Project Milestones</h2>
        {canManageMilestones(currentUserRole) && (
          <button 
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
            onClick={handleCreateMilestone}
          >
            <FiPlus className="mr-1" /> Add Milestone
          </button>
        )}
      </div>
      {milestoneLoading ? (
        <div className="text-center py-8">Loading milestones...</div>
      ) : milestoneError ? (
        <div className="text-red-500 text-center py-8">{milestoneError}</div>
      ) : milestones.length === 0 ? (
        <div className="text-gray-500 italic text-center py-8">No milestones found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                {canManageMilestones(currentUserRole) && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {milestones.map((ms) => (
                <tr key={ms.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2 font-medium">{ms.name}</td>
                  <td className="px-4 py-2">{ms.due_date ? new Date(ms.due_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2">
                    {canManageMilestones(currentUserRole) ? (
                      <MilestoneStatusUpdate 
                        milestone={ms} 
                        onUpdate={fetchMilestones}
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ms.status)}`}>
                        {ms.status}
                      </span>
                    )}
                  </td>
                  {canManageMilestones(currentUserRole) && (
                    <td className="px-4 py-2 flex gap-2">
                      <button 
                        className="p-1 text-green-600 hover:text-green-800" 
                        onClick={() => handleEditMilestone(ms)}
                        title="Edit milestone"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800" 
                        onClick={() => handleDeleteMilestone(ms)}
                        title="Delete milestone"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTeamTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Team Members</h2>
        {canAddTeamMembers(currentUserRole) && (
          <button 
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
            onClick={() => setIsTeamModalOpen(true)}
          >
            <FiPlus className="mr-1" /> Add Member
          </button>
        )}
      </div>
      {teamLoading ? (
        <div className="text-center py-8">Loading team members...</div>
      ) : teamError ? (
        <div className="text-red-500 text-center py-8">{teamError}</div>
      ) : teamMembers.length === 0 ? (
        <div className="text-gray-500 italic text-center py-8">No team members found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Email</th>
                {canAddTeamMembers(currentUserRole) && (
                  <th className="px-4 py-2 text-left">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FiUser className="text-blue-600" />
                      </div>
                      <span className="font-medium">{member.first_name} {member.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(member.role)}`}>
                      {getRoleDisplayName(member.role || 'member')}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{member.email}</td>
                  {canAddTeamMembers(currentUserRole) && (
                    <td className="px-4 py-2">
                      <button 
                        className="p-1 text-red-600 hover:text-red-800" 
                        onClick={() => handleRemoveTeamMember(member)}
                        title="Remove member"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTasksTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Project Tasks</h2>
        <button 
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleCreateTask}
        >
          <FiPlus className="mr-1" /> Add Task
        </button>
      </div>
      {taskLoading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : taskError ? (
        <div className="text-red-500 text-center py-8">{taskError}</div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500 italic text-center py-8">No tasks found for this project.</div>
      ) : (
        <div className="space-y-4">
          {tasks.slice(0, 10).map((task) => (
            <div key={task.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => handleViewTask(task)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                    <span>Progress: {getValidProgressPercentage(task.progress_percentage)}%</span>
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {tasks.length > 10 && (
            <div className="text-center py-4">
              <button 
                className="text-blue-600 hover:text-blue-800"
                onClick={() => navigate('/tasks')}
              >
                View all {tasks.length} tasks →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderActivityTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">Project created by <span className="font-medium">John Doe</span></p>
            <p className="text-xs text-gray-500">2 days ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">Milestone "Design Phase" completed</p>
            <p className="text-xs text-gray-500">1 day ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">New team member <span className="font-medium">Jane Smith</span> added</p>
            <p className="text-xs text-gray-500">3 hours ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">Project status updated to "In Progress"</p>
            <p className="text-xs text-gray-500">1 hour ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg">
          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">Task "Implement Login" assigned to <span className="font-medium">Mike Johnson</span></p>
            <p className="text-xs text-gray-500">30 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'milestones':
        return renderMilestonesTab();
      case 'team':
        return renderTeamTab();
      case 'tasks':
        return renderTasksTab();
      case 'activity':
        return renderActivityTab();
      default:
        return renderMilestonesTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          className="flex items-center text-blue-600 hover:underline mb-6"
          onClick={() => navigate('/projects')}
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </button>

        {loading ? (
          <div className="text-center py-8">Loading project details...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : !project ? (
          <div className="text-gray-600 text-center py-8">Project not found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {/* Project Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {currentUserRole && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentUserRole)}`}>
                        Your Role: {getRoleDisplayName(currentUserRole)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  onClick={() => toast('Edit modal coming soon!')}
                >
                  <FiEdit className="mr-1" /> Edit
                </button>
              </div>
              <p className="text-gray-700 mb-4">{project.description || <span className="italic text-gray-400">No description</span>}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Status:</span> {project.status}
                </div>
                <div>
                  <span className="font-semibold">Priority:</span> {project.priority}
                </div>
                <div>
                  <span className="font-semibold">Start Date:</span> {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                </div>
                <div>
                  <span className="font-semibold">End Date:</span> {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                </div>
                <div>
                  <span className="font-semibold">Budget:</span> {project.budget ? `$${project.budget}` : '-'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={editingMilestone}
        projectId={id}
        onSuccess={handleMilestoneSuccess}
      />

      {/* Team Member Modal */}
      <TeamMemberModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        projectId={id}
        onSuccess={handleTeamSuccess}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
        onSuccess={onProjectUpdate}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        projects={[project]} // Pass current project as array
        users={teamMembers} // Pass team members as available users
        onSave={handleTaskSuccess}
      />

             {/* Task Detail Modal */}
       {showTaskDetail && selectedTask && (
         <TaskDetail
           task={selectedTask}
           onClose={() => {
             setShowTaskDetail(false);
             setSelectedTask(null);
           }}
           onEdit={() => {
             setEditingTask(selectedTask);
             setShowTaskDetail(false);
             setSelectedTask(null);
             setIsTaskModalOpen(true);
           }}
           onDelete={handleTaskDelete}
           onStatusUpdate={handleTaskStatusUpdate}
           onProgressUpdate={handleTaskProgressUpdate}
           onPriorityUpdate={handleTaskPriorityUpdate}
           onAssign={handleTaskAssign}
           users={users}
         />
       )}

      {/* Delete Milestone Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteMilestoneModal.isOpen}
        onClose={() => setDeleteMilestoneModal({ ...deleteMilestoneModal, isOpen: false })}
        onConfirm={async () => {
          try {
            await milestonesAPI.delete(deleteMilestoneModal.milestone.id);
            toast.success('Milestone deleted successfully!');
            fetchMilestones();
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete milestone';
            toast.error(errorMessage);
          }
          setDeleteMilestoneModal({ ...deleteMilestoneModal, isOpen: false });
        }}
        title={`Delete Milestone: ${deleteMilestoneModal.milestone?.name || ''}`}
        message={`Are you sure you want to delete the milestone "${deleteMilestoneModal.milestone?.name || ''}" and all its tasks? This action cannot be undone.`}
      />

      {/* Delete Team Member Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteTeamMemberModal.isOpen}
        onClose={() => setDeleteTeamMemberModal({ ...deleteTeamMemberModal, isOpen: false })}
        onConfirm={async () => {
          try {
            await teamAPI.removeFromProject(id, deleteTeamMemberModal.member.id);
            toast.success('Team member removed successfully!');
            fetchTeamMembers();
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to remove team member';
            toast.error(errorMessage);
          }
          setDeleteTeamMemberModal({ ...deleteTeamMemberModal, isOpen: false });
        }}
        title={`Remove Team Member: ${deleteTeamMemberModal.member?.first_name || ''} ${deleteTeamMemberModal.member?.last_name || ''}`}
        message={`Are you sure you want to remove ${deleteTeamMemberModal.member?.first_name || ''} ${deleteTeamMemberModal.member?.last_name || ''} from the project? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProjectDetail; 