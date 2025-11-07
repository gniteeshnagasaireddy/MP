import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function Dashboard(){
  const [latest, setLatest] = useState({ timestamp:null, data:[] , highestHumidity:null, highestRainfall:null });

  useEffect(() => {
    fetch(`${API_BASE}/api/weather`).then(r=>r.json()).then(setLatest).catch(()=>{});
    const es = new EventSource(`${API_BASE}/events`);
    es.onmessage = (ev) => {
      try { const payload = JSON.parse(ev.data); if (payload.type === 'init' || payload.type === 'update') setLatest(payload.payload); else setLatest(payload); } catch(e){}
    };
    return () => es.close();
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Dashboard</h2>
        <p className="small">Last update: {latest.timestamp ?? '—'}</p>
      </div>

      <div className="card">
        <h3>Highlights</h3>
        <div style={{display:'flex', gap:12}}>
          <div style={{flex:1}} className="card">
            <strong>Highest Humidity</strong>
            <div className="small">{latest.highestHumidity ? `${latest.highestHumidity.state} — ${latest.highestHumidity.value}%` : '—'}</div>
          </div>
          <div style={{flex:1}} className="card">
            <strong>Highest Rainfall (last hr)</strong>
            <div className="small">{latest.highestRainfall ? `${latest.highestRainfall.state} — ${latest.highestRainfall.value} mm` : '—'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>All States / UTs</h3>
        <table className="table">
          <thead>
            <tr><th>State</th><th>Capital</th><th>Temp (°C)</th><th>Humidity (%)</th><th>Rain (mm)</th></tr>
          </thead>
          <tbody>
            {(latest.data||[]).map(it=>{
              const isHum = latest.highestHumidity && it.state === latest.highestHumidity.state;
              const isRain = latest.highestRainfall && it.state === latest.highestRainfall.state;
              return (
                <tr key={it.state} className={(isHum||isRain)?'highlight':''}>
                  <td>{it.state}</td>
                  <td>{it.capital}</td>
                  <td>{it.temp_c ?? '—'}</td>
                  <td>{it.humidity ?? '—'}</td>
                  <td>{it.rain_mm_last ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
