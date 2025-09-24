// server/models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'tenant', 'master'],
    default: 'tenant',
    required: true
  },
  tenantapprove: {
    type: Boolean,
    default: false
  },
  adminapprove: { 
    type: Boolean, 
    default: false 
  },
  masterapprove: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true }); // <--- timestamps go here!
module.exports = mongoose.model('User', userSchema);