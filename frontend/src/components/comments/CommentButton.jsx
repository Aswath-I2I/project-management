import React, { useState } from 'react';
import { FaComment } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CommentsSection from './CommentsSection';
import { useAuth } from '../../contexts/AuthContext';

const CommentButton = ({ 
  entityType, // 'task' or 'project'
  entityId, 
  commentCount = 0,
  className = ""
}) => {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowComments(true);
        }}
        className={`flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors ${className}`}
        title={`${commentCount} comments`}
      >
        <FaComment size={14} />
        <span className="text-sm">{commentCount}</span>
      </button>

      {/* Comments Modal */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowComments(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Comments
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Comments Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <CommentsSection
                entityType={entityType}
                entityId={entityId}
                currentUserId={user?.id}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default CommentButton; 