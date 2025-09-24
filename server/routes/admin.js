const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function authenticateToken(req, res, next) {
  // Expect "Authorization: Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
// GET all users for approval UI
router.get('/all-users', authenticateToken, async (req, res) => {
  const approver = await User.findById(req.user.userId);
  if (!approver || approver.role !== 'master' || !approver.masterapprove)
    return res.status(403).json({ msg: "Not authorized" });
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

//approve tenant from admin/master
router.post('/approvetenant', authenticateToken, async (req, res) => {
  try {
    const approver = await User.findById(req.user.userId);
    if (!approver || !['admin', 'master'].includes(approver.role)) {
      return res.status(403).json({ msg: "Only admin or master can approve tenants" });
    }
    const { mobile, userId } = req.body;
    const query = userId ? { _id: userId } : { mobile };
    const user = await User.findOne(query);
    if (!user || user.role !== 'tenant')
      return res.status(404).json({ msg: "Tenant not found" });
    
    // Update role and approve flags
    user.tenantapprove = true;
    user.adminapprove = false;
    user.masterapprove = false;
    user.role = "tenant";

    await user.save();
    res.json({ msg: "Tenant approved & role updated!",user });
  
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
});

//admin approval from master
router.post('/approveadmin', authenticateToken, async (req, res) => {
  try {
    const approver = await User.findById(req.user.userId);
    if (!approver || approver.role !== 'master' || !approver.masterapprove) {
      return res.status(403).json({ msg: "Only master can approve admins" });
    }
    const { mobile, userId } = req.body;
    const query = userId ? { _id: userId } : { mobile };
    const user = await User.findOne(query);
    if (!user || user.role !== 'admin')
      return res.status(404).json({ msg: "Admin not found" });
    
    user.tenantapprove = false;
    user.adminapprove = true;
    user.masterapprove = false;
    user.role = "admin";
    await user.save();
    res.json({ msg: "Admin approved & role updated!" });

  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
});

//admin promotes to master
router.post('/approvemaster', authenticateToken, async (req, res) => {
  try {
    const approver = await User.findById(req.user.userId);
    if (!approver || approver.role !== 'master' || !approver.masterapprove) {
      return res.status(403).json({ msg: "Only master can promote admins" });
    }
    const { mobile, userId } = req.body;
    const query = userId ? { _id: userId } : { mobile };
    const user = await User.findOne(query);
    if (!user || user.role !== 'admin')
      return res.status(404).json({ msg: "Admin not found" });
    
    user.tenantapprove = false;
    user.adminapprove = true;
    user.masterapprove = true;
    user.role = "master";
    await user.save();
    res.json({ msg: "Admin promoted to master!" });

  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
});

//resetpassword
router.post('/resetpassword', authenticateToken, async (req, res) => {
  try {
    const approver = await User.findById(req.user.userId);
    const { mobile, userId, newPassword } = req.body;
    const query = userId ? { _id: userId } : { mobile };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ msg: "Target user not found" });

    // Only allow:
    // - master can reset anyone's password
    // - admin can reset tenant's password
    // - (optional) user resets own password if logged in:
    //   if (approver._id.equals(user._id)) ... (uncomment if you want)

    if (
      (user.role === "tenant" && !["admin", "master","tenant"].includes(approver.role)) ||
      (user.role === "admin" && !["admin", "master"].includes(approver.role)) ||
      (user.role === "master" && approver.role !== "master")
    ) {
      return res.status(403).json({ msg: "Not allowed to reset this user's password" });
    }

    const bcrypt = require('bcryptjs');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
});

module.exports = router;

