import os
import json
import pandas as pd
from pathlib import Path

class ProjectDataAggregator:
    def __init__(self):
        # Set up paths
        file_path = Path(__file__)
        parent_dir = file_path.parent.resolve()
        grand_parent_dir = file_path.parent.parent.parent.resolve()
        
        # Features
        self.all_features = ['month','active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
                             'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
                             'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail']
        
        self.data_dir = os.path.join(parent_dir, 'Reformat_data/')
        self.output_dir = os.path.join(parent_dir, 'project_data/')
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)

    def aggregate_project_data(self):
        # List to store all data
        all_data_list = []
        
        # Months to process
        month_list = list(range(1, 30))
        
        # Load and preprocess data from all months
        for month in month_list:
            # Load data
            df = pd.read_csv(os.path.join(self.data_dir, f'{month}.csv'))
            
            # Replace status values
            df.replace('Graduated', '1', inplace=True)
            df.replace('Retired', '0', inplace=True)
            
            # Convert status to integer
            df['status'] = df['status'].astype(int)
            
            # Append to list
            all_data_list.append(df)
        
        # Combine all data
        combined_df = pd.concat(all_data_list, ignore_index=True)
        
        # Remove duplicate rows based on project and month
        combined_df.drop_duplicates(subset=['project', 'month'], keep='last', inplace=True)
        
        # Group by project and sort by month
        grouped = combined_df.groupby('project')
        
        # Process each project
        for project, project_data in grouped:
            # Sort project data by month
            project_data_sorted = project_data.sort_values('month')
            
            # Prepare project data dictionary
            project_dict = {
                "project_id": project,
                "status": str(project_data_sorted['status'].iloc[-1]),  # Last status
                "num_months": len(project_data_sorted),
                "history": []
            }
            
            # Add feature history
            for _, row in project_data_sorted.iterrows():
                history_entry = {feature: row[feature] for feature in self.all_features}
                project_dict["history"].append(history_entry)
            
            # Write to JSON file
            output_file = os.path.join(self.output_dir, f'{project}.json')
            with open(output_file, 'w') as f:
                json.dump(project_dict, f, indent=4)
        
        print(f"Processed and saved JSON files for {len(grouped)} projects in {self.output_dir}")

# Run the aggregation
if __name__ == "__main__":
    aggregator = ProjectDataAggregator()
    aggregator.aggregate_project_data()