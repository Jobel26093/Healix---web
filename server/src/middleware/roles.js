const { getDB } = require('../db/store');

// Role-based access control based on the active session user.
//   ADMIN (doctor): full access (view / edit / delete)
//   NURSE:          view & edit appointments of supervising doctor via /api/nurse (never delete)
//   USER (patient): view own appointments only
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const db = getDB();
    const explicitId = req.headers['x-user-id'] || req.query.patientId || req.body?.patientId;
    let user = null;

    if (explicitId) {
      user = (db.users || []).find(u => 
        u.id === explicitId || 
        (u.email && u.email.toLowerCase() === String(explicitId).toLowerCase()) ||
        (u.username && u.username.toLowerCase() === String(explicitId).toLowerCase())
      );
    }

    if (!user) {
      user = db.activeUser;
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "Please log in to continue." });
    }

    // Admin has universal authority across all endpoints
    if (user.role === 'ADMIN' || allowedRoles.includes(user.role)) {
      req.db = db;
      req.activeUser = user;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access denied: your account (${user.role}) is not permitted to perform this action.`
    });
  };
}

module.exports = { requireRole };
