"""
LumiQuality AI — Service ML (FastAPI)
Démarrage : uvicorn main:app --reload --port 8000
"""

import os
import io
import logging
from typing import List, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Chargement du modèle ────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)

def _load(filename):
    path = os.path.join(BASE_DIR, filename)
    if os.path.exists(path):
        return joblib.load(path)
    return None

model  = _load('model.pkl')
scaler = _load('scaler.pkl')

if model is None:
    logger.warning("model.pkl introuvable — exécutez train_model.py d'abord.")

# ── Constantes ───────────────────────────────────────────────────────────────

CLASS_NAMES  = {1: 'Rebut',      2: 'Acceptable', 3: 'Cible',  4: 'Inefficient'}
CLASS_LABELS = {1: 'Rebut (Déchet)', 2: 'Acceptable', 3: 'Cible (Optimal)', 4: 'Inefficient (Surqualité)'}
CLASS_COLORS = {1: 'red',         2: 'orange',     3: 'green', 4: 'yellow'}

RECOMMENDATIONS = {
    1: " Pièce non conforme — à rejeter. Vérifiez la température de fusion, la pression d'injection et le temps de cycle.",
    2: " Qualité limite acceptable. Optimisez la pression d'injection et le volume pour atteindre la classe Cible.",
    3: " Qualité optimale. Maintenez les paramètres actuels.",
    4: "ℹ Surqualité détectée (gaspillage de ressources). Réduisez légèrement la pression et la température.",
}

FEATURE_ORDER = [
    'melt_temperature', 'mold_temperature', 'filling_time', 'plasticizing_time',
    'cycle_time', 'closing_force', 'clamping_force_peak', 'torque_peak',
    'torque_mean', 'back_pressure_peak', 'injection_pressure_peak',
    'screw_position', 'shot_volume',
]

FEATURE_LABELS = [
    'Temp. Fusion (°C)', 'Temp. Moule (°C)', 'Temps Remplissage (s)', 'Temps Plastification (s)',
    'Temps Cycle (s)', 'Force Fermeture', 'Pic Force Serrage', 'Pic Couple (N·m)',
    'Couple Moyen (N·m)', 'Pic Press. Dorsale (Bar)', 'Pic Press. Injection (Bar)',
    'Position Vis (cm)', 'Volume Injection (cm³)',
]

CSV_COLUMN_MAP = {
    'Melt temperature':                                'melt_temperature',
    'Mold temperature':                                'mold_temperature',
    'time_to_fill':                                    'filling_time',
    'ZDx - Plasticizing time':                         'plasticizing_time',
    'ZUx - Cycle time':                                'cycle_time',
    'SKx - Closing force':                             'closing_force',
    'SKs - Clamping force peak value':                 'clamping_force_peak',
    'Ms - Torque peak value current cycle':            'torque_peak',
    'Mm - Torque mean value current cycle':            'torque_mean',
    'APSs - Specific back pressure peak value':        'back_pressure_peak',
    'APVs - Specific injection pressure peak value':   'injection_pressure_peak',
    'CPn - Screw position at the end of hold pressure':'screw_position',
    'SVo - Shot volume':                               'shot_volume',
}

# ── Application ──────────────────────────────────────────────────────────────

app = FastAPI(title='LumiQuality AI — Service ML', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── Schémas Pydantic ─────────────────────────────────────────────────────────

class PredictionInput(BaseModel):
    meltTemperature:       float = Field(..., description='Température de fusion (°C)')
    moldTemperature:       float = Field(..., description='Température du moule (°C)')
    fillingTime:           float = Field(..., description='Temps de remplissage (s)')
    plasticizingTime:      float = Field(..., description='Temps de plastification (s)')
    cycleTime:             float = Field(..., description='Temps de cycle (s)')
    closingForce:          float = Field(..., description='Force de fermeture')
    clampingForcePeak:     float = Field(..., description='Pic force de serrage')
    torquePeak:            float = Field(..., description='Pic de couple (N·m)')
    torqueMean:            float = Field(..., description='Couple moyen (N·m)')
    backPressurePeak:      float = Field(..., description='Pic pression dorsale (Bar)')
    injectionPressurePeak: float = Field(..., description='Pic pression injection (Bar)')
    screwPosition:         float = Field(..., description='Position vis fin maintien (cm)')
    shotVolume:            float = Field(..., description='Volume injecté (cm³)')

class PredictionResult(BaseModel):
    prediction:     int
    className:      str
    classLabel:     str
    color:          str
    recommendation: str
    probabilities:  dict
    modelVersion:   str

# ── Helpers ───────────────────────────────────────────────────────────────────

def _input_to_array(data: PredictionInput) -> np.ndarray:
    return np.array([[
        data.meltTemperature, data.moldTemperature, data.fillingTime,
        data.plasticizingTime, data.cycleTime, data.closingForce,
        data.clampingForcePeak, data.torquePeak, data.torqueMean,
        data.backPressurePeak, data.injectionPressurePeak,
        data.screwPosition, data.shotVolume,
    ]])

def _build_result(pred_class: int, proba_vec: np.ndarray, classes) -> dict:
    prob_dict = {str(int(c)): round(float(p), 4) for c, p in zip(classes, proba_vec)}
    return {
        'prediction':     pred_class,
        'className':      CLASS_NAMES[pred_class],
        'classLabel':     CLASS_LABELS[pred_class],
        'color':          CLASS_COLORS[pred_class],
        'recommendation': RECOMMENDATIONS[pred_class],
        'probabilities':  prob_dict,
        'modelVersion':   'rf-v1.0',
    }

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get('/')
def root():
    return {'message': 'LumiQuality AI — Service ML', 'status': 'running', 'modelLoaded': model is not None}

@app.get('/health')
def health():
    return {'status': 'healthy', 'modelLoaded': model is not None}

@app.post('/predict', response_model=PredictionResult)
def predict(data: PredictionInput):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail='Modèle non chargé. Exécutez train_model.py.')

    X = _input_to_array(data)
    X_scaled = scaler.transform(X)
    pred_class = int(model.predict(X_scaled)[0])
    proba_vec  = model.predict_proba(X_scaled)[0]

    return _build_result(pred_class, proba_vec, model.classes_)

@app.post('/predict/batch')
async def predict_batch(file: UploadFile = File(...)):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail='Modèle non chargé. Exécutez train_model.py.')

    content = await file.read()
    try:
        # Accept semicolon or comma separator
        text = content.decode('utf-8')
        sep = ';' if ';' in text.split('\n')[0] else ','
        df = pd.read_csv(io.StringIO(text), sep=sep)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Erreur lecture CSV : {e}')

    df = df.rename(columns=CSV_COLUMN_MAP)

    missing = [f for f in FEATURE_ORDER if f not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f'Colonnes manquantes : {missing}. Utilisez le format CSV du dataset.'
        )

    X = df[FEATURE_ORDER].values
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)
    probas      = model.predict_proba(X_scaled)

    results = []
    for i, (pred, proba) in enumerate(zip(predictions, probas)):
        pred_class = int(pred)
        results.append({
            'row':        i + 1,
            'prediction': pred_class,
            'className':  CLASS_NAMES[pred_class],
            'color':      CLASS_COLORS[pred_class],
            'probabilities': {str(int(c)): round(float(p), 4)
                              for c, p in zip(model.classes_, proba)},
        })

    return {'total': len(results), 'results': results}

@app.get('/feature-importance')
def feature_importance():
    if model is None:
        raise HTTPException(status_code=503, detail='Modèle non chargé.')
    if not hasattr(model, 'feature_importances_'):
        return {'features': [], 'note': 'Ce modèle ne supporte pas feature_importances_'}

    importances = model.feature_importances_
    data = sorted(
        zip(FEATURE_LABELS, importances),
        key=lambda x: x[1], reverse=True
    )
    return {'features': [{'name': n, 'importance': round(float(v), 4)} for n, v in data]}

