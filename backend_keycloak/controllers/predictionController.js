import axios from 'axios';
import FormData from 'form-data';
import Prediction from '../models/Prediction.js';
import AuditLog from '../models/AuditLog.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const logAction = (userId, username, action, resource, details, req) =>
  AuditLog.create({
    userId, username, action, resource, details,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  }).catch(() => {});

// POST /api/predict
export const predict = async (req, res) => {
  try {
    const { data: mlResult } = await axios.post(`${ML_URL}/predict`, req.body, { timeout: 10000 });

    const prediction = await Prediction.create({
      userId:   req.userId,
      username: req.username,
      parameters: {
        meltTemperature:       req.body.meltTemperature,
        moldTemperature:       req.body.moldTemperature,
        fillingTime:           req.body.fillingTime,
        plasticizingTime:      req.body.plasticizingTime,
        cycleTime:             req.body.cycleTime,
        closingForce:          req.body.closingForce,
        clampingForcePeak:     req.body.clampingForcePeak,
        torquePeak:            req.body.torquePeak,
        torqueMean:            req.body.torqueMean,
        backPressurePeak:      req.body.backPressurePeak,
        injectionPressurePeak: req.body.injectionPressurePeak,
        screwPosition:         req.body.screwPosition,
        shotVolume:            req.body.shotVolume,
      },
      prediction:     mlResult.prediction,
      className:      mlResult.className,
      color:          mlResult.color,
      recommendation: mlResult.recommendation,
      probabilities:  mlResult.probabilities,
      modelVersion:   mlResult.modelVersion,
    });

    logAction(req.userId, req.username, 'CREATE', 'prediction',
      { predictionId: prediction._id, className: mlResult.className }, req);

    return res.status(201).json({ ...mlResult, _id: prediction._id });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      return res.status(503).json({ error: 'Service ML indisponible. Vérifiez que FastAPI est démarré.' });
    }
    console.error('predict error:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la prédiction.' });
  }
};

// POST /api/predict/batch  (multipart/form-data with file)
export const predictBatch = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier CSV requis.' });

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename:    req.file.originalname || 'batch.csv',
      contentType: 'text/csv',
    });

    const { data: mlResult } = await axios.post(`${ML_URL}/predict/batch`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    // Persist all batch predictions
    const batchId = new Date().toISOString();
    const docs = mlResult.results.map(r => ({
      userId:      req.userId,
      username:    req.username,
      parameters:  {},
      prediction:  r.prediction,
      className:   r.className,
      color:       r.color,
      probabilities: r.probabilities,
      modelVersion: 'rf-v1.0',
      batchId,
    }));
    await Prediction.insertMany(docs);

    logAction(req.userId, req.username, 'BATCH_PREDICT', 'prediction',
      { total: mlResult.total, batchId }, req);

    return res.json(mlResult);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      return res.status(503).json({ error: 'Service ML indisponible.' });
    }
    console.error('batch error:', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data?.detail || 'Erreur lors du traitement batch.' });
  }
};

// GET /api/predictions/history  (operator → own predictions)
export const getHistory = async (req, res) => {
  const { page = 1, limit = 20, className, from, to } = req.query;
  const filter = { userId: req.userId };
  if (className) filter.className = className;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to)   filter.timestamp.$lte = new Date(to);
  }

  const total = await Prediction.countDocuments(filter);
  const predictions = await Prediction.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return res.json({ total, page: Number(page), limit: Number(limit), predictions });
};

// GET /api/predictions/all  (manager+)
export const getAllPredictions = async (req, res) => {
  const { page = 1, limit = 20, className, from, to, username } = req.query;
  const filter = {};
  if (className) filter.className = className;
  if (username)  filter.username = { $regex: username, $options: 'i' };
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to)   filter.timestamp.$lte = new Date(to);
  }

  const total = await Prediction.countDocuments(filter);
  const predictions = await Prediction.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return res.json({ total, page: Number(page), limit: Number(limit), predictions });
};

// DELETE /api/predictions/:id  (admin)
export const deletePrediction = async (req, res) => {
  const pred = await Prediction.findByIdAndDelete(req.params.id);
  if (!pred) return res.status(404).json({ error: 'Prédiction introuvable.' });

  logAction(req.userId, req.username, 'DELETE', 'prediction', { predictionId: req.params.id }, req);
  return res.json({ message: 'Prédiction supprimée.' });
};
