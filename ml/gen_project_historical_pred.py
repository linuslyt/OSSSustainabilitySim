import os
import json
import numpy as np
import pandas as pd
from tqdm import tqdm
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import tensorflow_addons as tfa
from tensorflow.keras.utils import custom_object_scope
from joblib import load
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler



# Set up paths
file_path = Path(__file__)
parent_dir = file_path.parent.resolve()
grand_parent_dir = file_path.parent.parent.parent.resolve()

class StatelessProjectPredictor:
    def __init__(self):
        """
        Initialize the predictor with a stateless LSTM model.
        """
        self.models_dir = os.path.join(parent_dir, 'results/models')
        self.project_data_dir = os.path.join(parent_dir, 'project_data/')
        self.original_model_path = os.path.join(self.models_dir, 'modelWeighted_8.h5')
        
        # Features
        self.all_features = [
            'active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
            'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
            'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail'
        ]
        
        # Load scaler
        # self.scaler = load(os.path.join(self.models_dir, 'scaler_1.joblib'))
        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        
        # Load model structure (weights set dynamically)
        self.stateless_model = None

    def build_stateless_model(self, feature_dim):
        """
        Builds a stateless LSTM model for dynamic input length inference.

        Args:
            feature_dim (int): Number of input features per month.

        Returns:
            Sequential: A stateless LSTM model.
        """
        with custom_object_scope({'Addons>SigmoidFocalCrossEntropy': tfa.losses.SigmoidFocalCrossEntropy()}):
            original_model = load_model(self.original_model_path)

        model = Sequential([
            LSTM(64, input_shape=(None, feature_dim), return_sequences=False),
            Dropout(0.3),
            Dense(2, activation='softmax')
        ])

        model.set_weights(original_model.get_weights())
        return model

    def load_project_data(self, project_id):
        """
        Load data for a specific project from its JSON file.

        Args:
            project_id (str): ID of the project to load.

        Returns:
            pd.DataFrame: DataFrame with project history data.
        """
        project_data_path = os.path.join(self.project_data_dir, f"{project_id}.json")
        
        try:
            with open(project_data_path, "r", encoding="utf-8") as file:
                project_history = json.load(file)
        except FileNotFoundError:
            print(f"No data found for project {project_id}")
            return None
        except Exception as e:
            print(f"Error loading project {project_id}: {str(e)}")
            return None
            
        history = project_history.get("history", [])
        if not history:
            print(f"No historical records available for project {project_id}")
            return None
            
        # Convert history to DataFrame
        df = pd.DataFrame(history)
        
        # Map month number to each entry if not already present
        if 'month' not in df.columns:
            df['month'] = range(1, len(df) + 1)
            
        return df

    def get_all_project_ids(self):
        """
        Get all project IDs from the JSON files in the project data directory.

        Returns:
            list: List of project IDs.
        """
        project_files = os.listdir(self.project_data_dir)
        return [f.split('.')[0] for f in project_files if f.endswith('.json')]

    def predict_all_projects(self, output_path):
        """
        Generate predictions for all projects using a stateless LSTM model.
        Each project's input sequence grows in length over time.

        Args:
            output_path (str): Path to save the JSON output file.

        Returns:
            dict: Prediction results for all projects.
        """
        results = {}
        project_ids = self.get_all_project_ids()
        
        if self.stateless_model is None:
            self.stateless_model = self.build_stateless_model(len(self.all_features))

        for project_id in tqdm(project_ids, desc="Processing projects"):
            project_data = self.load_project_data(project_id)
            if project_data is None:
                continue
                
            # Ensure we only use required features
            X_data = project_data[self.all_features].values
            
            # Normalize features
            X_data = self.scaler.fit_transform(X_data)
            
            feature_dim = X_data.shape[1]
            results[project_id] = []

            for i in range(1, len(X_data) + 1):  # Growing sequence length
                model_input = np.expand_dims(X_data[:i], axis=0)  # Shape: (1, i, feature_dim)

                y_pred = self.stateless_model.predict(model_input, batch_size=1, verbose=0)
                predicted_class = int(np.argmax(y_pred, axis=1)[0])
                confidence = float(np.max(y_pred, axis=1)[0])

                results[project_id].append({
                    "month": int(project_data.iloc[i - 1]['month']),
                    "status": predicted_class,                   # Changed from "prediction" to "status"
                    "confidence_score": confidence,              # Added to match second code
                    "p_grad": confidence if predicted_class == 1 else 1 - confidence
                })

        with open(os.path.join(parent_dir, output_path), 'w') as f:
            json.dump(results, f, indent=2)

        return results


def main():
    output_path = "project_predictions_stateless.json"
    
    predictor = StatelessProjectPredictor()
    results = predictor.predict_all_projects(output_path)
    
    print(f"Processed {len(results)} projects")
    print(f"Results saved to {output_path}")

if __name__ == "__main__":
    main()