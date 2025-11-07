require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
if (!OPENWEATHER_KEY) {
  console.error('Missing OPENWEATHER_KEY in .env');
  process.exit(1);
}

// List of Indian states/UTs and capitals
const LOCATIONS = [
  { state: 'Andhra Pradesh', capital: 'Amaravati' },
  { state: 'Arunachal Pradesh', capital: 'Itanagar' },
  { state: 'Assam', capital: 'Dispur' },
  { state: 'Bihar', capital: 'Patna' },
  { state: 'Chhattisgarh', capital: 'Raipur' },
  { state: 'Goa', capital: 'Panaji' },
  { state: 'Gujarat', capital: 'Gandhinagar' },
  { state: 'Haryana', capital: 'Chandigarh' },
  { state: 'Himachal Pradesh', capital: 'Shimla' },
  { state: 'Jharkhand', capital: 'Ranchi' },
  { state: 'Karnataka', capital: 'Bengaluru' },
  { state: 'Kerala', capital: 'Thiruvananthapuram' },
  { state: 'Madhya Pradesh', capital: 'Bhopal' },
  { state: 'Maharashtra', capital: 'Mumbai' },
  { state: 'Manipur', capital: 'Imphal' },
  { state: 'Meghalaya', capital: 'Shillong' },
  { state: 'Mizoram', capital: 'Aizawl' },
  { state: 'Nagaland', capital: 'Kohima' },
  { state: 'Odisha', capital: 'Bhubaneswar' },
  { state: 'Punjab', capital: 'Chandigarh' },
  { state: 'Rajasthan', capital: 'Jaipur' },
  { state: 'Sikkim', capital: 'Gangtok' },
  { state: 'Tamil Nadu', capital: 'Chennai' },
  { state: 'Telangana', capital: 'Hyderabad' },
  { state: 'Tripura', capital: 'Agartala' },
  { state: 'Uttar Pradesh', capital: 'Lucknow' },
  { state: 'Uttarakhand', capital: 'Dehradun' },
  { state: 'West Bengal', capital: 'Kolkata' },
  // UTs
  { state: 'Delhi (NCT)', capital: 'New Delhi' },
  { state: 'Puducherry', capital: 'Puducherry' }
];

let places = [];
let latest = { timestamp: null, data: [], highestHumidity: null, highestRainfall: null };
const clients = new Set();

async function geocodeCity(city) {
  const url = 'http://api.openweathermap.org/geo/1.0/direct';
  const resp = await axios.get(url, { params: { q: `${city},IN`, limit: 1, appid: OPENWEATHER_KEY } });
  if (!resp.data || resp.data.length === 0) throw new Error('Geocode not found');
  const { lat, lon } = resp.data[0];
  return { lat, lon };
}

async function fetchWeather(place) {
  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const resp = await axios.get(url, { params: { lat: place.lat, lon: place.lon, appid: OPENWEATHER_KEY, units: 'metric' } });
  const w = resp.data;
  let rain = 0;
  if (w.rain) rain = w.rain['1h'] ?? w.rain['3h'] ?? 0;
  const humidity = w.main ? w.main.humidity : null;
  return {
    state: place.state,
    capital: place.capital,
    lat: place.lat,
    lon: place.lon,
    temp_c: w.main ? w.main.temp : null,
    humidity,
    rain_mm_last: rain,
    raw: w
  };
}

function computeMaxes(list) {
  let highestHumidity = null;
  let highestRainfall = null;
  for (const it of list) {
    if (typeof it.humidity === 'number') {
      if (!highestHumidity || it.humidity > highestHumidity.value) highestHumidity = { state: it.state, capital: it.capital, value: it.humidity };
    }
    if (typeof it.rain_mm_last === 'number') {
      if (!highestRainfall || it.rain_mm_last > highestRainfall.value) highestRainfall = { state: it.state, capital: it.capital, value: it.rain_mm_last };
    }
  }
  return { highestHumidity, highestRainfall };
}

async function pollAll() {
  try {
    const results = await Promise.all(places.map(p => fetchWeather(p).catch(e => ({ state: p.state, capital: p.capital, temp_c: null, humidity: null, rain_mm_last: 0 }))));
    const { highestHumidity, highestRainfall } = computeMaxes(results);
    latest = { timestamp: new Date().toISOString(), data: results, highestHumidity, highestRainfall };
    broadcast({ type: 'update', payload: latest });
    console.log('Polled', results.length, 'places at', latest.timestamp);
  } catch (e) {
    console.error('pollAll error', e.message);
  }
}

app.get('/events', (req, res) => {
  res.set({ 'Cache-Control': 'no-cache', 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'init', payload: latest })}\n\n`);
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

app.get('/api/weather', (req, res) => res.json(latest));
app.get('/api/places', (req, res) => res.json({ places }));
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact form:', name, email, message);
  return res.json({ ok: true, message: 'Thanks for contacting us' });
});

function broadcast(payload) {
  for (const r of clients) {
    try { r.write(`data: ${JSON.stringify(payload)}\n\n`); } catch (e) { }
  }
}

async function start() {
  console.log('Geocoding...');
  for (const loc of LOCATIONS) {
    try {
      const { lat, lon } = await geocodeCity(loc.capital);
      places.push({ state: loc.state, capital: loc.capital, lat, lon });
    } catch (e) {
      console.warn('Geocode failed for', loc.capital, e.message);
    }
  }
  console.log('Geocoded', places.length, 'places');
  await pollAll();
  setInterval(pollAll, 60_000);
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log('Backend running on', port));
}

start().catch(err => { console.error(err); process.exit(1); });
