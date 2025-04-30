import express from 'express';
import cors from 'cors';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenApiValidator from 'express-openapi-validator';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secret = process.env.JWT_SECRET;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// ───── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email and password required');

    const result = await pool.query(
      "SELECT id, role, data FROM users WHERE data->>'email' = $1", [email]
    );
    if (result.rows.length === 0) return res.status(401).send('Invalid credentials');

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.data.password);
    if (!valid) return res.status(401).send('Invalid credentials');

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '30m', algorithm: 'HS256' }
    );

    res.status(200).json({
      id: user.id,
      role: user.role,
      email: user.data.email,
      name: user.data.name,
      accessToken,
    });

  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).send('Internal Server Error');
  }
};

// ───── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
const check = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ───── GET FINGERS ───────────────────────────────────────────────────────────────
const getFingers = async (req, res) => {
  const id = req.user.id;
  const roleResult = await pool.query('SELECT role FROM users WHERE id = $1', [id]);

  if (!roleResult.rows[0]) return res.status(404).send('User not found');
  const role = roleResult.rows[0].role;

  try {
    let result;
    if (role === 'patient') {
      result = await pool.query('SELECT * FROM fingers WHERE patient_id = $1', [id]);
    } else if (role === 'doctor') {
      result = await pool.query(`
        SELECT f.*
        FROM fingers f
        JOIN doctor_patients dp ON f.patient_id = dp.patient_id
        WHERE dp.doctor_id = $1
      `, [id]);
    } else {
      return res.status(403).send('Invalid role');
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error in getFingers:', err);
    res.status(500).send('Internal Server Error');
  }
};

// ───── GET MESSAGES ──────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { patient_id } = req.params;

  try {
    if (userRole === 'doctor') {
      // Doctor: ensure they're assigned to this patient
      const assigned = await pool.query(
        'SELECT 1 FROM doctor_patients WHERE doctor_id = $1 AND patient_id = $2',
        [userId, patient_id]
      );
      if (assigned.rowCount === 0) {
        return res.status(403).send('Doctor not assigned to this patient');
      }

      const result = await pool.query(`
        SELECT *
        FROM messages
        WHERE (sender_id = $1 AND recipient_id = $2)
           OR (sender_id = $2 AND recipient_id = $1)
        ORDER BY sent_at ASC
      `, [userId, patient_id]);

      return res.status(200).json(result.rows);

    } else if (userRole === 'patient') {
      // Patient: can only view messages involving themselves
      if (userId !== patient_id) {
        return res.status(403).send('Patients can only view their own messages');
      }

      const doctor = await pool.query(
        'SELECT doctor_id FROM doctor_patients WHERE patient_id = $1',
        [userId]
      );
      if (doctor.rowCount === 0) {
        return res.status(403).send('No doctor assigned');
      }
      const doctorId = doctor.rows[0].doctor_id;

      const result = await pool.query(`
        SELECT *
        FROM messages
        WHERE (sender_id = $1 AND recipient_id = $2)
           OR (sender_id = $2 AND recipient_id = $1)
        ORDER BY sent_at DESC
      `, [userId, doctorId]);

      return res.status(200).json(result.rows);
    }

    return res.status(403).send('Invalid role');
  } catch (err) {
    console.error('Error in getMessages:', err);
    res.status(500).send('Internal Server Error');
  }
};



// ───── SEND MESSAGE ──────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { patient_id } = req.params;
  const { content } = req.body;
  
  if (!content) return res.status(400).send('Message content required');

  try {
    let recipientId;

    if (userRole === 'doctor') {
      const assigned = await pool.query(
        'SELECT 1 FROM doctor_patients WHERE doctor_id = $1 AND patient_id = $2',
        [userId, patient_id]
      );
      if (assigned.rowCount === 0) return res.status(403).send('Doctor not assigned to this patient');
      recipientId = patient_id;
    } else if (userRole === 'patient') {
      if (userId !== patient_id) return res.status(403).send('Patients can only message their assigned doctor');
      const doctor = await pool.query(
        'SELECT doctor_id FROM doctor_patients WHERE patient_id = $1',
        [userId]
      );
      if (doctor.rowCount === 0) return res.status(403).send('No assigned doctor found');
      recipientId = doctor.rows[0].doctor_id;
    } else {
      return res.status(403).send('Invalid role');
    }

    await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3)',
      [userId, recipientId, content]
    );

    res.status(201).send('Message sent');
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).send('Internal Server Error');
  }
};

//  ───── GET PATIENTS ─────────────────────────────────────────────────────────────────
const getPatients = async (req, res) => {
  const requesterId = req.user.id;
  const requesterRole = req.user.role;
  const { doctor_id } = req.params;

  try {
    // Ensure only the doctor themself can access this
    if (requesterRole !== 'doctor' || requesterId !== doctor_id) {
      return res.status(403).send('Forbidden: You can only view your own patients');
    }

    const result = await pool.query(`
      SELECT u.id, u.data->>'email' AS email, u.data->>'name' AS name
      FROM doctor_patients dp
      JOIN users u ON dp.patient_id = u.id
      WHERE dp.doctor_id = $1
    `, [doctor_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error in getPatients:', err);
    res.status(500).send('Internal Server Error');
  }
};

//  ───── GET DOCTOR ─────────────────────────────────────────────────────────────────

const getDoctorForPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT u.id, u.data->>'name' AS name, u.data->>'email' AS email
      FROM doctor_patients dp
      JOIN users u ON dp.doctor_id = u.id
      WHERE dp.patient_id = $1
    `, [patient_id]);

    if (result.rows.length === 0) {
      return res.status(404).send('No doctor assigned to this patient');
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error in getDoctorForPatient:', err);
    res.status(500).send('Internal Server Error');
  }
};

//  ───── CREATE PATIENT ─────────────────────────────────────────────────────────────────


const createPatient = async (req, res) => {
  const doctorId = req.params.doctor_id;
  const requester = req.user;

  if (requester.role !== 'doctor' || requester.id !== doctorId) {
    return res.status(403).send('Only the logged-in doctor can create patients for themselves');
  }

  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).send('Missing email, name, or password');
  }

  try {
    const exists = await pool.query("SELECT 1 FROM users WHERE data->>'email' = $1", [email]);
    if (exists.rowCount > 0) {
      return res.status(409).send('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);

    const userRes = await pool.query(
      `INSERT INTO users (role, data)
       VALUES ('patient', $1)
       RETURNING id`,
      [{ email, name, password: hashed }]
    );

    const patientId = userRes.rows[0].id;

    // Notify Flask server to create cloud folder for new user
    try {
      await fetch(`http://3.129.247.77:5000/register_user/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (cloudErr) {
      console.error('Cloud user directory creation failed:', cloudErr);
      // Optional: don't throw here so DB user creation still succeeds
    }


    await pool.query(`INSERT INTO patients (id) VALUES ($1)`, [patientId]);
    await pool.query(`INSERT INTO doctor_patients (doctor_id, patient_id) VALUES ($1, $2)`, [doctorId, patientId]);

    res.status(201).json({ id: patientId, email, name });
  } catch (err) {
    console.error('Error in createPatient:', err);
    res.status(500).send('Internal Server Error');
  }
};



// ───── APP SETUP ─────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');
const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));

app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(OpenApiValidator.middleware({
  apiSpec,
  validateRequests: true,
  validateResponses: true,
}));

// ───── ROUTES ────────────────────────────────────────────────────────────────────
app.post('/v0/login', login);
app.get('/v0/home', check, getFingers);
app.get('/v0/messages/:patient_id', check, getMessages);
app.post('/v0/messages/:patient_id', check, sendMessage);
app.get('/v0/home/:doctor_id', check, getPatients);
app.get('/v0/doctor/:patient_id', check, getDoctorForPatient);
app.post('/v0/create/:doctor_id', check, createPatient);

//FETCH DATA FROM AWS FLASK SERVER
app.get('/v0/flex-data', check, async (req, res) => {
  const userId = req.user.id;

  const result = await pool.query('SELECT data->>email AS email FROM users WHERE id = $1', [userId]);
  const email = result.rows[0].email;
  const clientId = email.split('@')[0];  // extract username

  const flaskURL = `http://ec2-3-129-247-77.us-east-2.compute.amazonaws.com:5000/user_data/${clientId}`;
  const response = await axios.get(flaskURL);

  res.json(response.data);
});



// ───── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

export default app;
