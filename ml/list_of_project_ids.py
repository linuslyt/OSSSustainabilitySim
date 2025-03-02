import json
from pathlib import Path

file_path = Path(__file__).parent /'list.json'  # Get the file path
# Load the JSON data from the file
with open(file_path, 'r') as file:
    data = json.load(file)

# Extract all project ids
project_ids = list(data.keys())

# Print the list of project ids
print(project_ids)