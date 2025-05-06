# Use official Python 3 image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Copy your app code and requirements
COPY . .

# Install Python dependencies using pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Flask runs on
EXPOSE 5000

# Run your app using python3 and cloud.py
CMD ["python3", "cloud.py"]
