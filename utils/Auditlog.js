const AuditLog = require("../model/auditlogModel");
const User = require("../model/userModel");  // Import the User model

async function logActivity(userId, action, details) {
    try {
        // Fetch user to check their type
        const user = await User.findById(userId);

        // Check if user is an admin
        if (user && user.userType === 'admin') {
            console.log('Admin activity not logged:', action);
            return;  // Exit the function if user is an admin
        }

        // Create and save the audit log entry
        const auditLog = new AuditLog({
            userId: userId,
            action: action,
            details: details,
        });
        await auditLog.save();
        console.log('Activity logged:', action);
    } catch (err) {
        console.error('Error logging activity:', err);
    }
}

module.exports = logActivity;