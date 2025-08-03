# Project Management System - Prompt Library

## Overview
This document catalogs all the major prompts used throughout the development of the Project Management System. These prompts demonstrate effective AI-assisted development patterns and can be reused for similar projects.

---

## 🏗️ **System Architecture Prompts**

### 1. System Architecture Design
**Prompt:** "Design a system architecture diagram for a project management platform using React.js for the frontend, Node.js for the backend, and PostgreSQL as the database. The diagram should illustrate major components (frontend, backend, database), flow between user actions, REST API endpoints, authentication, and auxiliary systems (notifications, file storage, real-time updates)."

**Use Case:** Initial system design and planning
**Output:** Comprehensive architecture diagram with component relationships

### 2. Entity Relationship Diagram
**Prompt:** "Create a detailed entity-relationship (ER) diagram and table schemas for the following entities: Projects, Milestones, Tasks, Users, Comments, Attachments, Roles, TimeLogs. Specify primary and foreign keys, relationships (one-to-many, many-to-many), and data types for each field. Document how entities like time tracking, attachments, and user roles relate to their parent objects."

**Use Case:** Database design and schema planning
**Output:** Complete ER diagram with table schemas and relationships

### 3. Database Schema Creation
**Prompt:** "Create database scheme for following tables: Projects Table, Milestones Table, Tasks Table, Users, Comments, Attachments, Roles, TimeLogs. Support for pgadmin4"

**Use Case:** Database implementation
**Output:** PostgreSQL schema with proper constraints and relationships

---

## 📋 **Development Planning Prompts**

### 4. Development Plan Creation
**Prompt:** "Draft a development plan for the project management system, breaking the work into clear phases: database design, backend/API implementation, frontend UI, testing, deployment, documentation. For each phase, estimate time allocation (hours/days/week), list major deliverables, assign responsible team members, and add milestone check-ins."

**Use Case:** Project planning and resource allocation
**Output:** Detailed development timeline with phases, deliverables, and team assignments

### 5. Project Structure Organization
**Prompt:** "Isolate both front end and Back end code in different folders"

**Use Case:** Code organization and separation of concerns
**Output:** Clear folder structure with frontend/backend separation

---

## 🗄️ **Database Development Prompts**

### 6. Database Schema Design
**Prompt:** "Design a PostgreSQL database table to store project information, including project name, description, created by, start and end dates, and status. Each project should support multiple milestones and be linked to a team."

**Use Case:** Core entity design
**Output:** Project table schema with relationships

### 7. Milestone Table Design
**Prompt:** "Create a table structure for project milestones. Each milestone should be linked to a project, have a name, description, due date, and completion status."

**Use Case:** Milestone entity design
**Output:** Milestone table schema with project relationships

### 8. Task Management Design
**Prompt:** "Design a tasks table to support task assignment to team members. Fields should include task title, description, priority (e.g., Low, Medium, High), due date, status, assigned user, parent milestone, and progress indicators."

**Use Case:** Task entity design
**Output:** Task table schema with assignment and progress tracking

### 9. User and Role Management
**Prompt:** "Devise tables for users/teammates and their roles (e.g., admin, manager, member). Users should be associated with projects and tasks."

**Use Case:** User management and role-based access control
**Output:** User and role table schemas with relationships

### 10. Content Management Design
**Prompt:** "Define tables for task comments and file attachments. Each comment should reference a task and user, include timestamp and content. Attachments should store the file path, associated task/comment, and uploader."

**Use Case:** Content and file management
**Output:** Comment and attachment table schemas

### 11. Time Tracking Design
**Prompt:** "Create a time tracking table to log hours spent by each user on a given task or project, including start/end timestamps, total hours, notes, and references to user and task/project."

**Use Case:** Time tracking and billing
**Output:** Time log table schema with user and project relationships

### 12. Database Connectivity and Seeding
**Prompt:** "Create database connectivity and add a seed data"

**Use Case:** Database setup and testing data
**Output:** Database connection configuration and comprehensive seed data

---

## 🎯 **Prompt Categories and Patterns**

### **Architecture & Design Prompts**
- **Pattern:** "Design a [system/component] for [purpose] using [technologies]"
- **Key Elements:** Technologies, requirements, relationships
- **Output:** Diagrams, schemas, system designs

### **Development Planning Prompts**
- **Pattern:** "Create a [plan/structure] for [project] with [phases/components]"
- **Key Elements:** Phases, timelines, deliverables, team assignments
- **Output:** Project plans, timelines, resource allocation

### **Database Design Prompts**
- **Pattern:** "Design a [table/entity] to [purpose] with [fields/relationships]"
- **Key Elements:** Entities, fields, relationships, constraints
- **Output:** Table schemas, ER diagrams, SQL scripts

### **Implementation Prompts**
- **Pattern:** "Create [component] with [features] for [purpose]"
- **Key Elements:** Components, features, requirements
- **Output:** Code files, configurations, implementations

---

## 📝 **Effective Prompt Writing Guidelines**

### **1. Be Specific and Detailed**
**Good:** "Design a PostgreSQL database table to store project information, including project name, description, created by, start and end dates, and status. Each project should support multiple milestones and be linked to a team."

**Poor:** "Create a project table"

### **2. Include Context and Requirements**
**Good:** "Create a detailed entity-relationship (ER) diagram and table schemas for the following entities: Projects, Milestones, Tasks, Users, Comments, Attachments, Roles, TimeLogs. Specify primary and foreign keys, relationships (one-to-many, many-to-many), and data types for each field."

**Poor:** "Make an ER diagram"

### **3. Specify Output Format**
**Good:** "The diagram should illustrate major components (frontend, backend, database), flow between user actions, REST API endpoints, authentication, and auxiliary systems (notifications, file storage, real-time updates)."

**Poor:** "Show the architecture"

### **4. Include Technical Constraints**
**Good:** "Support for pgadmin4"

**Poor:** "Use a database"

---

## 🔄 **Prompt Reusability Patterns**

### **For New Projects**
1. **System Architecture:** Adapt technology stack and requirements
2. **Database Design:** Modify entities and relationships
3. **Development Planning:** Adjust phases and timelines
4. **Implementation:** Customize features and requirements

### **For Similar Systems**
- **Project Management:** Reuse entity structures and workflows
- **User Management:** Adapt role-based access control
- **File Management:** Modify attachment and storage patterns
- **Time Tracking:** Adjust billing and reporting requirements

### **For Different Technologies**
- **Frontend:** Replace React.js with Vue.js, Angular, etc.
- **Backend:** Replace Node.js with Python, Java, etc.
- **Database:** Replace PostgreSQL with MySQL, MongoDB, etc.

---

## 📊 **Prompt Effectiveness Metrics**

### **Success Indicators**
- ✅ **Complete Output:** All requirements addressed
- ✅ **Technical Accuracy:** Proper implementation details
- ✅ **Scalability:** Future-proof design considerations
- ✅ **Maintainability:** Clear structure and documentation

### **Common Pitfalls**
- ❌ **Vague Requirements:** Unclear specifications
- ❌ **Missing Context:** Insufficient background information
- ❌ **Incomplete Scope:** Missing important aspects
- ❌ **Poor Formatting:** Unclear output expectations

---

## 🛠️ **Prompt Templates**

### **Architecture Design Template**
```
Design a system architecture for [system_name] using [technologies].
The architecture should include:
- [component_1] with [features]
- [component_2] with [features]
- [relationships] between components
- [security/performance] considerations
```

### **Database Design Template**
```
Create a database schema for [entity_name] with the following requirements:
- [field_1]: [type] with [constraints]
- [field_2]: [type] with [constraints]
- Relationships: [relationship_type] with [related_entity]
- [additional_requirements]
```

### **Development Planning Template**
```
Create a development plan for [project_name] with the following phases:
1. [phase_1]: [duration] - [deliverables]
2. [phase_2]: [duration] - [deliverables]
3. [phase_3]: [duration] - [deliverables]
Include: [timeline/team/resources]
```

---

## 📚 **Best Practices**

### **1. Start with Clear Objectives**
- Define the problem to be solved
- Specify the desired outcome
- Include success criteria

### **2. Provide Adequate Context**
- Include relevant background information
- Specify technical constraints
- Mention integration requirements

### **3. Be Specific About Output**
- Specify format (diagrams, code, documentation)
- Include technical details (languages, frameworks)
- Mention quality requirements

### **4. Include Validation Criteria**
- Specify what constitutes success
- Include testing requirements
- Mention performance expectations

### **5. Consider Future Extensibility**
- Include scalability considerations
- Mention maintenance requirements
- Consider integration points

---

## 🎯 **Conclusion**

This prompt library demonstrates effective patterns for AI-assisted development of complex systems. The prompts show how to:

1. **Structure complex requirements** into clear, actionable requests
2. **Include technical details** while maintaining clarity
3. **Specify output formats** for consistent results
4. **Consider scalability** and maintainability
5. **Provide comprehensive context** for accurate implementations

These prompts can be adapted and reused for similar projects, providing a foundation for efficient AI-assisted development workflows. 