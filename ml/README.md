# ML Directory - Sustainability Prediction Models

This directory contains the machine learning training and inference code along with various data sources  used for sustainability predictions in Apache Incubator projects. Specifically, it includes the LSTM models developed as part of the simulation backend in the Django project.

## Reproduction Package

This is the reproduction package for the paper *Forecasting Apache Incubator Projects’ Sustainability With Socio-Technical Metrics*.

!! Note: We generated Reformat_data from the software artifacts provided by Yin et al at this website. <https://zenodo.org/records/4564072>

To replicate Yin et al.'s work, do the following:

- Set up the Python environment to use `python v3.12`, the latest version supported by Tensorflow/Keras.
  - We recommend using `pyenv`.
- Install the following package dependencies with pip: `numpy, pandas, scipy, matplotlib, scikit-learn, tensorflow, keras, lime, tqdm, networkx`.
  - We recommend doing this in a `venv`.
- **IMPORTANT**: Update any paths that reference `"/data/Apachembox/Final_code/{restOfPath}"` to use `"../{restOfPath}"` instead.
- Run the pipeline as instructed in the artifact's original `README`.
If you do this correctly, this should lead to the creation of `Reformat_data` and the 29 LSTM models.

### Running Environment

- Python 3.7
- Required packages: `keras`, `lime`, `tqdm`, `pandas`, `numpy`, and `sklearn`

## Folder Structure

### `Reformat_data/`

This folder contains preprocessed historical data for the ASF projects organized in 29 CSV files. Each project has is represented by several socio-technical features. This is the main source of data for training, inference and simulation.

### `project_data/`

This folder contains data for each project generated from the Reformat_data folder. Each project has a json file in this folder with the name project_id.json. Contained in these json files are the basic information about the project like, the project_id, its status (Graduated-1, Retired-0), number of months it stayed in incubation, and the historical data for each incubation month.

### `results/`

This folder contains all the 29 models created from following Yin et als manual to recreating their work, along with performance metrics to understand their accuracy.

It also contains these files:

### `gen_project_historical_pred.py`

This file when run, takes some data from `project_data` and generates a single json file `project_predictions_stateless.json` that contains the historical predictions for all projects.

### `generate_project_historical_data.py`

This python file generates `project_data`

### `training_with_weights_model8.py`

This file trains a custom lstm model that balances the prediction classes' data for improved inference. This is what we ended up using in the backend for simulation. The model generated from this python file is stored at `results/models` and it is called `modelWeighted_8.h5`

## Usage

To reproduce the results:

1. Ensure all dependencies are installed.
2. Execute the python files mentioned above starting from the `generate_project_historical_data.py` file, then the rest can be executed in any order.

For further details, refer to the original paper.
