

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = () => {
  // 1. Create a state to track if password is shown or hidden
  const [showPassword, setShowPassword] = useState(false);

  // 2. Function to toggle that state
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      <input 
        // 3. Change type dynamically based on state
        type={showPassword ? "text" : "password"} 
        placeholder="Create a password"
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600 text-gray-700 placeholder-gray-400"
      />
      
      {/* 4. Clickable icon container */}
      <div 
        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        onClick={toggleVisibility}
      >
        {/* Switch icon based on state */}
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default PasswordField;
