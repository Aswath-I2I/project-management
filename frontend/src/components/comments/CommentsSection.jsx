import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaComment, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import commentAPI from '../../api/commentAPI';
import toast from 'react-hot-toast';

const CommentsSection = ({ 
  entityType, // 'task' or 'project'
  entityId, 
  currentUserId,
  onCommentCountChange 
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (entityType === 'task') {
        response = await commentAPI.getTaskComments(entityId, { page: pageNum, limit: 20 });
      } else if (entityType === 'project') {
        response = await commentAPI.getProjectComments(entityId, { page: pageNum, limit: 20 });
      }

      const newComments = response.data.comments;
      
      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }

      setHasMore(newComments.length === 20);
      setPage(pageNum);

      // Update comment count if callback provided
      if (onCommentCountChange) {
        onCommentCountChange(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1, false);
  }, [entityId, entityType]);

  const handleCreateComment = async (content) => {
    try {
      const commentData = {
        content,
        [entityType === 'task' ? 'task_id' : 'project_id']: entityId
      };

      const response = await commentAPI.createComment(commentData);
      const newComment = response.data;

      // Add the new comment to the beginning of the list
      setComments(prev => [newComment, ...prev]);

      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(prev => prev + 1);
      }

      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
      throw error;
    }
  };

  const handleEditComment = async (commentId, updateData) => {
    try {
      const response = await commentAPI.updateComment(commentId, updateData);
      const updatedComment = response.data;

      // Update the comment in the list
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? { ...comment, ...updatedComment } : comment
        )
      );

      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);

      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));

      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(prev => prev - 1);
      }

      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      throw error;
    }
  };

  const handleReply = async (content) => {
    try {
      const commentData = {
        content,
        [entityType === 'task' ? 'task_id' : 'project_id']: entityId,
        parent_comment_id: replyingTo.id
      };

      const response = await commentAPI.createComment(commentData);
      const newReply = response.data;

      // Add the reply to the parent comment
      setComments(prev => 
        prev.map(comment => 
          comment.id === replyingTo.id 
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), newReply],
                replies_count: (comment.replies_count || 0) + 1
              }
            : comment
        )
      );

      // Update comment count
      if (onCommentCountChange) {
        onCommentCountChange(prev => prev + 1);
      }

      setShowReplyForm(false);
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to post reply');
      throw error;
    }
  };

  const handleReplyClick = (comment) => {
    setReplyingTo(comment);
    setShowReplyForm(true);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1, true);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Loading comments...</span>
      </div>
    );
  }

  if (error && comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <FaExclamationTriangle className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaComment className="mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <CommentForm
        onSubmit={handleCreateComment}
        placeholder={`Write a comment on this ${entityType}...`}
      />

      {/* Reply Form */}
      {showReplyForm && replyingTo && (
        <CommentForm
          onSubmit={handleReply}
          onCancel={handleCancelReply}
          placeholder="Write a reply..."
          isReply={true}
          replyingTo={replyingTo}
        />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onReply={handleReplyClick}
            currentUserId={currentUserId}
            canEdit={comment.user_id === currentUserId}
            canDelete={comment.user_id === currentUserId}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMoreComments}
            disabled={loading}
            className="px-4 py-2 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Comments'
            )}
          </button>
        </div>
      )}

      {/* No Comments */}
      {comments.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <FaComment className="mx-auto mb-2 text-4xl" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection; 