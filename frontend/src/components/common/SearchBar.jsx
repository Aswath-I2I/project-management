import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value = '', 
  onChange, 
  onSearch,
  className = '',
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pl-10 pr-10 ${
            isFocused ? 'ring-2 ring-primary-500 border-primary-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar; 