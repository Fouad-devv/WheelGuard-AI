import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },

  parameters: {
    meltTemperature:       Number,
    moldTemperature:       Number,
    fillingTime:           Number,
    plasticizingTime:      Number,
    cycleTime:             Number,
    closingForce:          Number,
    clampingForcePeak:     Number,
    torquePeak:            Number,
    torqueMean:            Number,
    backPressurePeak:      Number,
    injectionPressurePeak: Number,
    screwPosition:         Number,
    shotVolume:            Number,
  },

  prediction:    { type: Number, required: true },
  className:     { type: String, required: true },
  color:         String,
  recommendation: String,
  probabilities: { type: Map, of: Number },
  modelVersion:  { type: String, default: 'rf-v1.0' },
  batchId:       { type: String, default: null },
}, { timestamps: false });

PredictionSchema.index({ userId: 1, timestamp: -1 });
PredictionSchema.index({ timestamp: -1 });

export default mongoose.model('Prediction', PredictionSchema);
