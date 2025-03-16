import os
import json
import numpy as np
import pandas as pd
from tqdm import tqdm
from tensorflow.keras.models import load_model
from joblib import load
from pathlib import Path

class ProjectPredictor:
    def __init__(self, window_size=8):
        """
        Initialize the predictor with model and data directories.
        
        Args:
            window_size (int): Size of the sliding window to use for predictions
        """
        # Set up paths
        file_path = Path(__file__)
        parent_dir = file_path.parent.resolve()
        grand_parent_dir = file_path.parent.parent.parent.resolve()
        
        self.window_size = window_size
        self.models_dir = os.path.join(parent_dir, 'custom_functions/models_wo_padding/')
        self.data_dir = os.path.join(grand_parent_dir, 'Reformat_data/')
        
        # Features
        self.all_features = [
            'active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
            'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
            'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail'
        ]
        
        # Load model and scaler
        self.model = load_model(os.path.join(self.models_dir, 'lstm_wo_padding_model.h5'))
        self.scaler = load(os.path.join(self.models_dir, 'scaler.joblib'))

    def load_data(self):
        """
        Load and prepare all project data.
        
        Returns:
            pd.DataFrame: Combined DataFrame with all project data
        """
        all_data_list = []
        
        # Use the same months as in evaluation
        month_list = list(range(1, 30))
        
        for month in month_list:
            # Load data
            df = pd.read_csv(os.path.join(self.data_dir, f'{month}.csv'))
            
            # Replace status values if present (for validation)
            if 'status' in df.columns:
                df.replace('Graduated', '1', inplace=True)
                df.replace('Retired', '0', inplace=True)
                df['status'] = df['status'].astype(int)
            
            # Append to list
            all_data_list.append(df)
        
        # Combine all data
        combined_df = pd.concat(all_data_list, ignore_index=True)
        
        # Remove duplicate rows based on project and month
        combined_df.drop_duplicates(subset=['project', 'month'], keep='last', inplace=True)
        
        return combined_df

    def predict_all_projects(self, output_path):
        """
        Generate predictions for all projects using sliding window approach.
        
        Args:
            output_path (str): Path to save the JSON output file
        
        Returns:
            dict: Prediction results for all projects
        """
        # Load all data
        combined_df = self.load_data()
        results = {}
        
        # Group by project and process each project
        grouped = combined_df.groupby('project')
        
        for project, project_data in tqdm(grouped, desc="Processing projects"):
            # Sort project data by month
            project_data_sorted = project_data.sort_values('month')
            
            # Only process projects with at least window_size months
            if len(project_data_sorted) >= self.window_size:
                # Extract features
                X_data = project_data_sorted[self.all_features].values
                
                # Normalize features
                X_data = self.scaler.transform(X_data)
                
                # Initialize project results
                project_id_str = str(project)
                results[project_id_str] = []
                
                # Use sliding window approach to generate predictions
                for i in range(len(X_data) - self.window_size + 1):
                    window_data = X_data[i:i+self.window_size]
                    input_data = window_data.reshape(1, self.window_size, len(self.all_features))
                    
                    # Get corresponding month
                    current_month = project_data_sorted.iloc[i+self.window_size-1]['month']
                    
                    # Generate prediction
                    y_pred = self.model.predict(input_data, verbose=0)
                    predicted_class = int(np.argmax(y_pred, axis=1)[0])
                    confidence = float(np.max(y_pred, axis=1)[0])
                    
                    # Add prediction for current month
                    results[project_id_str].append({
                        "month": int(current_month),
                        "prediction": predicted_class,
                        "p_grad": confidence if predicted_class == 1 else 1 - confidence,
                        "confidence": confidence
                    })
            else:
                print(f"Skipping project {project}: Not enough data")
        # Save results to JSON file
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        return results

def main():
    # Define output path
    output_path = "project_predictions_w_p_grad.json"
    
    # Initialize predictor with window size of 8
    predictor = ProjectPredictor(window_size=8)
    
    # Generate predictions
    results = predictor.predict_all_projects(output_path)
    
    # Print summary
    print(f"Processed {len(results)} projects")
    print(f"Results saved to {output_path}")

if __name__ == "__main__":
    main()