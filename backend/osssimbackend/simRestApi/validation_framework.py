import os
import pandas as pd
import numpy as np
import json
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path

PROJECT_DATA_DIR = Path(__file__).parent / "asfi_project_info/project_data/"
MODEL_PATH = Path(__file__).parent / 'lstm_models/model_8.h5'

RESULTS_CSV_PATH = Path(__file__).parent / "validation/validation_results.csv"
RESULTS_JSON_PATH = Path(__file__).parent / "validation/validation_results.json"

all_features = [
    'active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
    'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
    'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail'
]

# Load ground truth sustainability labels (0,1) from the hotorical data for each project
def load_ground_truth():
    labels = {}
    for filename in os.listdir(PROJECT_DATA_DIR):
        if filename.endswith(".json"):
            project_id = filename.split(".")[0]
            with open(os.path.join(PROJECT_DATA_DIR, filename), "r") as file:
                project_data = json.load(file)
                labels[project_id] = int(project_data["status"])  
    return labels

def load_project_data(project_id):
    file_path = os.path.join(PROJECT_DATA_DIR, f"{project_id}.json")
    if not os.path.exists(file_path):
        return None  
    
    with open(file_path, "r") as file:
        project_json = json.load(file)

    history = project_json["history"]

    return history  

def build_stateful_model(original_model_path, feature_dim):
    original_model = load_model(original_model_path)
    
    model = Sequential([
        LSTM(64, batch_input_shape=(1, 1, feature_dim), stateful=True),
        Dropout(0.3),
        Dense(2, activation='softmax')
    ])
    
    model.set_weights(original_model.get_weights())
    
    return model

def predict(history, model_path):
    scaler = MinMaxScaler(feature_range=(-1, 1))

    df = pd.DataFrame(history)  
    df = df[all_features] 
    scaled_data = scaler.fit_transform(df.values)  

    feature_dim = scaled_data.shape[1]

    model = build_stateful_model(model_path, feature_dim)

    predictions = []
    model.reset_states()

    for month_idx in range(len(history)):
        model_input = np.expand_dims(scaled_data[month_idx], axis=(0, 1))  

        y_pred = model.predict(model_input, batch_size=1)  

        predicted_class = int(np.argmax(y_pred, axis=1)[0])  
        confidence = float(np.max(y_pred, axis=1)[0])  

        predictions.append({
            "month": month_idx + 1,
            "status": predicted_class,
            "confidence_score": confidence,
            "p_grad": confidence if predicted_class == 1 else 1 - confidence,
        })

    return predictions

def validate_model():
    model = load_model(MODEL_PATH)
    ground_truth = load_ground_truth()

    validation_results = []
    all_project_predictions = {}

    y_true, y_pred = [], []

    for project_id, true_label in ground_truth.items():
        history = load_project_data(project_id)

        if history is None:
            continue  

        model_predictions = predict(history, MODEL_PATH)

        if len(model_predictions) == 0:
            print(f"ERROR: No predictions generated for {project_id}")
            continue

        # Here, uses the last months prediction as final decision. Can discuss what method we'd like to use
        final_status = model_predictions[-1]['status']
        final_confidence = model_predictions[-1]['confidence_score']

        y_true.append(true_label)
        y_pred.append(final_status)

        # Metrics that compare the predicted output to real historical data -project precision, recall, F1-score
        precision, recall, f1, _ = precision_recall_fscore_support(
            [true_label], [final_status], average='binary', zero_division=0
        )

        validation_results.append({
            "project_id": project_id,
            "true_status": true_label,
            "predicted_status": final_status,
            "confidence_score": final_confidence,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        })

        all_project_predictions[project_id] = model_predictions

    global_accuracy = accuracy_score(y_true, y_pred)
    global_precision, global_recall, global_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average='binary', zero_division=0
    )
    global_conf_matrix = confusion_matrix(y_true, y_pred)

    results_df = pd.DataFrame(validation_results)
    results_df.to_csv(RESULTS_CSV_PATH, index=False)
    
    with open(RESULTS_JSON_PATH, "w") as json_file:
        json.dump(all_project_predictions, json_file, indent=4)

    print(f"Global Accuracy: {global_accuracy:.4f}")
    print(f"Global Precision: {global_precision:.4f}")
    print(f"Global Recall: {global_recall:.4f}")
    print(f"Global F1-score: {global_f1:.4f}")
    print("Global Confusion Matrix:\n", global_conf_matrix)

    print(f"Results saved to:\n - {RESULTS_CSV_PATH} (tabular per project)\n - {RESULTS_JSON_PATH} (full month-by-month predictions)")

validate_model()
