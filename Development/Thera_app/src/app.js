// Import modules using ES Module syntax
import express from 'express';
import cors from 'cors';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // For __dirname
import OpenApiValidator from 'express-openapi-validator';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT secret
const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // (keep your real secret)

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Login endpoint
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Email and password required');
    }

    const result = await pool.query(
      "SELECT id, data FROM users WHERE data->>'email' = $1", [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).send('Invalid credentials');
    }

    const user = result.rows[0];
    const hashedPassword = user.data.password;

    const valid = await bcrypt.compare(password, hashedPassword);
    if (!valid) {
      return res.status(401).send('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { id: user.id },
      secret,
      { expiresIn: '30m', algorithm: 'HS256' }
    );

    res.status(200).json({ id: user.id, accessToken });

  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).send('Internal Server Error');
  }
};

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

const getFingers = async (req, res) => {
  const id = req.user.id;
  const roleResult = await pool.query(
    'SELECT role FROM users WHERE id = $1', [id]
  );

  if (!roleResult.rows[0]) {
    return res.status(404).send('User not found');
  }

  const role = roleResult.rows[0].role;

  let result;
  if (role === 'patient') {
    result = await pool.query(
      'SELECT * FROM fingers WHERE patient_id = $1', [id]
    );
  } else if (role === 'doctor') {
    result = await pool.query(`
      SELECT f.*
      FROM fingers f
      INNER JOIN doctor_patients dp ON f.patient_id = dp.patient_id
      WHERE dp.doctor_id = $1
    `, [id]);
  } else {
    return res.status(403).send('Invalid role');
  }

  res.status(200).json(result.rows);
};

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

// Define routes
app.post('/v0/login', login);
app.get('/v0/home', check, getFingers);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

export default app;
