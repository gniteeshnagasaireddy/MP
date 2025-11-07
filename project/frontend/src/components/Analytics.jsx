import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function Analytics(){
  const [latest, setLatest] = useState(null);

  useEffect(()=>{
    fetch(`${API_BASE}/api/weather`).then(r=>r.json()).then(setLatest).catch(()=>{});
    const es = new EventSource(`${API_BASE}/events`);
    es.onmessage = ev => { try{ const payload = JSON.parse(ev.data); setLatest(payload.payload ?? payload); } catch(e){} };
    return ()=>es.close();
  },[]);

  if (!latest) return <div className="card">Loading...</div>;

  const list = latest.data || [];
  const avgTemp = (list.reduce((s,i)=>s + (i.temp_c??0),0) / Math.max(1,list.length)).toFixed(1);
  const avgHum = (list.reduce((s,i)=>s + (i.humidity??0),0) / Math.max(1,list.length)).toFixed(1);
  const topHum = [...list].filter(i=>typeof i.humidity==='number').sort((a,b)=>b.humidity-a.humidity).slice(0,5);
  const topRain = [...list].filter(i=>typeof i.rain_mm_last==='number').sort((a,b)=>b.rain_mm_last-a.rain_mm_last).slice(0,5);

  return (
    <div>
      <div className="card">
        <h2>Analytics</h2>
        <div className="small">Average Temp: {avgTemp} °C • Average Humidity: {avgHum}%</div>
      </div>

      <div className="card">
        <h3>Top 5 Humidity</h3>
        <ol>
          {topHum.map(x=> <li key={x.state}>{x.state} — {x.humidity}%</li>)}
        </ol>
      </div>

      <div className="card">
        <h3>Top 5 Rainfall (last hr)</h3>
        <ol>
          {topRain.map(x=> <li key={x.state}>{x.state} — {x.rain_mm_last} mm</li>)}
        </ol>
      </div>
    </div>
  )
}
