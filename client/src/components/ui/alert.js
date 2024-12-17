
import React from 'react';

// Define styles for different alert types
const alertStyles = {
  success: 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4',
  error: 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4',
  warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4',
  info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-4',
};

// Alert Component
export const Alert = ({ type = 'success', children }) => {
  const styles = alertStyles[type] || alertStyles.success; // Default to success if type is invalid

  return (
    <div className={styles} role="alert">
      {children}
    </div>
  );
};

// AlertDescription Component
export const AlertDescription = ({ children }) => {
  return <span>{children}</span>;
};