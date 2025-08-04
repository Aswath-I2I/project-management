# Comment Feature Implementation

This document describes the comment feature that has been implemented for tasks and projects.

## 🎯 Features Implemented

### Backend (Complete)
- ✅ **Comment Controller** (`backend/src/controllers/commentController.js`)
  - Get comments for tasks and projects
  - Create new comments
  - Update existing comments
  - Delete comments
  - Support for nested replies
  - Pagination support

- ✅ **Comment Routes** (`backend/src/routes/comments.js`)
  - GET `/api/comments/task/:taskId` - Get task comments
  - GET `/api/comments/project/:projectId` - Get project comments
  - POST `/api/comments` - Create comment
  - PUT `/api/comments/:commentId` - Update comment
  - DELETE `/api/comments/:commentId` - Delete comment

- ✅ **Database Schema** (Updated in `railway-setup.sql`)
  - `comments` table with all required fields
  - Support for nested comments (replies)
  - Proper indexes for performance
  - Triggers for `updated_at` timestamps

### Frontend (Components Created)
- ✅ **Comment API Service** (`frontend/src/api/commentAPI.js`)
  - All CRUD operations for comments
  - Proper error handling

- ✅ **Comment Components**
  - `CommentItem.jsx` - Individual comment display with edit/delete
  - `CommentForm.jsx` - Form for creating/editing comments
  - `CommentsSection.jsx` - Main comments section with pagination
  - `CommentButton.jsx` - Simple button to show comment count and open modal

## 🔧 How to Use

### 1. Add Comments to Task Cards

In your `TaskCard.jsx`, add the comment button:

```jsx
import CommentButton from '../comments/CommentButton';

// Inside your TaskCard component
<div className="flex items-center space-x-2">
  <CommentButton
    entityType="task"
    entityId={task.id}
    commentCount={task.comments_count || 0}
  />
</div>
```

### 2. Add Comments to Project Detail

In your project detail page, add the comments section:

```jsx
import CommentsSection from '../comments/CommentsSection';

// Inside your project detail component
<div className="mt-6">
  <CommentsSection
    entityType="project"
    entityId={project.id}
    currentUserId={user?.id}
  />
</div>
```

### 3. Add Comments to Task Detail Modal

Create a task detail modal with comments:

```jsx
import CommentsSection from '../comments/CommentsSection';

// Inside your task detail modal
<div className="grid grid-cols-2 gap-6">
  <div>
    {/* Task details */}
  </div>
  <div>
    <CommentsSection
      entityType="task"
      entityId={task.id}
      currentUserId={user?.id}
    />
  </div>
</div>
```

## 📋 API Endpoints

### Get Task Comments
```http
GET /api/comments/task/:taskId?page=1&limit=20
```

### Get Project Comments
```http
GET /api/comments/project/:projectId?page=1&limit=20
```

### Create Comment
```http
POST /api/comments
Content-Type: application/json

{
  "content": "This is a comment",
  "task_id": "uuid", // or project_id or milestone_id
  "parent_comment_id": "uuid" // optional, for replies
}
```

### Update Comment
```http
PUT /api/comments/:commentId
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

### Delete Comment
```http
DELETE /api/comments/:commentId
```

## 🎨 Features

### Comment Features
- ✅ **Create Comments** - Users can add comments to tasks and projects
- ✅ **Edit Comments** - Users can edit their own comments
- ✅ **Delete Comments** - Users can delete their own comments
- ✅ **Reply to Comments** - Support for nested replies
- ✅ **Real-time Updates** - Comments update immediately after posting
- ✅ **Pagination** - Load more comments as needed
- ✅ **User Avatars** - Display user initials or avatars
- ✅ **Timestamps** - Show when comments were created/edited
- ✅ **Character Limit** - 2000 character limit with counter

### Permission System
- ✅ **Own Comments** - Users can edit/delete their own comments
- ✅ **Project Access** - Only project members can view/add comments
- ✅ **Admin Override** - Project managers and admins can moderate all comments

### UI/UX Features
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Smooth Animations** - Framer Motion animations
- ✅ **Loading States** - Proper loading indicators
- ✅ **Error Handling** - Toast notifications for errors
- ✅ **Empty States** - Friendly messages when no comments exist

## 🔄 Integration Steps

### 1. Update Task Queries
Make sure your task queries include comment counts:

```sql
SELECT 
  t.*,
  COUNT(c.id) as comments_count
FROM tasks t
LEFT JOIN comments c ON t.id = c.task_id
GROUP BY t.id
```

### 2. Add Comment Count to Task Cards
Display comment count in task cards to encourage engagement.

### 3. Add Comments Tab to Project Detail
Create a dedicated comments tab in project detail pages.

### 4. Add Comments to Task Detail Modals
Show comments alongside task details in detail views.

## 🚀 Next Steps

### Immediate
1. **Test the API endpoints** - Verify all CRUD operations work
2. **Add comment buttons to existing task cards** - Integrate with current UI
3. **Add comments section to project detail pages** - Enhance project collaboration

### Future Enhancements
1. **Real-time Comments** - WebSocket integration for live updates
2. **Comment Notifications** - Email/notification when mentioned
3. **Comment Attachments** - Allow file uploads in comments
4. **Comment Search** - Search within comments
5. **Comment Reactions** - Like/dislike comments
6. **Comment Threading** - Better nested comment display

## 🐛 Troubleshooting

### Common Issues
1. **Comments not loading** - Check if user has project access
2. **Can't edit comments** - Verify user owns the comment
3. **Database errors** - Ensure comments table exists with proper schema

### Debug Commands
```bash
# Check if comments table exists
npm run migrate:status

# Fix missing columns if needed
npm run migrate:fix

# Reset database if needed
npm run migrate:reset
```

## 📝 Notes

- Comments are automatically deleted when the parent task/project is deleted (CASCADE)
- Comment replies are automatically deleted when parent comment is deleted
- All comment operations require authentication
- Comment content is limited to 2000 characters
- Comments support markdown-style formatting (can be enhanced later) 