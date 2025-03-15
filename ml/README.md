# ML Directory - Sustainability Prediction Models

This directory contains the machine learning models used for sustainability predictions in Apache Incubator projects. Specifically, it includes the LSTM models developed as part of the simulation backend in the Django project.

## Reproduction Package
This is the reproduction package for the paper *Forecasting Apache Incubator Projects’ Sustainability With Socio-Technical Metrics*.

### Running Environment
- Python 3.7
- Required packages: `keras`, `lime`, `tqdm`, `pandas`, `numpy`, and `sklearn`

## Folder Structure

### `emails_raw/` & `commits_raw/`
These folders contain the raw data collected and used from ASF incubator projects, as described in the paper.

### `1_pre_processing/`
This folder contains scripts for processing both `emails_raw` and `commits_raw`. Execute the scripts in sequential order based on the prefix in the file names (from `0_` to `4_`).

### `2_monthly_features/`
This folder generates the monthly features used in the study. The scripts should be executed in the order of their file name prefixes (from `1_` to `3_`).

### `3_descriptive_stats/`
This folder contains scripts for computing descriptive statistics. The `target.txt` file lists the project IDs of all projects, excluding those still in incubation (with no outcome yet).

### `4_models/`
This folder contains implementations of the machine learning models used in the study:
- **LSTM Model:** Used to predict sustainability metrics.
- **LIME Model:** Used to interpret feature contributions by providing coefficients.

## Usage
To reproduce the results:
1. Ensure all dependencies are installed.
2. Follow the order of execution in each folder to process data, extract features, analyze statistics, and train models.

For further details, refer to the original paper.

