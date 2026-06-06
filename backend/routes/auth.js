import express from 'express';
import jwt from 'jsonwebtoken';
import Matchmaker from '../models/Matchmaker.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await Matchmaker.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const matchmaker = new Matchmaker({ username, email, password });
    await matchmaker.save();

    const accessToken = generateAccessToken(matchmaker);
    const refreshToken = generateRefreshToken(matchmaker);

    matchmaker.refreshTokens.push(refreshToken);
    await matchmaker.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: matchmaker._id,
        username: matchmaker.username,
        email: matchmaker.email
      }
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed due to an internal server error' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const matchmaker = await Matchmaker.findOne({ username });
    if (!matchmaker) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await matchmaker.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const accessToken = generateAccessToken(matchmaker);
    const refreshToken = generateRefreshToken(matchmaker);

    matchmaker.refreshTokens.push(refreshToken);
    await matchmaker.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: matchmaker._id,
        username: matchmaker.username,
        email: matchmaker.email
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed due to an internal server error' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const matchmaker = await Matchmaker.findById(decoded.id);
    if (!matchmaker || !matchmaker.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Token is not active or invalid' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(matchmaker);
    const newRefreshToken = generateRefreshToken(matchmaker);

    // Rotate refresh token (replace old with new in DB)
    matchmaker.refreshTokens = matchmaker.refreshTokens.filter(t => t !== refreshToken);
    matchmaker.refreshTokens.push(newRefreshToken);
    await matchmaker.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(500).json({ error: 'Token refresh failed due to an internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Decode and find user
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const matchmaker = await Matchmaker.findById(decoded.id);
      if (matchmaker) {
        matchmaker.refreshTokens = matchmaker.refreshTokens.filter(t => t !== refreshToken);
        await matchmaker.save();
      }
    } catch (err) {
      // If verification fails but token is passed, we attempt to clean it up if decoded is possible
      const payload = jwt.decode(refreshToken);
      if (payload && payload.id) {
        const matchmaker = await Matchmaker.findById(payload.id);
        if (matchmaker) {
          matchmaker.refreshTokens = matchmaker.refreshTokens.filter(t => t !== refreshToken);
          await matchmaker.save();
        }
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ error: 'Logout failed due to an internal server error' });
  }
});

export default router;
