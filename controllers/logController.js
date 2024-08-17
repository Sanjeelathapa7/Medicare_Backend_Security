const { getAllAuditLogs, getAuditLogsByUserId, getAuditLogsByAction } = require('../utils/auditlogService');

// Handler to get all audit logs
const fetchAllAuditLogs = async (req, res) => {
    try {
        const logs = await getAllAuditLogs();
        res.json({
            success: true,
            message: 'All audit logs fetched successfully!',
            logs: logs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error retrieving audit logs',
            error: err.message
        });
    }
};

// Handler to get audit logs by userId
const fetchAuditLogsByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const logs = await getAuditLogsByUserId(userId);
        res.json({
            success: true,
            message: `Audit logs for user ID ${userId} fetched successfully!`,
            logs: logs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error retrieving audit logs by user ID',
            error: err.message
        });
    }
};

// Handler to get audit logs by action
const fetchAuditLogsByAction = async (req, res) => {
    const { action } = req.params;
    try {
        const logs = await getAuditLogsByAction(action);
        res.json({
            success: true,
            message: `Audit logs for action ${action} fetched successfully!`,
            logs: logs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error retrieving audit logs by action',
            error: err.message
        });
    }
};

module.exports = {
    fetchAllAuditLogs,
    fetchAuditLogsByUserId,
    fetchAuditLogsByAction
};