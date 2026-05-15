import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/mongoConn.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { attachUserId } from './Middleware/attachUserId.js';
import { keycloakAuth } from './Middleware/keycloakAuth.js';

// Routes
import homeRoute       from './routers/homeRoute.js';
import predictionRoute from './routers/predictionRoute.js';
import statsRoute      from './routers/statsRoute.js';
import usersRoute      from './routers/usersRoute.js';
import auditRoute      from './routers/auditRoute.js';

connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// All routes below require a valid Keycloak Bearer token
app.use(keycloakAuth, attachUserId);

app.use('/api', predictionRoute);
app.use('/api', statsRoute);
app.use('/api', usersRoute);
app.use('/api', auditRoute);
app.use('/api/home', homeRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connecté');
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
});
