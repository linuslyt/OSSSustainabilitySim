# Imports
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from keras.utils import to_categorical
from keras.models import load_model
from keras.models import Sequential
from keras.layers import LSTM, Dropout, Dense
from keras.optimizers import Adam

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from lime import lime_tabular
from tqdm import tqdm
import math
import os 
import json

from pathlib import Path
file_path = Path(__file__)  # Get the file path
parent_dir = file_path.parent.resolve()  # Get the absolute path of the parent directory
grand_parent_dir = file_path.parent.parent.resolve()  # Get the absolute path of the parent directory

# #  Get the current script directory
# current_dir = os.path.dirname(os.path.abspath(__file__))

def reshape_X(seq, n_timesteps):
    # N = len(seq) - n_timesteps - 1
    N = int(len(seq)/n_timesteps)
    nf = seq.shape[1]
    if N <= 0:
        raise ValueError('need more data.')
    new_seq = np.zeros((N, n_timesteps, nf))
    for i in range(N):
        new_seq[i, :, :] = seq[i:i+n_timesteps]
    return new_seq

def reshape_y(seq, n_timesteps):
    # N = len(seq) - n_timesteps - 1
    N = int(len(seq)/n_timesteps)
    nf = seq.shape[1]
    if N <= 0:
        raise ValueError('need more data.')
    new_seq = np.zeros((N, nf))
    for i in range(N):
        new_seq[i, :] = seq[i*n_timesteps]
    return new_seq

# Use N_TIMESTEPS as time of lookback for LSTM

metrics_path = os.path.join(parent_dir,'results/metrics.csv')
output_dir = os.path.join(parent_dir,'data/')

project_set = set()

with open(metrics_path, 'w') as f:
    f.write('month,accuracy,precision,recall,f1\n')
    
month_list = list(range(1,30))[::-1]
for N_TIMESTEPS in tqdm(month_list):

    df = pd.read_csv(os.path.join(parent_dir,'Reformat_data/{}.csv').format(N_TIMESTEPS))
    df.replace('Graduated', '1', inplace=True) 
    df.replace('Retired', '0', inplace=True) 
    

    data_columns =  ['active_devs','num_commits','num_files', 'num_emails', 'c_percentage', 'e_percentage', \
                     'inactive_c', 'inactive_e', 'c_nodes', 'c_edges', 'c_c_coef', 'c_mean_degree', 'c_long_tail', \
                    'e_nodes', 'e_edges', 'e_c_coef', 'e_mean_degree', 'e_long_tail']

    # print("Shape is: ",df.shape)
    target_columns = ['status']
    scaler = MinMaxScaler(feature_range=(-1, 1))
    X_original = scaler.fit_transform(df[data_columns].values)
    # print("Shape is: ",X_original.shape)
    X = reshape_X(X_original, n_timesteps=N_TIMESTEPS)
    y = reshape_y(df[target_columns].values, n_timesteps=N_TIMESTEPS)
    y = to_categorical(y.astype(int))
    
    
    # print("Shape is: ",X.shape)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    model = Sequential()
    model.add(LSTM(64, input_shape=(N_TIMESTEPS, len(data_columns))))
    model.add(Dropout(0.3))
    model.add(Dense(2, activation='softmax'))
    model.compile(loss='binary_crossentropy', optimizer=Adam())
    model.fit(X_train, y_train, batch_size=10, epochs=100, verbose=1)
    # if N_TIMESTEPS > 27:
    model.save('./models/model_{}.h5'.format(N_TIMESTEPS))

    y_pred = np.argmax(model.predict(X_test), axis=1)
    y_true = np.argmax(y_test, axis=1)
    metrics = classification_report(y_true, y_pred, output_dict = True)

    with open(metrics_path, 'a') as f:
        t_month = str(N_TIMESTEPS)
        acc = str(metrics['accuracy'])
        precision =  str(metrics['weighted avg']['precision'])
        recall = str(metrics['weighted avg']['recall'])
        f1 =  str(metrics['weighted avg']['f1-score'])
        things = [t_month,acc,precision,recall,f1]
        f.write(','.join(things))
        f.write('\n')

with open(metrics_path, 'r') as f:
    lines = f.readlines()

with open(metrics_path, 'w') as f:
    f.write('month,type,value\n')
    for line in lines[1:]:
        month,accuracy,precision,recall,f1 = line.split(',')
        f.write('{},w/ accuracy,{}\n'.format(month,accuracy))
        f.write('{},precision,{}\n'.format(month,precision))
        f.write('{},recall,{}\n'.format(month,recall))
        f.write('{},w/ f1,{}'.format(month,f1))
