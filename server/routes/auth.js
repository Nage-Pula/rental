// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret123';

// Signup
router.post('/signup', async (req, res) => {
  const { mobile, password, role } = req.body;
  try {
    const exists = await User.findOne({ mobile });
    if (exists) return res.status(400).json({ msg: 'Mobile already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ mobile, passwordHash, role, approved: role==='admin'?true:false });
    await user.save();
    res.json({ msg: "Signup successful! Awaiting admin approval", userId: user._id });
  } catch (err) {
    res.status(500).json({ msg: 'Error signing up', err });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    // Approval check by role
    if (
      (user.role === 'tenant' && !user.tenantapprove) ||
      (user.role === 'admin' && !user.adminapprove) ||
      (user.role === 'master' && !user.masterapprove)
    ) return res.status(401).json({ msg: 'Not yet approved to login!' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ msg: "Incorrect password" });

    // login success
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { userId: user._id, mobile: user.mobile, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Login error', err });
  }
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
//get call me
// 👇👇👇  THIS IS THE PROFILE ENDPOINT YOU NEED
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
});

module.exports = router;