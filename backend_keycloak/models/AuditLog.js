import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  username:  { type: String, required: true },
  action:    { type: String, required: true },
  resource:  { type: String, required: true },
  details:   { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: 'unknown' },
  timestamp: { type: Date, default: Date.now },
});

AuditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
