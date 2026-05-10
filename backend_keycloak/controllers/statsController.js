import Prediction from '../models/Prediction.js';
import axios from 'axios';

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const CLASS_NAMES = { 1: 'Cible', 2: 'Acceptable', 3: 'Limite', 4: 'Rebut' };
const CLASS_COLORS = { 1: '#22c55e', 2: '#3b82f6', 3: '#f97316', 4: '#ef4444' };

function buildClassDistribution(predictions) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  predictions.forEach(p => { counts[p.prediction] = (counts[p.prediction] || 0) + 1; });
  return Object.entries(counts).map(([k, v]) => ({
    name: CLASS_NAMES[k], value: v, color: CLASS_COLORS[k], classId: Number(k),
  }));
}

function buildDailyTrend(predictions, days = 7) {
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayPreds = predictions.filter(p =>
      new Date(p.timestamp).toISOString().slice(0, 10) === dateStr
    );
    result.push({
      date: dateStr,
      total: dayPreds.length,
      cible:       dayPreds.filter(p => p.prediction === 1).length,
      acceptable:  dayPreds.filter(p => p.prediction === 2).length,
      limite:      dayPreds.filter(p => p.prediction === 3).length,
      rebut:       dayPreds.filter(p => p.prediction === 4).length,
    });
  }
  return result;
}

// GET /api/stats/dashboard  (personal KPIs)
export const getDashboard = async (req, res) => {
  const now = new Date();
  const startOfDay   = new Date(now.setHours(0, 0, 0, 0));
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);

  const [today, week, month, all7days] = await Promise.all([
    Prediction.find({ userId: req.userId, timestamp: { $gte: startOfDay } }).lean(),
    Prediction.find({ userId: req.userId, timestamp: { $gte: startOfWeek } }).lean(),
    Prediction.find({ userId: req.userId, timestamp: { $gte: startOfMonth } }).lean(),
    Prediction.find({ userId: req.userId, timestamp: { $gte: startOfWeek } }).lean(),
  ]);

  const rebutRate = week.length
    ? Math.round((week.filter(p => p.prediction === 4).length / week.length) * 100)
    : 0;

  return res.json({
    kpis: {
      today:     today.length,
      week:      week.length,
      month:     month.length,
      rebutRate,
    },
    classDistribution: buildClassDistribution(month),
    dailyTrend:        buildDailyTrend(all7days, 7),
  });
};

// GET /api/stats/global  (manager+)
export const getGlobal = async (req, res) => {
  const now = new Date();
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);

  const [all, week, month, all7days] = await Promise.all([
    Prediction.find({}).lean(),
    Prediction.find({ timestamp: { $gte: startOfWeek } }).lean(),
    Prediction.find({ timestamp: { $gte: startOfMonth } }).lean(),
    Prediction.find({ timestamp: { $gte: startOfWeek } }).lean(),
  ]);

  const rebutRate = all.length
    ? Math.round((all.filter(p => p.prediction === 4).length / all.length) * 100)
    : 0;

  // Operator leaderboard (predictions count per user this week)
  const operatorMap = {};
  week.forEach(p => {
    if (!operatorMap[p.username]) operatorMap[p.username] = 0;
    operatorMap[p.username]++;
  });
  const operatorStats = Object.entries(operatorMap)
    .map(([username, count]) => ({ username, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Feature importance from ML
  let featureImportance = [];
  try {
    const { data } = await axios.get(`${ML_URL}/feature-importance`, { timeout: 5000 });
    featureImportance = data.features || [];
  } catch (_) {}

  return res.json({
    kpis: {
      total:     all.length,
      week:      week.length,
      month:     month.length,
      rebutRate,
    },
    classDistribution: buildClassDistribution(all),
    dailyTrend:        buildDailyTrend(all7days, 7),
    operatorStats,
    featureImportance,
  });
};
