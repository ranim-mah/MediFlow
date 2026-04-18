const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  ASSISTANT: 'assistant',
  RECEPTION: 'reception',
  NURSE: 'nurse',
  PATIENT: 'patient',
};

const ALL_ROLES = Object.values(ROLES);

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  WAITING: 'waiting',
};

const VISIT_STATUS = {
  IN_SESSION: 'in_session',
  COMPLETED: 'completed',
  PAUSED: 'paused',
};

const GENDER = { MALE: 'male', FEMALE: 'female', OTHER: 'other' };

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

module.exports = {
  ROLES,
  ALL_ROLES,
  APPOINTMENT_STATUS,
  VISIT_STATUS,
  GENDER,
  BLOOD_TYPES,
};
