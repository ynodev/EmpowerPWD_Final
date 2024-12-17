import React, { useState, useEffect } from 'react';



export const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative inline-block text-left">
        {React.Children.map(children, child =>
          React.cloneElement(child, { isOpen, setIsOpen })
        )}
      </div>
    );
  };
  
  export const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(!isOpen),
      'aria-expanded': isOpen
    });
  };
  
  export const DropdownMenuContent = ({ children, isOpen, setIsOpen }) => {
    if (!isOpen) return null;
    
    return (
      <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-950">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {children}
        </div>
      </div>
    );
  };
  
  export const DropdownMenuItem = ({ children, onClick }) => {
    return (
      <button
        className="block w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
        role="menuitem"
        onClick={onClick}
      >
        {children}
      </button>
    );
  };