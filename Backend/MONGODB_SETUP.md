# MongoDB Atlas Setup for Cyber-Health

This document provides instructions for setting up MongoDB Atlas with the Cyber-Health application.

## Prerequisites

- A MongoDB Atlas account (free tier is sufficient)
- Python 3.8 or higher
- Django 5.1.7 or higher

## Setup Steps

### 1. Create a MongoDB Atlas Cluster

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project (or use an existing one)
3. Build a new cluster (the free tier M0 is sufficient for development)
4. Choose your preferred cloud provider and region
5. Click "Create Cluster"

### 2. Configure Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Create a username and password (save these credentials)
4. Set appropriate privileges ("Read and Write to Any Database" is sufficient for development)
5. Click "Add User"

### 3. Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, you can add your current IP or use "0.0.0.0/0" to allow access from anywhere (not recommended for production)
4. Click "Confirm"

### 4. Get Connection String

1. In the Clusters view, click "Connect"
2. Select "Connect your application"
3. Choose "Python" as the driver and the appropriate version
4. Copy the connection string

### 5. Configure Environment Variables

Create a `.env` file in the root directory of your Django project with the following variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
MONGODB_NAME=cyber_health
```

Replace `<username>`, `<password>`, `<cluster-url>`, and `<dbname>` with your actual MongoDB Atlas credentials.

### 6. Install Required Packages

Run the following command to install the required packages:

```
pip install -r requirements.txt
```

### 7. Verify Connection

Start your Django application and check the logs to verify that the MongoDB connection is established successfully.

## Usage

The application now uses both Django's default database (SQLite/PostgreSQL) and MongoDB Atlas. User data is synchronized between both databases automatically.

- Django's ORM is used for authentication and core functionality
- MongoDB is used for flexible schema data and analytics

## Troubleshooting

- If you encounter connection issues, verify your network settings and credentials
- Check that your IP address is whitelisted in MongoDB Atlas Network Access
- Ensure that the MongoDB URI is correctly formatted with proper credentials
- Check the application logs for specific error messages