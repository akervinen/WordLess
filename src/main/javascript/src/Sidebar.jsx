import React from 'react';
import './Sidebar.css';

export default function Sidebar(props) {
  const {children} = props;
  return (
    <aside id="sidebar">
      {children}
    </aside>
  );
}
