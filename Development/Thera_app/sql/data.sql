-- Clean up existing data
DELETE FROM doctor_patients;
DELETE FROM fingers;
DELETE FROM doctors;
DELETE FROM patients;
DELETE FROM users;

-- Insert users (patients)
INSERT INTO users (role, data) VALUES
  ('patient', '{"email": "aliyaa@therahand.com","password": "$2b$10$Y00XOZD/f5gBSpDusPUgU.iJufk6Nxx6gAoHRG8t2eHyGgoP2bK4y","name": "Aliyaa"}'),
  ('patient', '{"email": "ethan@therahand.com","password": "$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze","name": "Ethan"}'),
  ('patient', '{"email": "jhovanny@therahand.com","password": "$2b$10$jlxbNK.iahL/ZSPBEevShOkps4ZfCm/83/.J3gIfIbC/9gZOM7pIK","name": "Jhovanny"}'),
  ('patient', '{"email": "a@abc.com","password": "$2b$10$M11TSOnb7LQGSAElX7HAo.g/upzTbAp5U5A9hUMK9KTxj07JUzzau","name": "User A"}');

-- Promote those users to patients
INSERT INTO patients (id)
SELECT id FROM users WHERE role = 'patient';

-- Insert users (doctors)
INSERT INTO users (role, data) VALUES
  ('doctor', '{"email": "dr.tan@therahand.com","name": "Dr. Tan"}'),
  ('doctor', '{"email": "dr.lu@therahand.com","name": "Dr. Lu"}');

-- Promote those users to doctors
INSERT INTO doctors (id)
SELECT id FROM users WHERE role = 'doctor';

-- Insert fingers for patients
INSERT INTO fingers (patient_id, data) VALUES
  ((SELECT id FROM users WHERE data->>'email' = 'aliyaa@therahand.com'), '{"name": "Index", "position": [-0.621, 0.104, 0.766, 0.016, -0.296, 1.664, 0.019, -0.078, 1.443]}'),
  ((SELECT id FROM users WHERE data->>'email' = 'aliyaa@therahand.com'), '{"name": "Index", "position": [-0.621, 0.104, 0.766, 0.016, -0.296, 1.664, 0.019, -0.078, 1.443]}'),
  ((SELECT id FROM users WHERE data->>'email' = 'ethan@therahand.com'),  '{"name": "Index", "position": [-0.621, 0.104, 0.766, 0.016, -0.296, 1.664, 0.019, -0.078, 1.443]}'),
  ((SELECT id FROM users WHERE data->>'email' = 'jhovanny@therahand.com'), '{"name": "Index", "position": [-0.621, 0.104, 0.766, 0.016, -0.296, 1.664, 0.019, -0.078, 1.443]}'),
  ((SELECT id FROM users WHERE data->>'email' = 'a@abc.com'),            '{"name": "Index", "position": [-0.621, 0.104, 0.766, 0.016, -0.296, 1.664, 0.019, -0.078, 1.443]}');

-- Assign doctor-patient relationships
INSERT INTO doctor_patients (doctor_id, patient_id) VALUES
  (
    (SELECT id FROM users WHERE data->>'email' = 'dr.tan@therahand.com'),
    (SELECT id FROM users WHERE data->>'email' = 'aliyaa@therahand.com')
  ),
  (
    (SELECT id FROM users WHERE data->>'email' = 'dr.tan@therahand.com'),
    (SELECT id FROM users WHERE data->>'email' = 'ethan@therahand.com')
  ),
  (
    (SELECT id FROM users WHERE data->>'email' = 'dr.lu@therahand.com'),
    (SELECT id FROM users WHERE data->>'email' = 'jhovanny@therahand.com')
  );
