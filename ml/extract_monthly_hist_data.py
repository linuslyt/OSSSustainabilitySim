import os
import json
import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.utils import to_categorical  # Needed for one-hot encoding

from pathlib import Path
file_path = Path(__file__)  # Get the file path
parent_dir = file_path.parent.resolve()  # Get the absolute path of the parent directory
grand_parent_dir = file_path.parent.parent.resolve()  # Get the absolute path of the parent directory
output_dir = os.path.join(parent_dir,'data/')


def reshape_X(seq, n_timesteps):
    N = int(len(seq) / n_timesteps)
    nf = seq.shape[1]
    if N <= 0:
        raise ValueError('Need more data.')
    new_seq = np.zeros((N, n_timesteps, nf))
    for i in range(N):
        new_seq[i, :, :] = seq[i * n_timesteps:(i + 1) * n_timesteps]
    return new_seq

def reshape_y(seq, n_timesteps):
    N = int(len(seq) / n_timesteps)
    nf = seq.shape[1]
    if N <= 0:
        raise ValueError('Need more data.')
    new_seq = np.zeros((N, nf))
    for i in range(N):
        new_seq[i, :] = seq[i * n_timesteps]
    return new_seq

# Define storage directory
json_save_root = os.path.join(parent_dir, "json_data")
os.makedirs(json_save_root, exist_ok=True)

month_list = list(range(1, 30))[::-1]

for N_TIMESTEPS in tqdm(month_list):
    csv_path = os.path.join(grand_parent_dir, f'Reformat_data/{N_TIMESTEPS}.csv')

    if not os.path.exists(csv_path):
        print(f"Skipping {N_TIMESTEPS}.csv: File not found.")
        continue

    df = pd.read_csv(csv_path)

    # Replace categorical values for 'status'
    df.replace({'Graduated': '1', 'Retired': '0'}, inplace=True)

    # Define feature columns and target column
    data_columns = ['active_devs', 'num_commits', 'num_files', 'num_emails', 'c_percentage', 'e_percentage',
                    'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail',
                    'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail']
    target_columns = ['status']  # This is our graduation label

    # Extract raw (unscaled) feature data
    X_original = df[data_columns].values  # NO SCALING applied here
    X = reshape_X(X_original, n_timesteps=N_TIMESTEPS)
    
    # Extract status labels
    y = reshape_y(df[target_columns].values, n_timesteps=N_TIMESTEPS)

    # Convert y values to categorical (one-hot) format
    y = to_categorical(y.astype(int))

    # Define folder for this time step
    json_save_dir = os.path.join(json_save_root, f"N_{N_TIMESTEPS}")
    os.makedirs(json_save_dir, exist_ok=True)

    # Save each project as a separate JSON file
    for i, x_seq in enumerate(X):
        history_list = [
            dict(zip(data_columns, x_seq[timestep].tolist()))
            for timestep in range(N_TIMESTEPS)
        ]

        # Extract corresponding status from `y`
        status = str(int(np.argmax(y[i])))  # Convert one-hot encoded to int and then string

        project_entry = {
            "project_id": f"project_{i+1}",
            "status": status,
            "history": history_list
        }

        # Save each project entry as an individual JSON file
        json_filename = os.path.join(json_save_dir, f"project_{i+1}.json")
        with open(json_filename, "w") as json_file:
            json.dump(project_entry, json_file, indent=4)

    print(f"Saved {len(X)} JSON files in folder: {json_save_dir}")
