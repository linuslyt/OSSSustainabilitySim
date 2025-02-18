from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

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