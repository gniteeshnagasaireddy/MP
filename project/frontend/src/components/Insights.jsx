import React from 'react';

export default function Insights(){
  return (
    <div>
      <div className="card">
        <h2>Insights</h2>
        <p className="small">This page can contain derived insights such as: long-term wet/dry states, seasonal patterns, alerts for heavy rainfall, and city-specific tips.</p>
      </div>

      <div className="card">
        <h3>Example Insights</h3>
        <ul>
          <li>Automatically highlight states with sudden humidity spike (>15% change in an hour).</li>
          <li>Issue a visual alert if rainfall > 10mm in last hour.</li>
          <li>Provide exportable CSV of latest snapshot.</li>
        </ul>
      </div>
    </div>
  )
}
