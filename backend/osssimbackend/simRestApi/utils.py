from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os
from pathlib import Path
import json


TEMPORAL_DATA_DIR = Path(__file__).parent /"asfi_project_info/project_temporal_json_data/"

all_features = [
            'active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
            'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
            'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail'
        ]


def build_stateful_model(original_model_path, feature_dim):
    """
    Rebuilds the LSTM model with a batch size of 1 and time step of 1 for sequential inference.
    
    :param original_model_path: Path to trained model
    :param feature_dim: Number of input features per month
    :return: A stateful LSTM model for inference
    """
    # Load original model to get weights
    original_model = load_model(original_model_path)
    
    # Rebuild model with stateful LSTM (accepting one month at a time)
    model = Sequential([
        LSTM(64, batch_input_shape=(1, 1, feature_dim), stateful=True),  # Now accepts (1, 1, feature_dim)
        Dropout(0.3),
        Dense(2, activation='softmax')
    ])
    
    # Transfer weights from trained model
    model.set_weights(original_model.get_weights())
    
    return model



def predict(history, model_path):
    """
    Perform inference one month at a time while maintaining LSTM state.

    :param history: List of historical monthly data (each row is a feature vector).
    :param model_path: Path to the trained LSTM model.
    :return: List of predictions for each month.
    """
    scaler = MinMaxScaler(feature_range=(-1, 1))  # Use the same scaling as training
    
    # Convert history to DataFrame and scale
    df = pd.DataFrame(history)
    df = df[all_features] # Ensure all features are present
    scaled_data = scaler.fit_transform(df.values)  # Scale the data
    
    feature_dim = scaled_data.shape[1]  # Number of features per month
    print("feature dimension is: ", feature_dim)
    
    # Load stateful model
    model = build_stateful_model(model_path, feature_dim)
    
    predictions = []
    model.reset_states()  # Reset state before new sequence
    
    for month_idx in range(len(history)):
        # Extract one month at a time
        model_input = np.expand_dims(scaled_data[month_idx], axis=(0, 1))  # Shape (1,1,features)
        
        # Predict
        y_pred = model.predict(model_input, batch_size=1)  # Ensure batch_size=1 to match stateful model
        
        # Determine class and confidence
        predicted_class = int(np.argmax(y_pred, axis=1)[0])  # 0 or 1
        confidence = float(np.max(y_pred, axis=1)[0])  # Probability score
        
        predictions.append({
            "month": month_idx + 1,  # Current month being predicted
            "status": predicted_class,
            "confidence_score": confidence,
            "p_grad": confidence if predicted_class == 1 else 1 - confidence,
        })
    
    return predictions


def get_future_data(project_id, m):
    """
    Find the first valid dataset for project_id and return future data excluding the first `m` months.
    """
    for i in range(29, 0, -1):  # Start from N_29 to N_1
        folder_path = os.path.join(TEMPORAL_DATA_DIR, f"N_{i}")
        project_file = os.path.join(folder_path, f"{project_id}.json")  

        if os.path.exists(project_file):
            with open(project_file, "r") as file:
                data = json.load(file)

            history = data.get("history", [])
            
            if len(history) > m:
                return history[m:]  # Exclude the first m months

    return []  # Return empty list if no future data is found
