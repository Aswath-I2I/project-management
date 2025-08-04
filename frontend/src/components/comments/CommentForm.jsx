import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const CommentForm = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...", 
  initialValue = "",
  isReply = false,
  replyingTo = null
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onCancel) onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
    >
      {isReply && replyingTo && (
        <div className="mb-3 p-2 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-600">
            Replying to <span className="font-semibold">{replyingTo.first_name} {replyingTo.last_name}</span>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          maxLength="2000"
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {content.length}/2000 characters
          </div>
          
          <div className="flex items-center space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <FaTimes size={12} />
                <span>Cancel</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <FaPaperPlane size={12} />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CommentForm; 