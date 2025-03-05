from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import os
from pathlib import Path
import json
TEMPORAL_DATA_DIR = Path(__file__).parent /"asfi_project_info/project_temporal_json_data/"



def predict(history, model_path, num_of_months=8):
    model = load_model(model_path)  # Load the trained LSTM model
    scaler = MinMaxScaler(feature_range=(-1, 1))  # Same scaling as training
    
    # Convert history to DataFrame and scale
    df = pd.DataFrame(history)
    scaled_data = scaler.fit_transform(df.values)  # Scale the data

    predictions = []
    
    # Slide an 8-month window over the historical data
    for start_index in range(len(history) - 7):
        # Extract 8-month window
        model_input = scaled_data[start_index:start_index + 8]
        
        # Reshape for LSTM input (1, time_steps, features)
        model_input = model_input.reshape(1, num_of_months, model_input.shape[1])
        
        # Predict
        y_pred = model.predict(model_input)
        
        # Determine class and confidence
        predicted_class = int(np.argmax(y_pred, axis=1)[0])  # 0 or 1
        confidence = float(np.max(y_pred, axis=1)[0])  # Probability score

        predictions.append({
            "start_month": start_index + 1,  # Start of the 8-month window
            "predicted_month": start_index + 9,  # Month being predicted
            "status": predicted_class,
            "confidence_score": round(confidence, 2)
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
