import React from 'react';
import { Link } from 'react-router-dom';
export default function Home(){
  return (
    <div>
      <div className="card header">
        <div>
          <h1>India Real-time Weather Tracker</h1>
          <p className="small">Track weather for states & union territories with live updates, highest humidity and rainfall highlights.</p>
        </div>
        <div>
          <Link to="/dashboard" className="btn">Go to Dashboard</Link>
        </div>
      </div>

      <div className="card">
        <h3>Quick stats</h3>
        <p className="small">This project uses OpenWeatherMap for current conditions. The backend polls for each capital city and broadcasts updates via Server-Sent Events (SSE).</p>
      </div>

      <div className="card">
        <h3>How it works</h3>
        <ol>
          <li>Backend geocodes capitals (once) and polls current weather.</li>
          <li>Frontend connects via SSE and displays a live table and insights.</li>
          <li>Analytics page provides simple charts and trends.</li>
        </ol>
      </div>
    </div>
  )
}
