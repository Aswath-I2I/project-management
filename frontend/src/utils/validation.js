// Input validation and sanitization utilities
import { toast } from 'react-hot-toast';

// Sanitization functions
export const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  text: (value) => {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  },

  // Sanitize email
  email: (value) => {
    if (!value) return '';
    return value.toLowerCase().trim();
  },

  // Sanitize username
  username: (value) => {
    if (!value) return '';
    return value
      .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, hyphen
      .toLowerCase()
      .trim();
  },

  // Sanitize password (don't modify, just validate)
  password: (value) => {
    return value || '';
  },

  // Sanitize numbers
  number: (value) => {
    if (!value) return '';
    return value.toString().replace(/[^0-9.]/g, '');
  },

  // Sanitize URL
  url: (value) => {
    if (!value) return '';
    return value.trim();
  }
};

// Validation functions
export const validateInput = {
  // Required field validation
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  },

  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Please enter a valid email address');
    }
    return true;
  },

  // Username validation
  username: (value) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(value)) {
      throw new Error('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
    }
    return true;
  },

  // Password validation
  password: (value) => {
    if (value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  },

  // Project name validation
  projectName: (value) => {
    if (value.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }
    if (value.length > 100) {
      throw new Error('Project name must be less than 100 characters');
    }
    return true;
  },

  // Task title validation
  taskTitle: (value) => {
    if (value.length < 3) {
      throw new Error('Task title must be at least 3 characters long');
    }
    if (value.length > 255) {
      throw new Error('Task title must be less than 255 characters');
    }
    return true;
  },

  // Description validation
  description: (value) => {
    if (value && value.length > 1000) {
      throw new Error('Description must be less than 1000 characters');
    }
    return true;
  },

  // Comment validation
  comment: (value) => {
    if (!value || value.trim().length === 0) {
      throw new Error('Comment cannot be empty');
    }
    if (value.length > 2000) {
      throw new Error('Comment must be less than 2000 characters');
    }
    return true;
  },

  // Hours validation
  hours: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      throw new Error('Hours must be a positive number');
    }
    if (num > 24) {
      throw new Error('Hours cannot exceed 24');
    }
    return true;
  },

  // Date validation
  date: (value) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Please enter a valid date');
    }
    return true;
  },

  // Future date validation
  futureDate: (value) => {
    if (!value) return true;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new Error('Date cannot be in the past');
    }
    return true;
  },

  // UUID validation
  uuid: (value) => {
    if (!value) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid ID format');
    }
    return true;
  },

  // Priority validation
  priority: (value) => {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(value)) {
      throw new Error('Invalid priority level');
    }
    return true;
  },

  // Status validation
  status: (value) => {
    const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'closed', 'cancelled'];
    if (!validStatuses.includes(value)) {
      throw new Error('Invalid status');
    }
    return true;
  },

  // Progress percentage validation
  progressPercentage: (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }
    return true;
  }
};

// Main validation function
export const validateForm = (data, rules) => {
  const errors = {};
  const sanitizedData = {};

  try {
    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];

      // Sanitize the value first
      let sanitizedValue = value;
      if (fieldRules.sanitize) {
        sanitizedValue = sanitizeInput[fieldRules.sanitize](value);
      }

      // Apply validation rules
      if (fieldRules.required) {
        validateInput.required(sanitizedValue, fieldRules.label || field);
      }

      if (sanitizedValue && fieldRules.type) {
        validateInput[fieldRules.type](sanitizedValue);
      }

      // Custom validation
      if (fieldRules.custom) {
        fieldRules.custom(sanitizedValue);
      }

      sanitizedData[field] = sanitizedValue;
    });

    return { isValid: true, data: sanitizedData, errors: {} };
  } catch (error) {
    // Find which field caused the error by checking each field
    for (const field of Object.keys(rules)) {
      const value = data[field];
      const fieldRules = rules[field];
      
      try {
        let sanitizedValue = value;
        if (fieldRules.sanitize) {
          sanitizedValue = sanitizeInput[fieldRules.sanitize](value);
        }

        if (fieldRules.required) {
          validateInput.required(sanitizedValue, fieldRules.label || field);
        }

        if (sanitizedValue && fieldRules.type) {
          validateInput[fieldRules.type](sanitizedValue);
        }

        if (fieldRules.custom) {
          fieldRules.custom(sanitizedValue);
        }
      } catch (fieldError) {
        return { isValid: false, data: {}, errors: { [field]: fieldError.message } };
      }
    }
    
    // If we can't identify the specific field, return a generic error
    return { isValid: false, data: {}, errors: { general: error.message } };
  }
};

// Common validation rules
export const validationRules = {
  // Login form
  login: {
    email: {
      required: true,
      type: 'email',
      sanitize: 'email',
      label: 'Email'
    },
    password: {
      required: true,
      type: 'password',
      sanitize: 'password',
      label: 'Password'
    }
  },

  // Registration form
  register: {
    username: {
      required: true,
      type: 'username',
      sanitize: 'username',
      label: 'Username'
    },
    email: {
      required: true,
      type: 'email',
      sanitize: 'email',
      label: 'Email'
    },
    password: {
      required: true,
      type: 'password',
      sanitize: 'password',
      label: 'Password'
    }
  },

  // Project form
  project: {
    name: {
      required: true,
      type: 'projectName',
      sanitize: 'text',
      label: 'Project name'
    },
    description: {
      required: false,
      type: 'description',
      sanitize: 'text',
      label: 'Description'
    },
    start_date: {
      required: false,
      type: 'date',
      label: 'Start date'
    },
    end_date: {
      required: false,
      type: 'date',
      custom: (value) => {
        if (value) {
          validateInput.futureDate(value);
        }
      },
      label: 'End date'
    }
  },

  // Task form
  task: {
    title: {
      required: true,
      type: 'taskTitle',
      sanitize: 'text',
      label: 'Task title'
    },
    description: {
      required: false,
      type: 'description',
      sanitize: 'text',
      label: 'Description'
    },
    priority: {
      required: false,
      type: 'priority',
      label: 'Priority'
    },
    status: {
      required: false,
      type: 'status',
      label: 'Status'
    },
    due_date: {
      required: false,
      type: 'date',
      label: 'Due date'
    },
    progress_percentage: {
      required: false,
      type: 'progressPercentage',
      sanitize: 'number',
      label: 'Progress percentage'
    }
  },

  // Comment form
  comment: {
    content: {
      required: true,
      type: 'comment',
      sanitize: 'text',
      label: 'Comment'
    }
  },

  // Time log form
  timeLog: {
    project_id: {
      required: true,
      type: 'uuid',
      label: 'Project'
    },
    task_id: {
      required: false,
      type: 'uuid',
      label: 'Task'
    },
    hours_spent: {
      required: true,
      type: 'hours',
      sanitize: 'number',
      label: 'Hours spent'
    },
    description: {
      required: false,
      type: 'description',
      sanitize: 'text',
      label: 'Description'
    },
    date: {
      required: true,
      type: 'date',
      label: 'Date'
    }
  }
};

// Utility function to show validation errors
export const showValidationError = (error) => {
  toast.error(error.message || 'Validation failed');
};

// Utility function to validate before API call
export const validateBeforeApiCall = (data, rules) => {
  const result = validateForm(data, rules);
  
  if (!result.isValid) {
    const firstError = Object.values(result.errors)[0];
    showValidationError({ message: firstError });
    return false;
  }
  
  return result.data;
}; 