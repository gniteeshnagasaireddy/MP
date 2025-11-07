import React, { useState } from 'react';
import { API_BASE } from '../api';

export default function Contact(){
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const [status, setStatus] = useState(null);

  async function submit(e){
    e.preventDefault();
    setStatus('sending');
    try{
      const r = await fetch(`${API_BASE}/api/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const j = await r.json();
      setStatus('sent');
    } catch(e){ setStatus('error'); }
  }

  return (
    <div className="card">
      <h2>Contact</h2>
      <form onSubmit={submit}>
        <div className="form-group"><input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
        <div className="form-group"><input className="input" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
        <div className="form-group"><textarea rows="6" className="input" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required /></div>
        <button className="btn" type="submit">Send</button>
      </form>
      {status==='sending' && <div className="small">Sending…</div>}
      {status==='sent' && <div className="small">Thank you — message sent.</div>}
      {status==='error' && <div className="small">Error sending message.</div>}
    </div>
  )
}
