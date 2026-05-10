"""
Script d'entraînement du modèle LumiQuality AI.
Exécuter une fois depuis le dossier FastApi_ML :  python train_model.py
Génère model.pkl et scaler.pkl dans le même dossier.
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import f1_score, accuracy_score, classification_report, confusion_matrix
import joblib

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data.csv')

COLUMN_MAP = {
    'Melt temperature':                            'melt_temperature',
    'Mold temperature':                            'mold_temperature',
    'time_to_fill':                                'filling_time',
    'ZDx - Plasticizing time':                     'plasticizing_time',
    'ZUx - Cycle time':                            'cycle_time',
    'SKx - Closing force':                         'closing_force',
    'SKs - Clamping force peak value':             'clamping_force_peak',
    'Ms - Torque peak value current cycle':        'torque_peak',
    'Mm - Torque mean value current cycle':        'torque_mean',
    'APSs - Specific back pressure peak value':    'back_pressure_peak',
    'APVs - Specific injection pressure peak value': 'injection_pressure_peak',
    'CPn - Screw position at the end of hold pressure': 'screw_position',
    'SVo - Shot volume':                           'shot_volume',
    'quality':                                     'quality',
}

FEATURE_ORDER = [
    'melt_temperature', 'mold_temperature', 'filling_time', 'plasticizing_time',
    'cycle_time', 'closing_force', 'clamping_force_peak', 'torque_peak',
    'torque_mean', 'back_pressure_peak', 'injection_pressure_peak',
    'screw_position', 'shot_volume',
]

def load_data():
    df = pd.read_csv(DATA_PATH, sep=';')
    df = df.rename(columns=COLUMN_MAP)
    df['quality'] = df['quality'].astype(int)
    X = df[FEATURE_ORDER]
    y = df['quality']
    print(f"Dataset chargé: {len(df)} échantillons, classes: {sorted(y.unique())}")
    print(f"Distribution des classes:\n{y.value_counts().sort_index()}")
    return X, y

def train():
    X, y = load_data()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'KNN':                 KNeighborsClassifier(n_neighbors=5),
        'Decision Tree':       DecisionTreeClassifier(random_state=42),
        'Random Forest':       RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}

    print("\n--- Comparaison des modèles (validation croisée 5-fold) ---")
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        f1 = f1_score(y_test, y_pred, average='macro')
        acc = accuracy_score(y_test, y_pred)
        cv_f1 = cross_val_score(model, X_scaled, y, cv=cv, scoring='f1_macro', n_jobs=-1).mean()
        results[name] = {'model': model, 'f1': f1, 'acc': acc, 'cv_f1': cv_f1}
        print(f"  {name:<22} F1={f1:.4f}  Acc={acc:.4f}  CV-F1={cv_f1:.4f}")

    best_name = max(results, key=lambda k: results[k]['cv_f1'])
    best = results[best_name]
    print(f"\nMeilleur modèle : {best_name}")
    print(f"  F1-score macro : {best['f1']:.4f}")
    print(f"  Accuracy       : {best['acc']:.4f}")
    print("\nRapport de classification complet :")
    print(classification_report(y_test, best['model'].predict(X_test),
                                target_names=['Rebut', 'Acceptable', 'Cible', 'Inefficient']))
    print("Matrice de confusion :")
    print(confusion_matrix(y_test, best['model'].predict(X_test)))

    out_dir = os.path.dirname(__file__)
    joblib.dump(best['model'], os.path.join(out_dir, 'model.pkl'))
    joblib.dump(scaler,         os.path.join(out_dir, 'scaler.pkl'))
    print(f"\nModèle sauvegardé : {best_name} → model.pkl + scaler.pkl")


if __name__ == '__main__':
    train()
