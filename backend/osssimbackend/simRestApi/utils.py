from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os
from pathlib import Path
import json
TEMPORAL_DATA_DIR = Path(__file__).parent /"asfi_project_info/project_temporal_json_data/"


# Put all Model accessing functions here 
def predict(history, model_path, num_of_months):
    model = load_model(model_path)  # Load the model
    scaler = MinMaxScaler(feature_range=(-1, 1))  # Ensure same scaling as training
    
    # Convert to DataFrame and scale features
    df = pd.DataFrame(history)
    X_input = scaler.fit_transform(df.values)  # Scale the data

    # Reshape to (1, num_of_months, num_features) for LSTM
    X_input = X_input.reshape(1, num_of_months, len(df.columns))

    # Predict probabilities
    y_pred = model.predict(X_input)  # Get probabilities for each class

    predicted_class = int(np.argmax(y_pred, axis=1)[0])  # 0 or 1
    confidence = float(np.max(y_pred, axis=1)[0])  # Probability of predicted class

    return predicted_class, confidence



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
