import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskProgressBar = ({ progress, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProgress, setTempProgress] = useState(progress);
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    setTempProgress(progress);
  }, [progress]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setIsEditing(false);
        setShowSlider(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleProgressClick = () => {
    setIsEditing(true);
    setShowSlider(true);
  };

  const handleSliderChange = (e) => {
    const newProgress = parseInt(e.target.value);
    setTempProgress(newProgress);
  };

  const handleSliderMouseUp = () => {
    if (tempProgress !== progress) {
      onUpdate(tempProgress);
    }
    setIsEditing(false);
    setShowSlider(false);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressWidth = () => {
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="relative" ref={sliderRef}>
      {/* Progress Bar */}
      <div 
        className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative overflow-hidden"
        onClick={handleProgressClick}
      >
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
          initial={{ width: 0 }}
          animate={{ width: `${getProgressWidth()}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Progress Tooltip */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            >
              {tempProgress}%
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slider for editing */}
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50"
          >
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={tempProgress}
                onChange={handleSliderChange}
                onMouseUp={handleSliderChange}
                onTouchEnd={handleSliderChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {tempProgress}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom slider styles */}
      <style jsx="true">{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default TaskProgressBar; 