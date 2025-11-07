import React from 'react';
import { Link } from 'react-router-dom';
export default function Nav(){
  return (
    <nav>
      <div style={{flex:1}}>
        <Link to="/">India Weather</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  )
}
