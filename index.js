const express = require('express');
const pool = require('./db');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
require('dotenv').config();

const app = express();

// Manual CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

/**
 * ================================
 * 🐾 PET WATER LEVEL ENDPOINTS
 * ================================
 */
app.post('/api/water-level', async (req, res) => {
  const { adcValue, percent, status } = req.body;
  if (adcValue == null || percent == null || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pet_water_level (adc_value, percent, status, timestamp)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [adcValue, percent, status]
    );
    res.status(201).json({ message: 'Data stored', data: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/water-level/day/:date', async (req, res) => {
  const queryDate = req.params.date || dayjs().format('YYYY-MM-DD');
  if (!dayjs(queryDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const start = `${queryDate}T00:00:00Z`;
  const end = `${queryDate}T23:59:59Z`;

  try {
    const result = await pool.query(
      `SELECT * FROM pet_water_level WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [start, end]
    );
    res.json({ date: queryDate, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/water-level/week', async (req, res) => {
  const today = dayjs();
  const startOfWeek = today.startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');
  const endOfWeek = today.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');

  try {
    const result = await pool.query(
      `SELECT * FROM pet_water_level WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [startOfWeek, endOfWeek]
    );
    res.json({ week_start: startOfWeek, week_end: endOfWeek, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * ================================
 * ❤️ PET BPM ENDPOINTS
 * ================================
 */
app.post('/api/pet-bpm', async (req, res) => {
  const { bpm } = req.body;
  if (bpm == null) return res.status(400).json({ error: 'Missing bpm value' });

  try {
    const result = await pool.query(
      `INSERT INTO pet_heart_rate (bpm, timestamp) VALUES ($1, NOW()) RETURNING *`,
      [bpm]
    );
    res.status(201).json({ message: 'Data stored', data: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-bpm/day/:date', async (req, res) => {
  const queryDate = req.params.date || dayjs().format('YYYY-MM-DD');
  if (!dayjs(queryDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const start = `${queryDate}T00:00:00Z`;
  const end = `${queryDate}T23:59:59Z`;

  try {
    const result = await pool.query(
      `SELECT * FROM pet_heart_rate WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [start, end]
    );
    res.json({ date: queryDate, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-bpm/week', async (req, res) => {
  const today = dayjs();
  const startOfWeek = today.startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');
  const endOfWeek = today.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');

  try {
    const result = await pool.query(
      `SELECT * FROM pet_heart_rate WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [startOfWeek, endOfWeek]
    );
    res.json({ week_start: startOfWeek, week_end: endOfWeek, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * ================================
 * 📍 PET LOCATION ENDPOINTS
 * ================================
 */
app.post('/api/pet-location', async (req, res) => {
  const { latitude, longitude, altitude } = req.body;
  if (latitude == null || longitude == null || altitude == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pet_roaming_path (latitude, longitude, altitude, timestamp)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [latitude, longitude, altitude]
    );
    res.status(201).json({ message: 'Data stored', data: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-location/day/:date', async (req, res) => {
  const queryDate = req.params.date || dayjs().format('YYYY-MM-DD');
  if (!dayjs(queryDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const start = `${queryDate}T00:00:00Z`;
  const end = `${queryDate}T23:59:59Z`;

  try {
    const result = await pool.query(
      `SELECT * FROM pet_roaming_path WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [start, end]
    );
    res.json({ date: queryDate, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-location/week', async (req, res) => {
  const today = dayjs();
  const startOfWeek = today.startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');
  const endOfWeek = today.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');

  try {
    const result = await pool.query(
      `SELECT * FROM pet_roaming_path WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [startOfWeek, endOfWeek]
    );
    res.json({ week_start: startOfWeek, week_end: endOfWeek, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * ================================
 * 🍖 PET FOOD WEIGHT ENDPOINTS
 * ================================
 */
app.post('/api/pet-food-weight', async (req, res) => {
  const { food_weight } = req.body;
  if (food_weight == null) {
    return res.status(400).json({ error: 'Missing food_weight value' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pet_food_cup (weight_grams, timestamp) VALUES ($1, NOW()) RETURNING *`,
      [food_weight]
    );
    res.status(201).json({ message: 'Data stored', data: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-food-weight/day/:date', async (req, res) => {
  const queryDate = req.params.date || dayjs().format('YYYY-MM-DD');
  if (!dayjs(queryDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const start = `${queryDate}T00:00:00Z`;
  const end = `${queryDate}T23:59:59Z`;

  try {
    const result = await pool.query(
      `SELECT * FROM pet_food_cup WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [start, end]
    );
    res.json({ date: queryDate, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/pet-food-weight/week', async (req, res) => {
  const today = dayjs();
  const startOfWeek = today.startOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');
  const endOfWeek = today.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]');

  try {
    const result = await pool.query(
      `SELECT * FROM pet_food_cup WHERE timestamp BETWEEN $1 AND $2 ORDER BY timestamp ASC`,
      [startOfWeek, endOfWeek]
    );
    res.json({ week_start: startOfWeek, week_end: endOfWeek, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/pet-data', async (req,res)=>{
  const {
    mode, pump, waterLevel, weight,
    gps, bpm, spo2
  } = req.body;

  if(mode==null || pump==null || waterLevel==null || weight==null) 
    return res.status(400).json({error:"Missing required fields"});

  try {
    // Insert water + food
    await pool.query(
      `INSERT INTO pet_food_cup (weight_grams, status, timestamp)
       VALUES ($1, $2, NOW())`,
      [weight, weight>=700?'full':weight>=400?'half':weight>=100?'low':'empty']
    );
    await pool.query(
      `INSERT INTO pet_water_level (percent, status, timestamp)
       VALUES ($1, $2, NOW())`,
      [waterLevel, waterLevel>2000?'high':waterLevel<1000?'low':'medium']
    );
    // Insert GPS & vitals
    if(gps && bpm!=null && spo2!=null){
      await pool.query(
        `INSERT INTO pet_roaming_path (latitude, longitude, altitude, timestamp)
         VALUES ($1,$2,$3,NOW())`,
        [gps.lat,gps.lng,gps.alt]
      );
      await pool.query(
        `INSERT INTO pet_heart_rate (bpm, timestamp) VALUES ($1,NOW())`,
        [bpm]
      );
      await pool.query(
        `INSERT INTO pet_blood_oxygen (spo2,timestamp) VALUES ($1,NOW())`,
        [spo2]
      );
    }

    res.json({message:"Data stored"});
  } catch(err){
    console.error(err);
    res.status(500).json({error:"DB error"});
  }
});

/**
 * ================================
 * 🚀 SERVER START
 * ================================
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 petcare API running on port ${PORT}`));
