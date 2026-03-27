# Architecture Documentation

## AgriPredictAI System Architecture

### Overview
AgriPredictAI is an AI-powered agricultural prediction and decision support system designed to help farmers make informed decisions about crop selection, pricing, and risk management.

### Core Components

#### 1. Backend (FastAPI)
The backend API server handles all business logic and serves data to the frontend.

**Key Modules:**
- `api/` - REST API endpoints organized by feature
- `engines/` - Core AI/ML engines for predictions and recommendations
- `services/` - External service integrations (weather, market data, notifications)
- `models/` - Database models
- `schemas/` - Data validation schemas
- `utils/` - Helper functions

#### 2. ML Models (`ml_models/`)
Trained machine learning models for:
- Price prediction
- Demand forecasting
- Risk assessment

#### 3. Data Pipeline (`pipelines/`)
ETL pipeline for:
- Data ingestion from external sources
- Data cleaning and validation
- Feature engineering
- Model training

#### 4. Frontend (React)
Dashboard UI for farmers to:
- View recommendations
- Check price predictions
- Run simulations
- Manage alerts

#### 5. Database
Stores:
- User profiles and farm data
- Historical market data
- Predictions and recommendations
- Alert configurations

### Data Flow
1. External data sources → Data Pipeline → Data cleaning → Feature Engineering
2. Features → ML Models → Predictions/Recommendations
3. Predictions → API → Frontend
4. User interactions → Database → Engines

### 11 Core Features
1. Market Price Prediction
2. Crop Feasibility Analysis
3. Profit Estimation
4. Risk Assessment
5. Crop Recommendations
6. AI Explanations
7. What-if Simulations
8. Alerts & Notifications
9. Dashboard
10. Data Management
11. User Profiles
