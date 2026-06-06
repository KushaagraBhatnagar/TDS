import mongoose from 'mongoose';

// Verify username, email, and password schema bounds for signup
export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  next();
};

// Validate login credentials existence
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!password || typeof password !== 'string' || password === '') {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

// Validate stage changes to prevent dirty Mongoose states
export const validateStageUpdate = (req, res, next) => {
  const { stage } = req.body;
  const validStages = ['Lead', 'Onboarding', 'Searching', 'Matched', 'Inactive'];

  if (!stage || !validStages.includes(stage)) {
    return res.status(400).json({ error: `Invalid journey stage. Allowed: ${validStages.join(', ')}` });
  }

  next();
};

// Validate Call Logs meeting note texts
export const validateNoteLog = (req, res, next) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Note content cannot be empty' });
  }

  next();
};

// Validate weight customizer integers
export const validateWeightsUpdate = (req, res, next) => {
  const { weights } = req.body;
  const requiredWeights = ['age', 'location', 'income', 'diet', 'values', 'education', 'religion'];

  if (!weights) {
    return res.status(400).json({ error: 'Custom weights payload is required' });
  }

  for (const key of requiredWeights) {
    const val = Number(weights[key]);
    if (isNaN(val) || val < 1 || val > 10) {
      return res.status(400).json({ error: `Weight for "${key}" must be an integer between 1 and 10` });
    }
  }

  next();
};
