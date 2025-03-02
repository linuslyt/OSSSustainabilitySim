# Specification of the Docker image for the OSSSIM backend
FROM python:3.10-slim

# Set the working directory
WORKDIR /app


# Copy the requirements file
COPY requirements.txt /app/

# Upgrade pip and install dependencies 
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt


# Copy the rest of the project 

COPY . /app/

# Expose the port Django runs on 
EXPOSE 8000

# Run migrations and start the sever 
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]


