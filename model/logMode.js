// AuditLog.js
const mongoose = require('mongoose');

// Define the schema for audit logs
const auditLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create the model for audit logs
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;