# Frontend Validation Guide

## Overview
Comprehensive input validation and sanitization system that validates all user inputs before API calls.

## Features
- ✅ Input sanitization (HTML tags, dangerous characters)
- ✅ Comprehensive validation (required fields, formats, business logic)
- ✅ User-friendly error messages with toast notifications
- ✅ Form-specific validation rules

## Usage

### Basic Usage
```javascript
import { validateBeforeApiCall, validationRules } from '../utils/validation.js';

const handleSubmit = async (data) => {
  const validatedData = validateBeforeApiCall(data, validationRules.login);
  if (!validatedData) return; // Validation failed, error shown
  
  // Proceed with API call
  const response = await apiCall(validatedData);
};
```

### Available Validation Rules
- `validationRules.login` - Email and password
- `validationRules.register` - Username, email, password
- `validationRules.project` - Project name, description, dates
- `validationRules.task` - Task title, description, priority, status
- `validationRules.comment` - Comment content
- `validationRules.timeLog` - Hours, description, date

### Validation Types
- **Text**: projectName (3-100 chars), taskTitle (3-255 chars), description (max 1000)
- **Format**: email, username (3-20 chars), password (min 6), date, uuid
- **Business**: priority, status, progressPercentage (0-100), hours (0-24)

### Sanitization Types
- `text` - Removes HTML tags and dangerous characters
- `email` - Lowercase and trim
- `username` - Alphanumeric, underscore, hyphen only
- `number` - Digits and decimal points only

## Security Benefits
- XSS prevention through HTML tag removal
- Data integrity through format validation
- Consistent user experience with immediate feedback

## Best Practices
1. Always validate before API calls
2. Use appropriate validation rules for each form
3. Let the system handle error display
4. Sanitize all user inputs

## Example Implementation
```javascript
// Login form
const onSubmit = async (data) => {
  const validatedData = validateBeforeApiCall(data, validationRules.login);
  if (!validatedData) return;
  
  const result = await login(validatedData.email, validatedData.password);
};

// Project form
const onSubmit = async (data) => {
  const validatedData = validateBeforeApiCall(data, validationRules.project);
  if (!validatedData) return;
  
  const response = await projectsAPI.create(validatedData);
};
``` 