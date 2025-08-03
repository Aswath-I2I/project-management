import React from 'react';
import { useParams } from 'react-router-dom';

const TaskDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Detail</h1>
          <p className="text-gray-600 mt-2">Task ID: {id}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Task detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 