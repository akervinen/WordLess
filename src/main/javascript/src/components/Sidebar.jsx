import React from 'react';
import './Sidebar.css';

/**
 * Very simple sidebar for navigation or other controls.
 * @param children components to display in the sidebar
 * @returns {*} JSX for a sidebar
 */
export default function Sidebar({children}) {
  return (
    <aside id="sidebar">
      {children}
    </aside>
  );
}
