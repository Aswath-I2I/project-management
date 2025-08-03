import React, { useState } from 'react';
import { milestonesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MilestoneStatusUpdate = ({ milestone, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(milestone.status);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === milestone.status) return;
    
    setIsUpdating(true);
    try {
      await milestonesAPI.updateStatus(milestone.id, newStatus);
      setStatus(newStatus);
      onUpdate();
      toast.success('Milestone status updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
      setStatus(milestone.status); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`px-2 py-1 rounded-full text-xs border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)} ${
        isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
};

export default MilestoneStatusUpdate; 