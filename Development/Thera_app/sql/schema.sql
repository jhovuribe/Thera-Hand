-- Your DDL statements go here
\connect postgres
-- Drop existing tables in dependency order
DROP TABLE IF EXISTS doctor_patients CASCADE;
DROP TABLE IF EXISTS fingers CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT CHECK (role IN ('doctor', 'patient')) NOT NULL,
    data JSONB
);

-- Patients table (inherits from users)
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table (inherits from users)
CREATE TABLE doctors (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- Fingers table (belongs to patients)
CREATE TABLE fingers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    data JSONB
);

-- Join table: which doctor is assigned to which patient
CREATE TABLE doctor_patients (
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, patient_id)
);

-- Each DDL statement must be on a single line