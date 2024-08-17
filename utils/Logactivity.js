const AuditLog = require("../model/auditlogModel");

// Function to get all audit logs
async function getAllAuditLogs() {
    try {
        const logs = await AuditLog.find(); // Retrieves all logs
        return logs;
    } catch (err) {
        console.error('Error retrieving audit logs:', err);
        throw err;
    }
}

// Function to get audit logs by userId
async function getAuditLogsByUserId(userId) {
    try {
        const logs = await AuditLog.find({ userId: userId }); // Retrieves logs for a specific user
        return logs;
    } catch (err) {
        console.error('Error retrieving audit logs by user ID:', err);
        throw err;
    }
}

// Function to get audit logs by action
async function getAuditLogsByAction(action) {
    try {
        const logs = await AuditLog.find({ action: action }); // Retrieves logs for a specific action
        return logs;
    } catch (err) {
        console.error('Error retrieving audit logs by action:', err);
        throw err;
    }
}

module.exports = {
    getAllAuditLogs,
    getAuditLogsByUserId,
    getAuditLogsByAction
};