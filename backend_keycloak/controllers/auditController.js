import AuditLog from '../models/AuditLog.js';

// GET /api/audit-logs
export const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 30, action, username, from, to } = req.query;
  const filter = {};
  if (action)   filter.action   = action;
  if (username) filter.username = { $regex: username, $options: 'i' };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to)   filter.timestamp.$lte = new Date(to);
  }

  const total = await AuditLog.countDocuments(filter);
  const logs  = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return res.json({ total, page: Number(page), limit: Number(limit), logs });
};
