import os
import json
import numpy as np
import pandas as pd
from tqdm import tqdm
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path

class ProjectPredictor:
    def __init__(self, model_dir, data_dir):
        """
        Initialize the predictor with model and data directories.
        
        Args:
            model_dir (str): Directory containing the LSTM models
            data_dir (str): Directory containing the reformat data CSV files
        """
        self.model_dir = model_dir
        self.data_dir = data_dir
        self.models = {}
        self.scaler = MinMaxScaler(feature_range=(-1, 1))
        self.data_columns = [
            'active_devs', 'num_commits', 'num_files', 'num_emails', 
            'c_percentage', 'e_percentage', 'inactive_c', 'inactive_e',
            'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
            'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail'
        ]

    def load_model(self, num_months):
        """Load LSTM model for specific month span if not already loaded."""
        if num_months not in self.models:
            model_path = os.path.join(self.model_dir, f"model_{num_months}.h5")
            if os.path.exists(model_path):
                self.models[num_months] = load_model(model_path)
            else:
                raise FileNotFoundError(f"No model found for {num_months} months")
        return self.models[num_months]

    def prepare_project_data(self, df, project_id, num_months):
        """
        Prepare data for a specific project and time span.
        
        Args:
            df (pd.DataFrame): DataFrame containing the data
            project_id (str): Project identifier
            num_months (int): Number of months to consider
            
        Returns:
            numpy.ndarray: Prepared input data for the model
        """
        # Filter data for specific project
        project_data = df[df['project'] == project_id][self.data_columns].values
        
        # Ensure we have enough data
        if len(project_data) < num_months:
            return None
            
        # Scale the data
        scaled_data = self.scaler.fit_transform(project_data)
        
        # Reshape for LSTM (1, time_steps, features)
        return scaled_data[-num_months:].reshape(1, num_months, len(self.data_columns))

    def predict_all_projects(self, output_path):
        """
        Generate predictions for all projects across all available time spans.
        
        Args:
            output_path (str): Path to save the JSON output file
        """
        results = {}
        
        # Process each month span (1 to 29 months)
        for num_months in tqdm(range(1, 30), desc="Processing month spans"):
            # Load data for current month span
            data_path = os.path.join(self.data_dir, f"{num_months}.csv")
            if not os.path.exists(data_path):
                continue
                
            df = pd.read_csv(data_path)
            model = self.load_model(num_months)
            
            # Get unique projects
            projects = df['project'].unique()
            
            # Process each project
            for project_id in tqdm(projects, desc=f"Processing projects for {num_months} months", leave=False):
                X = self.prepare_project_data(df, project_id, num_months)
                
                if X is not None:
                    # Generate prediction
                    y_pred = model.predict(X, verbose=0)
                    predicted_class = int(np.argmax(y_pred, axis=1)[0])
                    confidence = float(np.max(y_pred, axis=1)[0])
                    
                    # Initialize project entry if it doesn't exist
                    project_id_str = str(project_id)  # Convert project_id to string
                    if project_id_str not in results:
                        results[project_id_str] = []
                    
                    # Add prediction for current month span
                    results[project_id_str].append({
                        f"month_{num_months}": {
                            "prediction": predicted_class,
                            "confidence": confidence
                        }
                    })
        
        # Save results to JSON file
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        return results

file_path = Path(__file__)  # Get the file path
parent_dir = file_path.parent.resolve()  # Absolute path of the parent directory
grand_parent_dir = file_path.parent.parent.resolve()  # Absolute path of the grandparent directory

def main():
    # Define paths (adjust these as needed)
    model_dir = Path(__file__).parent / "results/models/"
    data_dir = os.path.join(grand_parent_dir, "Reformat_data")
    output_path = "project_predictions.json"
    
    # Initialize predictor
    predictor = ProjectPredictor(model_dir, data_dir)
    
    # Generate predictions
    results = predictor.predict_all_projects(output_path)
    
    # Print summary
    print(f"Processed {len(results)} projects")
    print(f"Results saved to {output_path}")

if __name__ == "__main__":
    main()