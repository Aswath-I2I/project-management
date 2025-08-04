import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEdit, 
  FaTrash, 
  FaReply, 
  FaUser, 
  FaClock,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const CommentItem = ({ 
  comment, 
  onEdit, 
  onDelete, 
  onReply, 
  currentUserId,
  canEdit = false,
  canDelete = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, { content: editContent.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {comment.avatar_url ? (
            <img
              src={comment.avatar_url}
              alt={`${comment.first_name} ${comment.last_name}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials(comment.first_name, comment.last_name)}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {comment.first_name} {comment.last_name}
              </span>
              <span className="text-sm text-gray-500">@{comment.username}</span>
              <div className="flex items-center text-xs text-gray-400">
                <FaClock className="mr-1" />
                {formatDate(comment.created_at)}
              </div>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onReply(comment)}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                title="Reply"
              >
                <FaReply size={14} />
              </button>
              
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                  title="Edit"
                >
                  <FaEdit size={14} />
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Edit your comment..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <FaCheck size={12} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <FaTimes size={12} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* Replies Count */}
          {comment.replies_count > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-12 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              currentUserId={currentUserId}
              canEdit={reply.user_id === currentUserId}
              canDelete={reply.user_id === currentUserId}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CommentItem; 